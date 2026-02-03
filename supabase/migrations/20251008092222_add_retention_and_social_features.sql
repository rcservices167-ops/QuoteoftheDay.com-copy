/*
  # Add Retention and Social Engagement Features

  1. New Tables
    - `push_subscriptions` - Store web push notification subscriptions
      - `id` (uuid, primary key)
      - `user_identifier` (text)
      - `endpoint` (text, unique)
      - `p256dh_key` (text)
      - `auth_key` (text)
      - `is_active` (boolean)
      - `notification_time` (time) - Preferred daily notification time
      - `timezone` (text)
      - `created_at` (timestamptz)
      - `last_sent` (timestamptz)
    
    - `email_subscriptions` - Daily email reminders
      - `id` (uuid, primary key)
      - `user_identifier` (text)
      - `email` (text, unique)
      - `is_active` (boolean)
      - `notification_time` (time)
      - `timezone` (text)
      - `verification_token` (text)
      - `verified_at` (timestamptz)
      - `created_at` (timestamptz)
      - `last_sent` (timestamptz)
    
    - `user_challenges` - Track shared challenges
      - `id` (uuid, primary key)
      - `challenge_code` (text, unique)
      - `user_identifier` (text)
      - `quote_id` (uuid, foreign key to quotes)
      - `challenge_type` (text) - 'quote_reaction', 'streak', 'badges'
      - `challenge_data` (jsonb)
      - `views` (integer)
      - `accepts` (integer)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)
    
    - `social_shares` - Track social media shares
      - `id` (uuid, primary key)
      - `user_identifier` (text)
      - `quote_id` (uuid, foreign key to quotes)
      - `platform` (text) - 'twitter', 'facebook', 'instagram', 'tiktok', 'threads'
      - `share_type` (text) - 'quote', 'leaderboard', 'badge', 'challenge'
      - `created_at` (timestamptz)
    
    - `leaderboard_entries` - Daily/weekly leaderboards
      - `id` (uuid, primary key)
      - `user_identifier` (text)
      - `display_name` (text)
      - `score` (integer)
      - `period_type` (text) - 'daily', 'weekly', 'monthly', 'all-time'
      - `period_date` (date)
      - `rank_position` (integer)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier TEXT NOT NULL,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  notification_time TIME DEFAULT '09:00:00',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_sent TIMESTAMPTZ
);

-- Create email_subscriptions table
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  notification_time TIME DEFAULT '09:00:00',
  timezone TEXT DEFAULT 'UTC',
  verification_token TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_sent TIMESTAMPTZ
);

-- Create user_challenges table
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_code TEXT UNIQUE NOT NULL,
  user_identifier TEXT NOT NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('quote_reaction', 'streak', 'badges', 'points')),
  challenge_data JSONB DEFAULT '{}',
  views INTEGER DEFAULT 0,
  accepts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Create social_shares table
CREATE TABLE IF NOT EXISTS social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier TEXT NOT NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'facebook', 'instagram', 'tiktok', 'threads', 'linkedin')),
  share_type TEXT NOT NULL CHECK (share_type IN ('quote', 'leaderboard', 'badge', 'challenge', 'streak')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create leaderboard_entries table
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier TEXT NOT NULL,
  display_name TEXT DEFAULT 'Anonymous',
  score INTEGER NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'all-time')),
  period_date DATE DEFAULT CURRENT_DATE,
  rank_position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_identifier, period_type, period_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_identifier);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_user ON email_subscriptions(user_identifier);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_active ON email_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_challenges_code ON user_challenges(challenge_code);
CREATE INDEX IF NOT EXISTS idx_challenges_user ON user_challenges(user_identifier);
CREATE INDEX IF NOT EXISTS idx_social_shares_user ON social_shares(user_identifier);
CREATE INDEX IF NOT EXISTS idx_social_shares_platform ON social_shares(platform);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON leaderboard_entries(period_type, period_date);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard_entries(rank_position);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Policies for push_subscriptions
CREATE POLICY "Anyone can view their subscriptions"
  ON push_subscriptions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create subscriptions"
  ON push_subscriptions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update their subscriptions"
  ON push_subscriptions FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete their subscriptions"
  ON push_subscriptions FOR DELETE
  TO public
  USING (true);

-- Policies for email_subscriptions
CREATE POLICY "Anyone can view their email subscriptions"
  ON email_subscriptions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create email subscriptions"
  ON email_subscriptions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update their email subscriptions"
  ON email_subscriptions FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Policies for user_challenges
CREATE POLICY "Anyone can view active challenges"
  ON user_challenges FOR SELECT
  TO public
  USING (expires_at > NOW());

CREATE POLICY "Anyone can create challenges"
  ON user_challenges FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update challenge stats"
  ON user_challenges FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Policies for social_shares
CREATE POLICY "Anyone can view shares"
  ON social_shares FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can record shares"
  ON social_shares FOR INSERT
  TO public
  WITH CHECK (true);

-- Policies for leaderboard_entries
CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard_entries FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create leaderboard entries"
  ON leaderboard_entries FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update leaderboard entries"
  ON leaderboard_entries FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Function to generate unique challenge code
CREATE OR REPLACE FUNCTION generate_challenge_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update leaderboard rankings
CREATE OR REPLACE FUNCTION update_leaderboard_rankings(p_period_type TEXT, p_period_date DATE)
RETURNS VOID AS $$
BEGIN
  WITH ranked_entries AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY score DESC, created_at ASC) as new_rank
    FROM leaderboard_entries
    WHERE period_type = p_period_type AND period_date = p_period_date
  )
  UPDATE leaderboard_entries le
  SET rank_position = re.new_rank
  FROM ranked_entries re
  WHERE le.id = re.id;
END;
$$ LANGUAGE plpgsql;

-- Function to upsert leaderboard entry
CREATE OR REPLACE FUNCTION upsert_leaderboard_entry(
  p_user_identifier TEXT,
  p_display_name TEXT,
  p_score INTEGER,
  p_period_type TEXT
)
RETURNS TABLE(new_rank INTEGER, total_players INTEGER) AS $$
DECLARE
  v_period_date DATE := CURRENT_DATE;
  v_new_rank INTEGER;
  v_total INTEGER;
BEGIN
  -- Insert or update entry
  INSERT INTO leaderboard_entries (user_identifier, display_name, score, period_type, period_date)
  VALUES (p_user_identifier, p_display_name, p_score, p_period_type, v_period_date)
  ON CONFLICT (user_identifier, period_type, period_date) 
  DO UPDATE SET 
    score = GREATEST(leaderboard_entries.score, p_score),
    display_name = p_display_name;
  
  -- Update rankings
  PERFORM update_leaderboard_rankings(p_period_type, v_period_date);
  
  -- Get user's rank and total players
  SELECT rank_position, COUNT(*) OVER()
  INTO v_new_rank, v_total
  FROM leaderboard_entries
  WHERE period_type = p_period_type 
    AND period_date = v_period_date 
    AND user_identifier = p_user_identifier;
  
  RETURN QUERY SELECT v_new_rank, v_total;
END;
$$ LANGUAGE plpgsql;
