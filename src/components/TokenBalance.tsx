import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Coins, Plus, TrendingUp, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TokenBalance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [todayEarned, setTodayEarned] = useState(0);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTodayEarnings();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setProfile(data);
  };

  const fetchTodayEarnings = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    const { data } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('type', 'earned')
      .gte('created_at', today);

    const total = data?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
    setTodayEarned(total);
  };

  const handleBuyTokens = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { amount: 1000 } // $10 for 100 tokens
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!profile) return null;

  const dailyGoal = 200;
  const progressPercent = (todayEarned / dailyGoal) * 100;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="bg-gradient-success border-0 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Available Tokens</p>
              <p className="text-3xl font-bold">{profile.token_balance}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Coins className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <Button variant="secondary" size="sm" className="w-full" onClick={handleBuyTokens}>
              <Plus className="w-4 h-4 mr-2" />
              Buy More Tokens
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Tokens Earned Today</p>
              <p className="text-2xl font-bold text-success">+{todayEarned}</p>
            </div>
            <div className="bg-success/10 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Daily Goal</span>
              <span>{todayEarned}/{dailyGoal}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Videos Watched</p>
              <p className="text-2xl font-bold">{profile.videos_watched}</p>
            </div>
            <div className="bg-info/10 p-3 rounded-full">
              <Eye className="w-6 h-6 text-info" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Keep watching to earn more tokens!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenBalance;