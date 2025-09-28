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

const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Alex!</h1>
          <p className="text-muted-foreground">Here's your creator dashboard overview</p>
        </div>
        <Button className="bg-gradient-primary hover:shadow-glow">
          <Upload className="w-4 h-4 mr-2" />
          Promote New Video
        </Button>
      </div>

      {/* Token Balance Cards */}
      <TokenBalance />

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">47.2K</p>
                <p className="text-xs text-success">+12% this week</p>
              </div>
              <Play className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Subscribers</p>
                <p className="text-2xl font-bold">1.8K</p>
                <p className="text-xs text-success">+8% this week</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engagement</p>
                <p className="text-2xl font-bold">94%</p>
                <p className="text-xs text-success">+3% this week</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">$342</p>
                <p className="text-xs text-success">+15% this week</p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Goals */}
      <div className="grid lg:grid-cols-2 gap-8">
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Goals & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly Token Goal</span>
                <span>3,247 / 5,000</span>
              </div>
              <Progress value={64.9} className="h-2" />
              <p className="text-xs text-muted-foreground">65% complete - You're doing great!</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Videos Watched This Week</span>
                <span>89 / 100</span>
              </div>
              <Progress value={89} className="h-2" />
              <p className="text-xs text-muted-foreground">11 more to unlock bonus reward</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Badge className="bg-gradient-success text-white border-0 p-2 text-center">
                🏆 Top Watcher
              </Badge>
              <Badge className="bg-gradient-primary text-white border-0 p-2 text-center">
                🎯 Goal Crusher
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Engagement List */}
      <VideoEngagementList />
    </div>
  );
};

export default Dashboard;