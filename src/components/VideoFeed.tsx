import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Coins, Eye, MessageCircle, Clock, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { generateDeviceFingerprint, generateSessionId } from "@/lib/deviceFingerprint";

interface VideoFeedProps {
  refreshTrigger?: number;
}

interface Video {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  thumbnail_url: string | null;
  youtube_url: string;
  tokens_spent: number;
  total_views: number;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  admin_notes: string | null;
  duration: number | null;
  profiles: {
    display_name: string | null;
    username: string | null;
  } | null;
}

const VideoFeed = ({ refreshTrigger }: VideoFeedProps) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const { toast } = useToast();
  const { user } = useAuth();
  const [deviceFingerprint] = useState(() => generateDeviceFingerprint());
  const [sessionId] = useState(() => generateSessionId());

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      // Fetch videos first, excluding user's own videos to prevent self-promotion abuse
      let query = supabase
        .from('videos')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      // Filter out user's own videos
      if (user) {
        query = query.neq('user_id', user.id);
      }
      
      const { data: videosData, error: videosError } = await query;

      if (videosError) throw videosError;

      if (!videosData || videosData.length === 0) {
        setVideos([]);
        setCategories([]);
        return;
      }

      // Fetch profiles for the video creators
      const userIds = [...new Set(videosData.map(video => video.user_id))];
      
      let profilesData = [];
      if (userIds.length > 0) {
        const { data, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, display_name, username')
          .in('user_id', userIds);

        if (profilesError) {
          console.error('Profiles fetch error:', profilesError);
        } else {
          profilesData = data || [];
        }
      }

      // Combine videos with their creator profiles
      const videosWithProfiles = videosData.map(video => ({
        ...video,
        profiles: profilesData.find(profile => profile.user_id === video.user_id) || null
      }));

      setVideos(videosWithProfiles);
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(videosData.map(video => video.category).filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error: any) {
      console.error('VideoFeed fetch error:', error);
      toast({
        title: "Error", 
        description: "Failed to load videos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [refreshTrigger]);

  // Apply category filter only (user's own videos already filtered in fetch)
  const filteredVideos = selectedCategory === "All Categories" 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const handleVideoClick = async (video: Video) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to watch videos and earn tokens.",
        variant: "destructive"
      });
      return;
    }

    // Check if user owns the video
    const { data: ownsVideo } = await supabase.rpc('user_owns_video', {
      _user_id: user.id,
      _video_id: video.id
    });

    if (ownsVideo) {
      toast({
        title: "Cannot Earn Tokens",
        description: "You cannot earn tokens from your own videos.",
        variant: "destructive"
      });
      return;
    }

    // Check for suspicious activity
    const { data: isSuspicious } = await supabase.rpc('is_suspicious_view', {
      _video_id: video.id,
      _device_fingerprint: deviceFingerprint
    });

    if (isSuspicious) {
      toast({
        title: "Suspicious Activity Detected",
        description: "Too many views from this device. Please try again later.",
        variant: "destructive"
      });
      return;
    }

    // Record the initial view
    const { data: existingView } = await supabase
      .from('video_views')
      .select('*')
      .eq('user_id', user.id)
      .eq('video_id', video.id)
      .eq('device_fingerprint', deviceFingerprint)
      .single();

    if (existingView && existingView.tokens_earned > 0) {
      toast({
        title: "Already Earned",
        description: "You've already earned tokens from this video.",
        variant: "destructive"
      });
      return;
    }

    const startTime = Date.now();

    // Open video in new tab
    const newWindow = window.open(video.youtube_url, '_blank');
    
    if (!newWindow) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups to watch videos and earn tokens.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Video Started",
      description: "Watch for 2 minutes to earn tokens!",
    });

    // Check if user returns after 2 minutes
    const checkInterval = setInterval(async () => {
      if (newWindow.closed) {
        clearInterval(checkInterval);
        const watchDuration = Math.floor((Date.now() - startTime) / 1000);
        
        if (watchDuration >= 120) { // 2 minutes
          const tokensToEarn = Math.ceil(video.tokens_spent * 0.1);
          
          // Award tokens
          const { error: updateError } = await supabase.rpc('update_token_balance', {
            _user_id: user.id,
            _amount: tokensToEarn,
            _type: 'earned',
            _description: `Watched video: ${video.title}`,
            _video_id: video.id
          });

          if (!updateError) {
            // Update the view record
            await supabase
              .from('video_views')
              .upsert({
                user_id: user.id,
                video_id: video.id,
                device_fingerprint: deviceFingerprint,
                session_id: sessionId,
                watch_duration: watchDuration,
                tokens_earned: tokensToEarn
              });

            toast({
              title: "Tokens Earned!",
              description: `You earned ${tokensToEarn} tokens for watching!`,
            });
          }
        } else {
          toast({
            title: "Watch Incomplete",
            description: "You need to watch for at least 2 minutes to earn tokens.",
            variant: "destructive"
          });
        }
      }
    }, 1000);

    // Clean up after 10 minutes max
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 600000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Promoted Videos</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="w-full h-48 bg-muted rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Promoted Videos</h2>
        <div className="flex gap-2 flex-wrap">
          <Badge 
            variant={selectedCategory === "All Categories" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory("All Categories")}
          >
            All Categories
          </Badge>
          {categories.map((category) => (
            <Badge 
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {filteredVideos.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {selectedCategory === "All Categories" 
              ? "No approved videos yet. Be the first to promote your video!"
              : `No videos found in ${selectedCategory} category.`
            }
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredVideos.map((video) => {
            const videoId = extractVideoId(video.youtube_url);
            const thumbnailUrl = video.thumbnail_url || 
              (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : 
               'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop');
            
            return (
              <Card 
                key={video.id} 
                className="group hover:shadow-elegant transition-all duration-300 cursor-pointer"
                onClick={() => handleVideoClick(video)}
              >
                <div className="relative">
                  <img 
                    src={thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg" />
                  <Button 
                    size="icon" 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-sm hover:bg-white/30"
                  >
                    <Play className="w-5 h-5 text-white fill-white" />
                  </Button>
                   <div className="absolute top-2 left-2 flex gap-2">
                    {video.category && (
                      <Badge className="bg-gradient-primary text-white border-0">
                        {video.category}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-2 mb-2">{video.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    by {video.profiles?.display_name || video.profiles?.username || 'Anonymous'}
                  </p>
                  
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {formatNumber(video.total_views)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {Math.floor(Math.random() * 50) + 10}
                        </div>
                      </div>
                    <div className="flex items-center gap-1 bg-success/10 px-2 py-1 rounded-full">
                      <Coins className="w-4 h-4 text-success" />
                      <span className="text-sm font-semibold text-success">+{Math.ceil(video.tokens_spent * 0.1)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Watch 2min to earn tokens</span>
                      <span className="text-muted-foreground">0/2:00</span>
                    </div>
                    <Progress value={0} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredVideos.length > 0 && (
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Videos
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoFeed;