import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Check, ArrowLeft, Zap, Star, Crown, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TOKEN_PACKS = [
  {
    id: "basic",
    name: "Basic Pack",
    tokens: 500,
    price: 5.00,
    priceId: "price_1SCx6eCfYIqXLrHfkLCqMlIJ",
    description: "Perfect for getting started",
    icon: Coins,
    gradient: "from-blue-500 to-cyan-500",
    features: ["500 Tokens", "No expiration", "Instant delivery"],
  },
  {
    id: "standard",
    name: "Standard Pack",
    tokens: 1200,
    price: 10.00,
    priceId: "price_1SCx7PCfYIqXLrHfrDz3kg95",
    description: "Great value with bonus tokens",
    icon: Zap,
    gradient: "from-purple-500 to-pink-500",
    popular: true,
    features: ["1,200 Tokens", "20% bonus tokens", "Priority support", "No expiration"],
  },
  {
    id: "pro",
    name: "Pro Pack",
    tokens: 3000,
    price: 25.00,
    priceId: "price_1SCx8FCfYIqXLrHfVR8phNWm",
    description: "For serious creators",
    icon: Crown,
    gradient: "from-orange-500 to-red-500",
    features: ["3,000 Tokens", "Best value", "VIP support", "Exclusive perks"],
  },
  {
    id: "monthly",
    name: "Monthly Subscription",
    tokens: 2000,
    price: 15.00,
    priceId: "price_1SCxCCCfYIqXLrHf3Cc17R7Y",
    description: "Recurring tokens with benefits",
    icon: Star,
    gradient: "from-emerald-500 to-teal-500",
    recurring: true,
    features: ["2,000 Tokens/month", "Auto-renewal", "Cancel anytime", "Premium support"],
  },
];

const BuyTokens = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (pack: typeof TOKEN_PACKS[0]) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase tokens.",
        variant: "destructive",
      });
      return;
    }

    setLoading(pack.id);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          price_id: pack.priceId,
          pack_name: pack.name,
          tokens: pack.tokens,
          recurring: pack.recurring || false
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Redirecting to Checkout",
          description: "Opening Stripe checkout in a new tab...",
        });
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to create payment session",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Buy Token Packs
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose the perfect token pack for your needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOKEN_PACKS.map((pack) => {
            const Icon = pack.icon;
            return (
              <Card 
                key={pack.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-elegant ${
                  pack.popular ? 'border-primary shadow-lg scale-105' : ''
                }`}
              >
                {pack.popular && (
                  <Badge className="absolute top-4 right-4 bg-gradient-primary text-white border-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                )}
                
                <CardHeader>
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${pack.gradient} flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{pack.name}</CardTitle>
                  <CardDescription>{pack.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">${pack.price}</span>
                      {pack.recurring && (
                        <span className="text-muted-foreground">/month</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Coins className="w-5 h-5 text-success" />
                      <span className="text-xl font-semibold text-success">
                        {pack.tokens.toLocaleString()} Tokens
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {pack.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-success" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handlePurchase(pack)}
                    disabled={loading === pack.id}
                    className="w-full"
                    variant={pack.popular ? "default" : "outline"}
                  >
                    {loading === pack.id ? (
                      "Processing..."
                    ) : (
                      <>
                        {pack.recurring ? "Subscribe Now" : "Buy Now"}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Check className="w-5 h-5 text-success" />
            <span>Secure payment powered by Stripe</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Check className="w-5 h-5 text-success" />
            <span>Instant token delivery after payment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyTokens;
