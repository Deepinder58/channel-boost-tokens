import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Coins, Eye, ThumbsUp, Clock } from "lucide-react";

const mockVideos = [
  {
    id: 1,
    title: "10 Tips for Growing Your YouTube Channel Fast",
    creator: "TechCreator101",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop",
    duration: "8:45",
    reward: 15,
    views: "2.3K",
    category: "Technology"
  },
  {
    id: 2,
    title: "Amazing Cooking Hacks You Need to Know",
    creator: "ChefMasterClass",
    thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=225&fit=crop",
    duration: "5:32",
    reward: 12,
    views: "1.8K",
    category: "Food"
  },
  {
    id: 3,
    title: "Beginner's Guide to Digital Art",
    creator: "ArtisticMind",
    thumbnail: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=225&fit=crop",
    duration: "12:18",
    reward: 20,
    views: "945",
    category: "Art"
  },
  {
    id: 4,
    title: "Travel Photography Tips for Beginners",
    creator: "WanderlustLens",
    thumbnail: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=225&fit=crop",
    duration: "7:22",
    reward: 18,
    views: "3.1K",
    category: "Travel"
  }
];

const VideoFeed = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Promoted Videos</h2>
        <div className="flex gap-2">
          <Badge variant="outline">All Categories</Badge>
          <Badge variant="outline">Technology</Badge>
          <Badge variant="outline">Food</Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {mockVideos.map((video) => (
          <Card key={video.id} className="group hover:shadow-elegant transition-all duration-300 cursor-pointer">
            <div className="relative">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg" />
              <Button 
                size="icon" 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-sm hover:bg-white/30"
              >
                <Play className="w-5 h-5 text-white fill-white" />
              </Button>
              <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-white text-xs">
                {video.duration}
              </div>
              <Badge className="absolute top-2 left-2 bg-gradient-primary text-white border-0">
                {video.category}
              </Badge>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold line-clamp-2 mb-2">{video.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">by {video.creator}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {video.views}
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    98%
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-success/10 px-2 py-1 rounded-full">
                  <Coins className="w-4 h-4 text-success" />
                  <span className="text-sm font-semibold text-success">+{video.reward}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Watch 30s to earn tokens</span>
                  <span className="text-muted-foreground">0/30s</span>
                </div>
                <Progress value={0} className="h-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More Videos
        </Button>
      </div>
    </div>
  );
};

export default VideoFeed;