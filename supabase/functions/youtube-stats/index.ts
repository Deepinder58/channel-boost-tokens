import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface YouTubeVideoStats {
  viewCount: string;
  likeCount: string;
  commentCount: string;
  subscriberCount?: string;
}

// Input validation schema
const RequestSchema = z.object({
  video_id: z.string().uuid("Invalid video ID format")
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { 
      global: { 
        headers: { Authorization: req.headers.get("Authorization")! } 
      } 
    }
  );

  try {
    console.log("Starting YouTube data fetch");

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    const body = await req.json();
    
    // Validate input
    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.error.issues }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const { video_id } = validation.data;

    console.log("Fetching data for video:", video_id);

    // Get video from database to extract YouTube URL
    const { data: videoData, error: videoError } = await supabaseClient
      .from('videos')
      .select('youtube_url, user_id')
      .eq('id', video_id)
      .eq('user_id', user.id) // Ensure user owns the video
      .single();

    if (videoError || !videoData) {
      throw new Error("Video not found or access denied");
    }

    // Extract YouTube video ID from URL
    const youtubeId = extractYouTubeId(videoData.youtube_url);
    if (!youtubeId) {
      throw new Error("Invalid YouTube URL");
    }

    console.log("YouTube ID extracted:", youtubeId);

    // Fetch YouTube API data
    const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!youtubeApiKey) {
      throw new Error("YouTube API key not configured");
    }

    const youtubeResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${youtubeId}&key=${youtubeApiKey}`
    );

    if (!youtubeResponse.ok) {
      throw new Error(`YouTube API error: ${youtubeResponse.status}`);
    }

    const youtubeData = await youtubeResponse.json();
    
    if (!youtubeData.items || youtubeData.items.length === 0) {
      throw new Error("Video not found on YouTube");
    }

    const stats = youtubeData.items[0].statistics;
    const snippet = youtubeData.items[0].snippet;

    console.log("YouTube stats fetched:", stats);

    // Update video total_views in database with real YouTube view count
    const viewCount = parseInt(stats.viewCount || "0");
    
    const { error: updateError } = await supabaseClient
      .from('videos')
      .update({ 
        total_views: viewCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', video_id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error("Error updating video views:", updateError);
    }

    const result = {
      youtube_id: youtubeId,
      title: snippet.title,
      view_count: parseInt(stats.viewCount || "0"),
      like_count: parseInt(stats.likeCount || "0"),
      comment_count: parseInt(stats.commentCount || "0"),
      published_at: snippet.publishedAt,
      updated_at: new Date().toISOString(),
    };

    console.log("Returning result:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in youtube-stats function:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}