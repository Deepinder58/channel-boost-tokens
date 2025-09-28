import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Eye, 
  Coins, 
  Clock, 
  ExternalLink,
  TrendingUp,
  Calendar,
  RefreshCw,
  Heart,
  MessageCircle,
  Youtube
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VideoEngagement {
  id: string;
  title: string;
  youtube_url: string;
  thumbnail_url?: string;
  status: string;
  total_views: number;
  tokens_spent: number;
  created_at: string;
  category?: string;
  duration?: number;
  earned_tokens?: number;
  youtube_stats?: {
    view_count: number;
    like_count: number;
    comment_count: number;
    updated_at: string;
  };
}

const VideoEngagementList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [videos, setVideos] = useState<VideoEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingStats, setRefreshingStats] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserVideos();
    }
  }, [user]);

  const fetchUserVideos = async () => {
    if (!user) return;

    try {
      // Fetch user's videos
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (videosError) throw videosError;

      // Fetch total earned tokens per video from video_views
      const videosWithEarnings = await Promise.all(
        (videosData || []).map(async (video) => {
          const { data: viewsData } = await supabase
            .from('video_views')
            .select('tokens_earned')
            .eq('video_id', video.id);

          const totalEarned = viewsData?.reduce((sum, view) => sum + view.tokens_earned, 0) || 0;

          return {
            ...video,
            earned_tokens: totalEarned,
          };
        })
      );

      setVideos(videosWithEarnings);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch video engagement data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchYouTubeStats = async (videoId: string) => {
    if (!user) return;

    setRefreshingStats(videoId);
    try {
      const { data, error } = await supabase.functions.invoke('youtube-stats', {
        body: { video_id: videoId }
      });

      if (error) throw error;

      // Update the video in state with new YouTube stats
      setVideos(prevVideos => 
        prevVideos.map(video => 
          video.id === videoId 
            ? { 
                ...video, 
                total_views: data.view_count,
                youtube_stats: {
                  view_count: data.view_count,
                  like_count: data.like_count,
                  comment_count: data.comment_count,
                  updated_at: data.updated_at,
                }
              }
            : video
        )
      );

      toast({
        title: "Success",
        description: "YouTube statistics updated successfully",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch YouTube statistics",
        variant: "destructive",
      });
    } finally {
      setRefreshingStats(null);
    }
  };

  const refreshAllStats = async () => {
    for (const video of videos) {
      await fetchYouTubeStats(video.id);
      // Add a small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success text-white';
      case 'pending':
        return 'bg-warning text-white';
      case 'rejected':
        return 'bg-destructive text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Your Video Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (videos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Your Video Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <Play className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No videos uploaded yet</h3>
            <p className="text-muted-foreground mb-4">
              Start promoting your videos to see engagement metrics here.
            </p>
            <Button>Upload Your First Video</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Your Video Engagement ({videos.length} videos)
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAllStats}
            disabled={refreshingStats !== null}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshingStats ? 'animate-spin' : ''}`} />
            Refresh YouTube Stats
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {videos.map((video) => (
            <div 
              key={video.id} 
              className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm line-clamp-1">{video.title}</h4>
                    <Badge className={getStatusColor(video.status)}>
                      {video.status}
                    </Badge>
                    {video.category && (
                      <Badge variant="outline" className="text-xs">
                        {video.category}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Views:</span>
                      <span className="font-medium">{video.total_views.toLocaleString()}</span>
                      {video.youtube_stats && (
                        <Youtube className="w-3 h-3 text-red-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-warning" />
                      <span className="text-muted-foreground">Spent:</span>
                      <span className="font-medium text-warning">{video.tokens_spent}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-muted-foreground">Earned:</span>
                      <span className="font-medium text-success">{video.earned_tokens || 0}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{formatDuration(video.duration)}</span>
                    </div>
                    
                    {video.youtube_stats && (
                      <>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="text-muted-foreground">Likes:</span>
                          <span className="font-medium">{video.youtube_stats.like_count.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4 text-blue-500" />
                          <span className="text-muted-foreground">Comments:</span>
                          <span className="font-medium">{video.youtube_stats.comment_count.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Uploaded:</span>
                      <span className="font-medium">{formatDate(video.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchYouTubeStats(video.id)}
                    disabled={refreshingStats === video.id}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${refreshingStats === video.id ? 'animate-spin' : ''}`} />
                    Update Stats
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(video.youtube_url, '_blank')}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Watch
                  </Button>
                </div>
              </div>
              
              {/* Engagement ROI Indicator */}
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    ROI: {video.tokens_spent > 0 
                      ? `${Math.round(((video.earned_tokens || 0) / video.tokens_spent) * 100)}%`
                      : 'N/A'
                    }
                  </span>
                  <span className="text-muted-foreground">
                    Net: {(video.earned_tokens || 0) - video.tokens_spent > 0 ? '+' : ''}
                    {(video.earned_tokens || 0) - video.tokens_spent} tokens
                  </span>
                  {video.youtube_stats && (
                    <span className="text-xs text-muted-foreground">
                      Last updated: {new Date(video.youtube_stats.updated_at).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoEngagementList;