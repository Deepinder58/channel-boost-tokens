import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Dashboard from "@/components/Dashboard";
import VideoFeed from "@/components/VideoFeed";
import SubscriptionPlans from "@/components/SubscriptionPlans";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  if (activeTab === "home") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <Hero />
        <div className="container mx-auto px-4 py-16">
          <SubscriptionPlans />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-md mx-auto">
            <TabsTrigger value="home" onClick={() => setActiveTab("home")}>Home</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="promote">Promote</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <Dashboard />
          </TabsContent>

          <TabsContent value="feed" className="space-y-8">
            <VideoFeed />
          </TabsContent>

          <TabsContent value="promote" className="space-y-8">
            <div className="text-center py-16">
              <h2 className="text-3xl font-bold mb-4">Promote Your Videos</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Upload your videos and use tokens to promote them to other creators in our community
              </p>
              <Button size="lg" className="bg-gradient-primary hover:shadow-glow">
                Upload Video
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
