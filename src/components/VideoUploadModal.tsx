import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Upload } from "lucide-react";

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoUploaded: () => void;
}

const categories = [
  "Gaming", "Education", "Music", "Technology", "Entertainment", 
  "Sports", "Comedy", "Lifestyle", "Tutorials", "Reviews"
];

export const VideoUploadModal = ({ isOpen, onClose, onVideoUploaded }: VideoUploadModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tokensToSpend, setTokensToSpend] = useState("10");
  const { toast } = useToast();
  const { user } = useAuth();

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error("Please enter a valid YouTube URL");
      }

      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      // Check user's token balance first
      const { data: profile } = await supabase
        .from('profiles')
        .select('token_balance')
        .eq('user_id', user.id)
        .single();

      if (!profile || profile.token_balance < parseInt(tokensToSpend)) {
        throw new Error("Insufficient token balance");
      }

      // Insert video
      const { error: videoError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          youtube_url: youtubeUrl,
          title,
          description,
          category,
          thumbnail_url: thumbnailUrl,
          tokens_spent: parseInt(tokensToSpend),
        });

      if (videoError) throw videoError;

      // Update token balance
      const { error: updateError } = await supabase.rpc('update_token_balance', {
        _user_id: user.id,
        _amount: parseInt(tokensToSpend),
        _type: 'spent',
        _description: `Promoted video: ${title}`
      });

      if (updateError) throw updateError;

      toast({
        title: "Video Submitted!",
        description: "Your video has been submitted for review and will appear in the feed once approved.",
      });

      // Reset form
      setYoutubeUrl("");
      setTitle("");
      setDescription("");
      setCategory("");
      setTokensToSpend("10");
      onVideoUploaded();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Promote Your Video</DialogTitle>
          <DialogDescription>
            Add your YouTube video to the promotion feed
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="youtube-url">YouTube URL *</Label>
            <Input
              id="youtube-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Video Title *</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter your video title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of your video"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tokens">Tokens to Spend *</Label>
            <Select value={tokensToSpend} onValueChange={setTokensToSpend}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 tokens</SelectItem>
                <SelectItem value="25">25 tokens</SelectItem>
                <SelectItem value="50">50 tokens</SelectItem>
                <SelectItem value="100">100 tokens</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Upload className="mr-2 h-4 w-4" />
              Submit Video
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};