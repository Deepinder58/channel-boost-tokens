import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "./AuthModal";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for getting started",
    icon: Star,
    features: [
      "Earn tokens by watching videos",
      "Basic video promotion",
      "Standard support",
      "Community access"
    ],
    limitations: [
      "Limited to 50 tokens/day",
      "Basic analytics"
    ],
    buttonText: "Current Plan",
    popular: false
  },
  {
    name: "Creator",
    price: "$19",
    period: "/month",
    description: "For serious content creators",
    icon: Zap,
    features: [
      "Everything in Free",
      "Priority video promotion",
      "Advanced analytics",
      "Category targeting",
      "Priority support"
    ],
    limitations: [
      "Up to 500 tokens/day"
    ],
    buttonText: "Upgrade Now",
    popular: true
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For professional creators",
    icon: Crown,
    features: [
      "Everything in Creator",
      "Geographic targeting",
      "Custom audience insights",
      "Dedicated account manager",
      "API access"
    ],
    limitations: [
      "Unlimited tokens"
    ],
    buttonText: "Go Pro",
    popular: false
  }
];

const SubscriptionPlans = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleUpgradeClick = (planName: string) => {
    if (planName === 'Free') return; // Free plan is disabled
    
    if (user) {
      // User is logged in, could navigate to payment page
      // For now, we'll just show they're authenticated
      console.log(`User ${user.email} wants to upgrade to ${planName}`);
    } else {
      // User not logged in, show auth modal
      setShowAuthModal(true);
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock powerful features to accelerate your YouTube growth
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-primary shadow-strong scale-105' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-white border-0">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-2">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    plan.popular ? 'bg-gradient-primary' : 'bg-gradient-secondary'
                  }`}>
                    <IconComponent className={`w-6 h-6 ${plan.popular ? 'text-white' : 'text-primary'}`} />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-primary hover:shadow-glow' 
                        : plan.name === 'Free' 
                          ? 'variant-outline' 
                          : ''
                    }`}
                    variant={plan.name === 'Free' ? 'outline' : 'default'}
                    disabled={plan.name === 'Free'}
                    onClick={() => handleUpgradeClick(plan.name)}
                  >
                    {plan.buttonText}
                  </Button>

                  {plan.limitations.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {plan.limitations.map((limitation, index) => (
                        <div key={index}>• {limitation}</div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </section>
  );
};

export default SubscriptionPlans;