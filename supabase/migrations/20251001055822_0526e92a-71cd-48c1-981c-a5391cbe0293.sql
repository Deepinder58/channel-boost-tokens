-- Add device fingerprinting and fraud prevention fields to video_views
ALTER TABLE public.video_views
ADD COLUMN IF NOT EXISTS device_fingerprint TEXT,
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS ip_hash TEXT;

-- Create index for faster fraud detection queries
CREATE INDEX IF NOT EXISTS idx_video_views_device_fingerprint 
ON public.video_views(device_fingerprint);

CREATE INDEX IF NOT EXISTS idx_video_views_session_video 
ON public.video_views(session_id, video_id);

-- Add constraint to prevent duplicate views from same session/device
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_view_per_session 
ON public.video_views(video_id, session_id) 
WHERE session_id IS NOT NULL;

-- Create function to check if user owns the video
CREATE OR REPLACE FUNCTION public.user_owns_video(_user_id UUID, _video_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.videos 
    WHERE id = _video_id AND user_id = _user_id
  )
$$;

-- Create function to check if view is suspicious (too many views from same device)
CREATE OR REPLACE FUNCTION public.is_suspicious_view(_video_id UUID, _device_fingerprint TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) >= 5 
  FROM public.video_views 
  WHERE video_id = _video_id 
    AND device_fingerprint = _device_fingerprint
    AND created_at > NOW() - INTERVAL '1 hour'
$$;