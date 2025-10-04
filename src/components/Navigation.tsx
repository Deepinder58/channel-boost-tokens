import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Play, User, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "./AuthModal";
import { ProfileModal } from "./ProfileModal";
import { supabase } from "@/integrations/supabase/client";

interface NavigationProps {
  onTabChange?: (tab: string) => void;
  activeTab?: string;
}

const Navigation = ({ onTabChange, activeTab }: NavigationProps) => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
      checkAdminStatus();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('token_balance')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setTokenBalance(data.token_balance);
    }
  };

  const checkAdminStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  return (
    <>
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="font-bold text-xl">VidRise</span>
              </div>
              
              {user && (
                <div className="hidden md:flex items-center gap-4">
                  <Button 
                    variant={activeTab === "dashboard" ? "default" : "ghost"} 
                    size="sm"
                    onClick={() => onTabChange?.("dashboard")}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant={activeTab === "promote" ? "default" : "ghost"} 
                    size="sm"
                    onClick={() => onTabChange?.("promote")}
                  >
                    Promote
                  </Button>
                  <Button 
                    variant={activeTab === "feed" ? "default" : "ghost"} 
                    size="sm"
                    onClick={() => onTabChange?.("feed")}
                  >
                    Feed
                  </Button>
                  {isAdmin && (
                    <Button 
                      variant={activeTab === "admin" ? "default" : "ghost"} 
                      size="sm"
                      onClick={() => onTabChange?.("admin")}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="flex items-center gap-2 bg-gradient-success px-3 py-1.5 rounded-full">
                    <Coins className="w-4 h-4 text-white" />
                    <span className="text-white font-semibold">{tokenBalance}</span>
                    <Badge variant="secondary" className="text-xs">tokens</Badge>
                  </div>
                  
                  <Button variant="outline" size="sm" onClick={() => setShowProfileModal(true)}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                  
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button onClick={() => setShowAuthModal(true)}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </>
  );
};

export default Navigation;