-- Fix profiles table RLS policy to prevent public data exposure
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Fix user_levels table RLS policy to prevent user tracking
DROP POLICY IF EXISTS "Users can view all levels" ON public.user_levels;

CREATE POLICY "Users can view own level" 
ON public.user_levels 
FOR SELECT 
USING (auth.uid() = user_id);