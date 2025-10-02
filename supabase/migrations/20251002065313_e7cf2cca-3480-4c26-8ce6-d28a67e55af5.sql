-- Fix ambiguous column reference in generate_referral_code function
CREATE OR REPLACE FUNCTION public.generate_referral_code(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  profile_record RECORD;
  new_referral_code TEXT;
BEGIN
  -- Get user profile
  SELECT * INTO profile_record 
  FROM public.profiles 
  WHERE user_id = _user_id;
  
  IF profile_record IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Generate referral code based on username + random suffix
  new_referral_code := UPPER(
    COALESCE(profile_record.username, 'USER') || 
    RIGHT(profile_record.user_id::text, 4)
  );
  
  -- Insert referral record if doesn't exist
  INSERT INTO public.referrals (referrer_id, referred_id, referral_code, status)
  VALUES (_user_id, _user_id, new_referral_code, 'active')
  ON CONFLICT (referral_code) DO NOTHING;
  
  RETURN new_referral_code;
END;
$$;