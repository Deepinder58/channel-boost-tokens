import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Star, 
  Crown, 
  Gem,
  TrendingUp,
  Award
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface UserLevelData {
  level: string;
  experience_points: number;
  level_achieved_at: string;
}

interface LevelInfo {
  name: string;
  icon: any;
  color: string;
  minXP: number;
  maxXP: number;
  benefits: string[];
}

const LEVELS: Record<string, LevelInfo> = {
  bronze: {
    name: "Bronze Creator",
    icon: Award,
    color: "text-orange-600",
    minXP: 0,
    maxXP: 99,
    benefits: ["Standard token rates", "Basic analytics", "Community access"]
  },
  silver: {
    name: "Silver Creator", 
    icon: Star,
    color: "text-gray-500",
    minXP: 100,
    maxXP: 499,
    benefits: ["5% bonus tokens", "Enhanced analytics", "Priority support", "Silver badge"]
  },
  gold: {
    name: "Gold Creator",
    icon: Trophy,
    color: "text-yellow-500", 
    minXP: 500,
    maxXP: 1499,
    benefits: ["10% bonus tokens", "Advanced analytics", "Featured content", "Gold badge", "Monthly bonus"]
  },
  platinum: {
    name: "Platinum Creator",
    icon: Crown,
    color: "text-purple-500",
    minXP: 1500,
    maxXP: 4999,
    benefits: ["15% bonus tokens", "Premium analytics", "VIP support", "Platinum badge", "Weekly bonus", "Exclusive events"]
  },
  diamond: {
    name: "Diamond Creator",
    icon: Gem,
    color: "text-blue-500",
    minXP: 5000,
    maxXP: Infinity,
    benefits: ["20% bonus tokens", "Full analytics suite", "Dedicated manager", "Diamond badge", "Daily bonus", "Early access", "Revenue sharing"]
  }
};

const UserLevel = () => {
  const { user } = useAuth();
  const [levelData, setLevelData] = useState<UserLevelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserLevel();
    }
  }, [user]);

  const fetchUserLevel = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user level:', error);
        return;
      }

      if (data) {
        setLevelData(data);
      } else {
        // Create initial level record
        const { data: newLevel, error: insertError } = await supabase
          .from('user_levels')
          .insert([{ user_id: user.id, level: 'bronze', experience_points: 0 }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating user level:', insertError);
        } else {
          setLevelData(newLevel);
        }
      }
    } catch (error) {
      console.error('Error fetching user level:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLevel = () => {
    if (!levelData) return LEVELS.bronze;
    return LEVELS[levelData.level] || LEVELS.bronze;
  };

  const getNextLevel = () => {
    if (!levelData) return LEVELS.silver;
    
    const levels = Object.keys(LEVELS);
    const currentIndex = levels.indexOf(levelData.level);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= levels.length) return null;
    return LEVELS[levels[nextIndex]];
  };

  const getProgressToNextLevel = () => {
    if (!levelData) return 0;
    
    const currentLevel = getCurrentLevel();
    const nextLevel = getNextLevel();
    
    if (!nextLevel) return 100; // Max level reached
    
    const progressInCurrentLevel = levelData.experience_points - currentLevel.minXP;
    const levelRange = nextLevel.minXP - currentLevel.minXP;
    
    return Math.min((progressInCurrentLevel / levelRange) * 100, 100);
  };

  if (!user || loading) return null;

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const IconComponent = currentLevel.icon;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Creator Level
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Level Display */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <IconComponent className={`w-8 h-8 ${currentLevel.color}`} />
            <div>
              <Badge className={`bg-gradient-primary text-white border-0`}>
                {currentLevel.name}
              </Badge>
            </div>
          </div>
          
          <div className="text-2xl font-bold">
            {levelData?.experience_points || 0} XP
          </div>
        </div>

        {/* Progress to Next Level */}
        {nextLevel && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to {nextLevel.name}</span>
              <span>{levelData?.experience_points || 0} / {nextLevel.minXP}</span>
            </div>
            <Progress 
              value={getProgressToNextLevel()} 
              className="h-2" 
            />
            <p className="text-xs text-muted-foreground">
              {nextLevel.minXP - (levelData?.experience_points || 0)} XP needed for next level
            </p>
          </div>
        )}

        {/* Current Level Benefits */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Your Benefits:</h4>
          <div className="space-y-2">
            {currentLevel.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How to Earn XP */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <p className="font-medium">Earn XP by:</p>
          <div className="grid grid-cols-2 gap-2">
            <div>Watching videos: +1 XP</div>
            <div>Daily login: +2 XP</div>
            <div>Uploading videos: +10 XP</div>
            <div>Getting views: +5 XP</div>
            <div>Streak bonuses: +5 XP</div>
            <div>Referrals: +20 XP</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserLevel;