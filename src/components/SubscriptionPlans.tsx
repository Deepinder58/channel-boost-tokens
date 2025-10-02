import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "./AuthModal";
import { useState } from "react";

const plans = [
  {
    name: "Basic Pack",
    price: "$5",
    period: "",
    description: "Perfect for getting started",
    icon: Star,
    features: [
      "500 tokens",
      "Basic video promotion",
      "Community exposure",
      "Standard support"
    ],
    limitations: [],
    buttonText: "Get Basic Pack",
    popular: false,
    isOneTime: true
  },
  {
    name: "Standard Pack",
    price: "$10", 
    period: "",
    description: "Great value with bonus tokens",
    icon: Zap,
    features: [
      "1,200 tokens",
      "Enhanced visibility",
      "Bonus tokens included",
      "Priority support"
    ],
    limitations: [],
    buttonText: "Get Standard Pack",
    popular: true,
    isOneTime: true
  },
  {
    name: "Pro Pack",
    price: "$25",
    period: "",
    description: "For serious creators",
    icon: Crown,
    features: [
      "3,500 tokens",
      "Biggest bonus included",
      "Priority promotion",
      "Advanced analytics"
    ],
    limitations: [],
    buttonText: "Get Pro Pack", 
    popular: false,
    isOneTime: true
  },
  {
    name: "Monthly Subscription",
    price: "$15",
    period: "/month",
    description: "Recurring tokens with benefits",
    icon: Crown,
    features: [
      "2,000 tokens monthly",
      "Auto-credited tokens",
      "Priority promotion",
      "Premium support",
      "Advanced analytics"
    ],
    limitations: [],
    buttonText: "Subscribe Now",
    popular: false,
    isOneTime: false
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

        <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
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