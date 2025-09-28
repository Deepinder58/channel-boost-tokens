-- Update the handle_new_user function to give new users 30 tokens instead of 100
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles with 30 starting tokens instead of 100
  INSERT INTO public.profiles (user_id, display_name, username, token_balance)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'user_' || substring(NEW.id::text, 1, 8)),
    30 -- Changed from 100 to 30 starting token balance
  );
  
  -- Insert default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;