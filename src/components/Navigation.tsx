import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Play, User, Settings, LogOut } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-bold text-xl">CreatorBoost</span>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" size="sm">Dashboard</Button>
              <Button variant="ghost" size="sm">Promote</Button>
              <Button variant="ghost" size="sm">Feed</Button>
              <Button variant="ghost" size="sm">Analytics</Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gradient-success px-3 py-1.5 rounded-full">
              <Coins className="w-4 h-4 text-white" />
              <span className="text-white font-semibold">1,247</span>
              <Badge variant="secondary" className="text-xs">tokens</Badge>
            </div>
            
            <Button variant="outline" size="sm">
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            
            <Button variant="ghost" size="sm">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;