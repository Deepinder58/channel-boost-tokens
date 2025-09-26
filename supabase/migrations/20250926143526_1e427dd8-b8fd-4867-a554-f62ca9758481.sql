-- Allow admins to delete videos
CREATE POLICY "Admins can delete videos" 
ON public.videos 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));