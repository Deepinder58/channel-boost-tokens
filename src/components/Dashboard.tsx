import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  Play, 
  Coins, 
  Upload, 
  Target,
  Calendar,
  Award
} from "lucide-react";
import TokenBalance from "./TokenBalance";
import VideoEngagementList from "./VideoEngagementList";
import DailyStreak from "./DailyStreak";
import ReferralSystem from "./ReferralSystem";
import UserLevel from "./UserLevel";
import { VideoUploadModal } from "./VideoUploadModal";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string>("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, username')
          .eq('user_id', user.id)
          .single();
        
        setDisplayName(profile?.display_name || profile?.username || "User");
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleVideoUploaded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {displayName}!</h1>
          <p className="text-muted-foreground">Here's your creator dashboard overview</p>
        </div>
        <Button 
          className="bg-gradient-primary hover:shadow-glow"
          onClick={() => setIsUploadModalOpen(true)}
        >
          <Upload className="w-4 h-4 mr-2" />
          Promote New Video
        </Button>
      </div>

      {/* Token Balance Cards */}
      <TokenBalance />

      {/* Engagement Features */}
      <div className="grid lg:grid-cols-3 gap-6">
        <DailyStreak />
        <ReferralSystem />
        <UserLevel />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm">Video "React Tutorial" earned 45 tokens</span>
            </div>
            <span className="text-xs text-muted-foreground">2h ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">Watched 12 videos from other creators</span>
            </div>
            <span className="text-xs text-muted-foreground">4h ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <span className="text-sm">Promoted video reached 1K views</span>
            </div>
            <span className="text-xs text-muted-foreground">1d ago</span>
          </div>
        </CardContent>
      </Card>

      {/* Video Engagement List */}
      <VideoEngagementList key={refreshKey} />

      {/* Video Upload Modal */}
      <VideoUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onVideoUploaded={handleVideoUploaded}
      />
    </div>
  );
};

export default Dashboard;