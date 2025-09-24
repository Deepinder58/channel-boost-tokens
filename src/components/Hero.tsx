import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Users, Coins, TrendingUp, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10" />
      
      <div className="container mx-auto px-4 py-20 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-2">
              <Badge className="bg-gradient-primary text-white border-0 px-4 py-2">
                🚀 Join 10K+ Creators
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Grow Your
                <span className="bg-gradient-primary bg-clip-text text-transparent"> YouTube </span>
                Channel Together
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Earn tokens by watching videos, promote your content, and build a thriving creator community.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                <Play className="w-5 h-5 mr-2 fill-white" />
                Start Promoting
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-success mb-3 mx-auto">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm text-muted-foreground">Active Creators</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-primary mb-3 mx-auto">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold">2M+</div>
                <div className="text-sm text-muted-foreground">Tokens Earned</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-secondary mb-3 mx-auto">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold">95%</div>
                <div className="text-sm text-muted-foreground">Growth Rate</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-strong">
              <img 
                src={heroImage} 
                alt="YouTube creators collaborating and growing together"
                className="w-full h-auto animate-float"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-elegant p-4 animate-bounce-slow">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-success" />
                <span className="font-semibold text-success">+50 tokens</span>
              </div>
            </div>
            
            <div className="absolute bottom-4 -left-4 bg-white rounded-lg shadow-elegant p-4 animate-pulse-slow">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-semibold">+1.2K views</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;