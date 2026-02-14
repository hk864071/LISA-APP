-- SECURITY UPDATE: Server-Side XP Logic & Anti-Cheat
-- Run this in your Supabase SQL Editor

-- 1. Add timestamp to track last XP gain (Anti-Spam)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_xp_gain_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Secure Function to Gain XP (Server-Authoritative)
-- This prevents users from setting their level to 100 directly.
-- They must call this function, which calculates progression linearly.
CREATE OR REPLACE FUNCTION gain_xp(amount_to_add INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges (bypasses RLS for the update logic inside)
AS $$
DECLARE
  user_profile public.profiles%ROWTYPE;
  new_xp INTEGER;
  new_level INTEGER;
  xp_for_next_level INTEGER;
  _max_level INTEGER := 999;
BEGIN
  -- Get User Profile
  SELECT * INTO user_profile FROM public.profiles WHERE id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Logic: Calculate New State
  new_xp := user_profile.xp + amount_to_add;
  new_level := user_profile.current_level;
  
  -- Level Up Loop (Matches client-side utils/levelSystem.ts)
  -- Formula: Level * 100 XP required per level
  LOOP
    xp_for_next_level := new_level * 100;
    
    -- Cap at max level
    IF new_level >= _max_level THEN
        EXIT;
    END IF;

    IF new_xp >= xp_for_next_level THEN
      new_xp := new_xp - xp_for_next_level;
      new_level := new_level + 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  -- Update DB
  UPDATE public.profiles
  SET 
    xp = new_xp,
    current_level = new_level,
    last_xp_gain_at = NOW(),
    updated_at = NOW()
  WHERE id = auth.uid();
  
  -- Return new state to client
  RETURN jsonb_build_object(
    'new_level', new_level,
    'new_xp', new_xp,
    'leveled_up', (new_level > user_profile.current_level)
  );
END;
$$;
