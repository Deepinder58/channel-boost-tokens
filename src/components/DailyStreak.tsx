import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Flame, 
  Gift, 
  Trophy,
  Sparkles 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StreakData {
  tokens_awarded: number;
  current_streak: number;
  longest_streak: number;
  is_new_record: boolean;
}

const DailyStreak = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasClaimedToday, setHasClaimedToday] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStreakData();
    }
  }, [user]);

  const fetchStreakData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('daily_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching streak data:', error);
        return;
      }

      if (data) {
        const today = new Date().toDateString();
        const lastLogin = new Date(data.last_login_date).toDateString();
        setHasClaimedToday(today === lastLogin);
        
        setStreakData({
          tokens_awarded: 0,
          current_streak: data.current_streak,
          longest_streak: data.longest_streak,
          is_new_record: data.current_streak === data.longest_streak
        });
      }
    } catch (error) {
      console.error('Error fetching streak data:', error);
    }
  };

  const claimDailyBonus = async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('check_daily_streak', {
        _user_id: user.id
      });

      if (error) {
        console.error('Error claiming daily bonus:', error);
        toast({
          title: "Error",
          description: "Failed to claim daily bonus. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Parse the JSON response safely
      const streakResult = data as unknown as StreakData;
      setStreakData(streakResult);
      setHasClaimedToday(true);

      if (streakResult.tokens_awarded > 0) {
        toast({
          title: "Daily Bonus Claimed! 🎉",
          description: `You earned ${streakResult.tokens_awarded} tokens! Current streak: ${streakResult.current_streak} day${streakResult.current_streak !== 1 ? 's' : ''}`,
        });

        if (streakResult.is_new_record) {
          toast({
            title: "New Record! 🏆",
            description: `Congratulations! You've reached your longest streak of ${streakResult.current_streak} days!`,
          });
        }
      } else {
        toast({
          title: "Already Claimed",
          description: "You've already claimed your daily bonus today. Come back tomorrow!",
        });
      }
    } catch (error) {
      console.error('Error claiming daily bonus:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStreakBonus = (streak: number) => {
    if (streak >= 7) return 50;
    if (streak >= 3) return 15;
    return 5;
  };

  const getNextMilestone = (streak: number) => {
    if (streak < 3) return 3;
    if (streak < 7) return 7;
    return Math.ceil((streak + 1) / 7) * 7;
  };

  if (!user) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Daily Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {streakData && (
          <>
            {/* Current Streak Display */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                <span className="text-3xl font-bold">{streakData.current_streak}</span>
                <span className="text-muted-foreground">day{streakData.current_streak !== 1 ? 's' : ''}</span>
              </div>
              
              {streakData.is_new_record && streakData.current_streak > 1 && (
                <Badge className="bg-gradient-primary text-white">
                  <Trophy className="w-4 h-4 mr-1" />
                  Personal Best!
                </Badge>
              )}
            </div>

            {/* Progress to Next Milestone */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to next milestone</span>
                <span>{streakData.current_streak} / {getNextMilestone(streakData.current_streak)}</span>
              </div>
              <Progress 
                value={(streakData.current_streak / getNextMilestone(streakData.current_streak)) * 100} 
                className="h-2" 
              />
              <p className="text-xs text-muted-foreground">
                Next bonus: +{getStreakBonus(getNextMilestone(streakData.current_streak))} tokens
              </p>
            </div>

            {/* Longest Streak */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Longest Streak</span>
              </div>
              <span className="font-semibold">{streakData.longest_streak} days</span>
            </div>
          </>
        )}

        {/* Claim Button */}
        <Button 
          onClick={claimDailyBonus}
          disabled={loading || hasClaimedToday}
          className="w-full"
          variant={hasClaimedToday ? "outline" : "default"}
        >
          {loading ? (
            "Checking..."
          ) : hasClaimedToday ? (
            <>
              <Gift className="w-4 h-4 mr-2" />
              Claimed Today ✓
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Claim Daily Bonus
            </>
          )}
        </Button>

        {/* Streak Rewards Info */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <p className="font-medium">Streak Rewards:</p>
          <div className="grid grid-cols-2 gap-2">
            <div>Daily: +5 tokens</div>
            <div>3 days: +15 tokens</div>
            <div>7 days: +50 tokens</div>
            <div>First login: +10 tokens</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyStreak;