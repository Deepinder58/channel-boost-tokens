import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Share2, 
  Users, 
  Copy, 
  Check,
  Gift,
  UserPlus
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReferralStats {
  total_referrals: number;
  pending_referrals: number;
  completed_referrals: number;
  tokens_earned: number;
}

const ReferralSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string>("");
  const [stats, setStats] = useState<ReferralStats>({
    total_referrals: 0,
    pending_referrals: 0,
    completed_referrals: 0,
    tokens_earned: 0
  });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      generateReferralCode();
      fetchReferralStats();
    }
  }, [user]);

  const generateReferralCode = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('generate_referral_code', {
        _user_id: user.id
      });

      if (error) {
        console.error('Error generating referral code:', error);
        return;
      }

      setReferralCode(data || '');
    } catch (error) {
      console.error('Error generating referral code:', error);
    }
  };

  const fetchReferralStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id);

      if (error) {
        console.error('Error fetching referral stats:', error);
        return;
      }

      const stats = data.reduce((acc, referral) => ({
        total_referrals: acc.total_referrals + 1,
        pending_referrals: acc.pending_referrals + (referral.status === 'pending' ? 1 : 0),
        completed_referrals: acc.completed_referrals + (referral.status === 'completed' ? 1 : 0),
        tokens_earned: acc.tokens_earned + referral.tokens_awarded
      }), {
        total_referrals: 0,
        pending_referrals: 0,
        completed_referrals: 0,
        tokens_earned: 0
      });

      setStats(stats);
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    }
  };

  const copyReferralLink = async () => {
    if (!referralCode) return;

    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive"
      });
    }
  };

  const shareReferralLink = async () => {
    if (!referralCode) return;

    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    const shareText = `Join me on this amazing creator platform and we both get bonus tokens! Use my referral link: ${referralLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join the Creator Platform',
          text: shareText,
          url: referralLink
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying
      copyReferralLink();
    }
  };

  if (!user) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          Referral Program
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Referral Code Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input 
              value={referralCode ? `${window.location.origin}?ref=${referralCode}` : ''}
              readOnly
              placeholder="Generating your referral link..."
              className="flex-1"
            />
            <Button
              onClick={copyReferralLink}
              variant="outline"
              size="icon"
              disabled={!referralCode}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          
          <Button 
            onClick={shareReferralLink}
            className="w-full"
            disabled={!referralCode}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Referral Link
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total_referrals}</div>
            <div className="text-sm text-muted-foreground">Total Referrals</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.tokens_earned}</div>
            <div className="text-sm text-muted-foreground">Tokens Earned</div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-green-500" />
              <span className="text-sm">Completed Referrals</span>
            </div>
            <Badge variant="outline" className="text-green-600">
              {stats.completed_referrals}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-orange-500" />
              <span className="text-sm">Pending Referrals</span>
            </div>
            <Badge variant="outline" className="text-orange-600">
              {stats.pending_referrals}
            </Badge>
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <p className="font-medium">How it works:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Share your referral link with friends</li>
            <li>When they sign up, you both get 25 bonus tokens</li>
            <li>When they make their first purchase, you get an additional 50 tokens</li>
            <li>No limit on referrals - invite as many friends as you want!</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralSystem;