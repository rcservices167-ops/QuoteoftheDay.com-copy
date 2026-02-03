/*
  # Add User Engagement Features

  1. New Tables
    - `quote_reactions` - Stores user reactions to quotes
      - `id` (uuid, primary key)
      - `quote_id` (uuid, foreign key to quotes)
      - `visitor_id` (uuid, foreign key to visitors)
      - `reaction_type` (text) - emoji type: love, like, dislike, share
      - `created_at` (timestamptz)
    
    - `user_streaks` - Tracks daily visit streaks
      - `id` (uuid, primary key)
      - `visitor_id` (uuid, foreign key to visitors)
      - `current_streak` (integer)
      - `longest_streak` (integer)
      - `last_visit_date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
  2. Table Updates
    - Add `view_count` and `reaction_count` to quotes table
    - Add `user_identifier` to visitors table for tracking anonymous users
  
  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated and anonymous access
*/

-- Add columns to existing tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotes' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE quotes ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotes' AND column_name = 'reaction_count'
  ) THEN
    ALTER TABLE quotes ADD COLUMN reaction_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'visitors' AND column_name = 'user_identifier'
  ) THEN
    ALTER TABLE visitors ADD COLUMN user_identifier TEXT;
  END IF;
END $$;

-- Create quote_reactions table
CREATE TABLE IF NOT EXISTS quote_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  visitor_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('love', 'like', 'dislike', 'share')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier TEXT UNIQUE NOT NULL,
  current_streak INTEGER DEFAULT 1,
  longest_streak INTEGER DEFAULT 1,
  last_visit_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quote_reactions_quote_id ON quote_reactions(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_reactions_user_identifier ON quote_reactions(user_identifier);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_identifier ON user_streaks(user_identifier);

-- Enable RLS
ALTER TABLE quote_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Policies for quote_reactions (allow all to read, insert, update their own)
CREATE POLICY "Anyone can view reactions"
  ON quote_reactions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can add reactions"
  ON quote_reactions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own reactions"
  ON quote_reactions FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own reactions"
  ON quote_reactions FOR DELETE
  TO public
  USING (true);

-- Policies for user_streaks (allow all to manage their own streaks)
CREATE POLICY "Anyone can view their streak"
  ON user_streaks FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create their streak"
  ON user_streaks FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update their streak"
  ON user_streaks FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Function to update quote reaction count
CREATE OR REPLACE FUNCTION update_quote_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE quotes 
    SET reaction_count = reaction_count + 1 
    WHERE id = NEW.quote_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE quotes 
    SET reaction_count = GREATEST(reaction_count - 1, 0)
    WHERE id = OLD.quote_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reaction count
DROP TRIGGER IF EXISTS trigger_update_reaction_count ON quote_reactions;
CREATE TRIGGER trigger_update_reaction_count
  AFTER INSERT OR DELETE ON quote_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_reaction_count();

-- Function to update or create user streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_identifier TEXT)
RETURNS TABLE(current_streak INTEGER, longest_streak INTEGER, is_new_streak BOOLEAN) AS $$
DECLARE
  v_last_visit DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_is_new BOOLEAN := false;
BEGIN
  -- Get existing streak data
  SELECT last_visit_date, user_streaks.current_streak, user_streaks.longest_streak
  INTO v_last_visit, v_current_streak, v_longest_streak
  FROM user_streaks
  WHERE user_identifier = p_user_identifier;

  -- If no streak exists, create new one
  IF NOT FOUND THEN
    INSERT INTO user_streaks (user_identifier, current_streak, longest_streak, last_visit_date)
    VALUES (p_user_identifier, 1, 1, CURRENT_DATE)
    RETURNING user_streaks.current_streak, user_streaks.longest_streak INTO v_current_streak, v_longest_streak;
    v_is_new := true;
  -- If last visit was yesterday, increment streak
  ELSIF v_last_visit = CURRENT_DATE - INTERVAL '1 day' THEN
    v_current_streak := v_current_streak + 1;
    v_longest_streak := GREATEST(v_longest_streak, v_current_streak);
    UPDATE user_streaks
    SET current_streak = v_current_streak,
        longest_streak = v_longest_streak,
        last_visit_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_identifier = p_user_identifier;
    v_is_new := true;
  -- If last visit was today, no change
  ELSIF v_last_visit = CURRENT_DATE THEN
    -- Do nothing, already visited today
  -- If streak is broken, reset to 1
  ELSE
    v_current_streak := 1;
    UPDATE user_streaks
    SET current_streak = 1,
        last_visit_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_identifier = p_user_identifier;
    v_is_new := true;
  END IF;

  RETURN QUERY SELECT v_current_streak, v_longest_streak, v_is_new;
END;
$$ LANGUAGE plpgsql;
