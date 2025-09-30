-- Create table to track daily logins and streaks
CREATE TABLE public.daily_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  last_login_date DATE NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 1,
  longest_streak INTEGER NOT NULL DEFAULT 1,
  total_logins INTEGER NOT NULL DEFAULT 1,
  last_reward_claimed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_streaks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own streak data" 
ON public.daily_streaks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak data" 
ON public.daily_streaks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak data" 
ON public.daily_streaks 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create referral system table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  tokens_awarded INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referrer_id, referred_id)
);

-- Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Referral policies
CREATE POLICY "Users can view own referrals" 
ON public.referrals 
FOR SELECT 
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can insert referrals" 
ON public.referrals 
FOR INSERT 
WITH CHECK (auth.uid() = referrer_id);

-- Create user levels table
CREATE TABLE public.user_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  level TEXT NOT NULL DEFAULT 'bronze',
  experience_points INTEGER NOT NULL DEFAULT 0,
  level_achieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user levels
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;

-- User levels policies
CREATE POLICY "Users can view all levels" 
ON public.user_levels 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert own level" 
ON public.user_levels 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own level" 
ON public.user_levels 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to check and award daily bonus
CREATE OR REPLACE FUNCTION public.check_daily_streak(_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  streak_record RECORD;
  today_date DATE := CURRENT_DATE;
  yesterday_date DATE := CURRENT_DATE - INTERVAL '1 day';
  bonus_tokens INTEGER := 0;
  streak_bonus INTEGER := 0;
  result JSON;
BEGIN
  -- Get existing streak record
  SELECT * INTO streak_record 
  FROM public.daily_streaks 
  WHERE user_id = _user_id;
  
  IF streak_record IS NULL THEN
    -- First time login
    INSERT INTO public.daily_streaks (user_id, last_login_date, current_streak, longest_streak, total_logins)
    VALUES (_user_id, today_date, 1, 1, 1);
    
    bonus_tokens := 10; -- First login bonus
    
    -- Award tokens
    PERFORM public.update_token_balance(_user_id, bonus_tokens, 'earned', 'Daily login bonus');
    
  ELSIF streak_record.last_login_date = today_date THEN
    -- Already logged in today
    bonus_tokens := 0;
    
  ELSIF streak_record.last_login_date = yesterday_date THEN
    -- Continuing streak
    UPDATE public.daily_streaks 
    SET 
      last_login_date = today_date,
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      total_logins = total_logins + 1,
      updated_at = now()
    WHERE user_id = _user_id;
    
    bonus_tokens := 5; -- Base daily bonus
    
    -- Check for streak bonuses
    IF (streak_record.current_streak + 1) % 7 = 0 THEN
      streak_bonus := 50; -- Weekly streak bonus
    ELSIF (streak_record.current_streak + 1) % 3 = 0 THEN
      streak_bonus := 15; -- 3-day streak bonus
    END IF;
    
    -- Award tokens
    PERFORM public.update_token_balance(_user_id, bonus_tokens + streak_bonus, 'earned', 
      CASE 
        WHEN streak_bonus > 0 THEN 'Daily login + streak bonus'
        ELSE 'Daily login bonus'
      END);
      
  ELSE
    -- Streak broken, reset
    UPDATE public.daily_streaks 
    SET 
      last_login_date = today_date,
      current_streak = 1,
      total_logins = total_logins + 1,
      updated_at = now()
    WHERE user_id = _user_id;
    
    bonus_tokens := 5; -- Base daily bonus
    
    -- Award tokens
    PERFORM public.update_token_balance(_user_id, bonus_tokens, 'earned', 'Daily login bonus');
  END IF;
  
  -- Get updated streak data
  SELECT * INTO streak_record 
  FROM public.daily_streaks 
  WHERE user_id = _user_id;
  
  result := json_build_object(
    'tokens_awarded', bonus_tokens + streak_bonus,
    'current_streak', streak_record.current_streak,
    'longest_streak', streak_record.longest_streak,
    'is_new_record', streak_record.current_streak = streak_record.longest_streak
  );
  
  RETURN result;
END;
$$;

-- Create function to generate referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record RECORD;
  referral_code TEXT;
BEGIN
  -- Get user profile
  SELECT * INTO profile_record 
  FROM public.profiles 
  WHERE user_id = _user_id;
  
  IF profile_record IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Generate referral code based on username + random suffix
  referral_code := UPPER(
    COALESCE(profile_record.username, 'USER') || 
    RIGHT(profile_record.user_id::text, 4)
  );
  
  -- Insert referral record if doesn't exist
  INSERT INTO public.referrals (referrer_id, referred_id, referral_code, status)
  VALUES (_user_id, _user_id, referral_code, 'active')
  ON CONFLICT (referral_code) DO NOTHING;
  
  RETURN referral_code;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_daily_streaks_updated_at
BEFORE UPDATE ON public.daily_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_levels_updated_at
BEFORE UPDATE ON public.user_levels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();