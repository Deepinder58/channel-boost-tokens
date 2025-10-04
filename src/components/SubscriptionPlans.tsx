import { Button } from "@/components/ui/button";
import * as PricingCard from "@/components/ui/pricing-card";
import { CheckCircle2, Star, Zap, Crown } from "lucide-react";
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
              <PricingCard.Card key={plan.name} className="md:min-w-[260px]">
                <PricingCard.Header>
                  <PricingCard.Plan>
                    <PricingCard.PlanName>
                      <IconComponent />
                      <span className="text-muted-foreground">{plan.name}</span>
                    </PricingCard.PlanName>
                    {plan.popular && (
                      <PricingCard.Badge>Most Popular</PricingCard.Badge>
                    )}
                  </PricingCard.Plan>
                  <PricingCard.Price>
                    <PricingCard.MainPrice>{plan.price}</PricingCard.MainPrice>
                    <PricingCard.Period>{plan.period}</PricingCard.Period>
                  </PricingCard.Price>
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full font-semibold"
                    disabled={plan.name === 'Free'}
                    onClick={() => handleUpgradeClick(plan.name)}
                  >
                    {plan.buttonText}
                  </Button>
                </PricingCard.Header>

                <PricingCard.Body>
                  <PricingCard.Description>
                    {plan.description}
                  </PricingCard.Description>
                  <PricingCard.List>
                    {plan.features.map((feature, index) => (
                      <PricingCard.ListItem key={index}>
                        <CheckCircle2 className="text-foreground h-4 w-4" aria-hidden="true" />
                        <span>{feature}</span>
                      </PricingCard.ListItem>
                    ))}
                  </PricingCard.List>
                </PricingCard.Body>
              </PricingCard.Card>
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