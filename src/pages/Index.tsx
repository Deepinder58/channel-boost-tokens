import { useState } from "react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Dashboard from "@/components/Dashboard";
import VideoFeed from "@/components/VideoFeed";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import { AdminPanel } from "@/components/AdminPanel";
import { VideoUploadModal } from "@/components/VideoUploadModal";
import { useAuth } from "@/hooks/useAuth";
import { AuthProvider } from "@/hooks/useAuth";

const AppContent = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { user } = useAuth();

  const handleVideoUploaded = () => {
    // Refresh the dashboard or feed if needed
    if (activeTab === "feed") {
      window.location.reload();
    }
  };

  if (!user && activeTab === "home") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation onTabChange={setActiveTab} activeTab={activeTab} />
        <Hero />
        <div className="container mx-auto px-4 py-16">
          <SubscriptionPlans />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation onTabChange={setActiveTab} activeTab={activeTab} />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Welcome to CreatorBoost</h2>
          <p className="text-muted-foreground mb-8">
            Please sign in to access the dashboard and start earning tokens
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation onTabChange={setActiveTab} activeTab={activeTab} />
      <div className="container mx-auto px-4 py-8">
        {activeTab === "home" && <Dashboard />}
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "feed" && <VideoFeed />}
        {activeTab === "admin" && <AdminPanel />}
        {activeTab === "promote" && (
          <div className="text-center py-16">
            <h2 className="text-3xl font-bold mb-4">Promote Your Videos</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload your videos and use tokens to promote them to other creators in our community
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:shadow-glow"
              onClick={() => setShowUploadModal(true)}
            >
              Upload Video
            </Button>
          </div>
        )}
      </div>

      <VideoUploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onVideoUploaded={handleVideoUploaded}
      />
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
