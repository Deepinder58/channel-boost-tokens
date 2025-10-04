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
import { FeatureGrid, type Feature } from "@/components/ui/feature-grid";
import LoaderGrid from "@/components/ui/loader-grid";
import * as PricingCard from "@/components/ui/pricing-card";

// Platform features data
const platformFeatures: Feature[] = [
  {
    imageSrc: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop",
    imageAlt: "Watch videos icon",
    title: "Watch & Earn Tokens",
    description: "Earn tokens by watching and engaging with videos from other creators. Build your token balance to promote your own content and grow your channel.",
    href: "#",
  },
  {
    imageSrc: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=200&h=200&fit=crop",
    imageAlt: "Promote videos icon",
    title: "Promote Your Videos",
    description: "Use your earned tokens to promote your videos to thousands of engaged creators. Get more views, subscribers, and grow your YouTube channel faster.",
    href: "#",
  },
  {
    imageSrc: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200&h=200&fit=crop",
    imageAlt: "Community icon",
    title: "Join the Community",
    description: "Connect with 10K+ YouTube creators who are growing together. Share insights, collaborate, and support each other's content journey.",
    href: "#",
  },
  {
    imageSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop",
    imageAlt: "Track progress icon",
    title: "Track Your Progress",
    description: "Monitor your daily streaks, token earnings, and video performance. Level up your account and unlock exclusive benefits as you grow.",
    href: "#",
  },
];

const AppContent = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user } = useAuth();

  const handleVideoUploaded = () => {
    // Trigger refresh for the video feed
    setRefreshTrigger(Date.now());
  };

  if (!user && activeTab === "home") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation onTabChange={setActiveTab} activeTab={activeTab} />
        <Hero />
        
        {/* Features Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              One platform to grow your YouTube channel faster
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
              Whether you want to earn tokens by watching videos or promote your own content, our flexible suite of solutions has you covered.
            </p>
          </div>
          
          <FeatureGrid features={platformFeatures} className="mb-16" />
          
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
        {activeTab === "feed" && <VideoFeed refreshTrigger={refreshTrigger} />}
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
