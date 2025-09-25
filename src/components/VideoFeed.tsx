import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Coins, Eye, ThumbsUp, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      // Fetch videos
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (videosError) throw videosError;

      // Fetch profiles for the video creators
      const userIds = videosData?.map(video => video.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, username')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Combine videos with their creator profiles
      const videosWithProfiles = videosData?.map(video => ({
        ...video,
        profiles: profilesData?.find(profile => profile.user_id === video.user_id) || null
      })) || [];

      setVideos(videosWithProfiles);
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(videosData?.map(video => video.category).filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error: any) {
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

  const filteredVideos = selectedCategory === "All Categories" 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleVideoClick = (video: Video) => {
    window.open(video.youtube_url, '_blank');
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
                  {video.category && (
                    <Badge className="absolute top-2 left-2 bg-gradient-primary text-white border-0">
                      {video.category}
                    </Badge>
                  )}
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
                        {video.total_views}
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        98%
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-success/10 px-2 py-1 rounded-full">
                      <Coins className="w-4 h-4 text-success" />
                      <span className="text-sm font-semibold text-success">+{Math.ceil(video.tokens_spent * 0.1)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Watch 30s to earn tokens</span>
                      <span className="text-muted-foreground">0/30s</span>
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