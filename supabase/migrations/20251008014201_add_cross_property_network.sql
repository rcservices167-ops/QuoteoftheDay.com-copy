/*
  # Add Cross-Property Network Features

  1. New Tables
    - `network_properties` - List of all properties in the network
      - `id` (uuid, primary key)
      - `domain` (text, unique) - e.g., 'jokeofday.net'
      - `name` (text) - Display name
      - `description` (text)
      - `icon` (text) - Icon identifier
      - `color_primary` (text) - Brand color
      - `is_active` (boolean)
      - `sort_order` (integer)
      - `created_at` (timestamptz)
    
    - `user_network_visits` - Track visits across all properties
      - `id` (uuid, primary key)
      - `user_identifier` (text)
      - `property_id` (uuid, foreign key to network_properties)
      - `visit_date` (date)
      - `created_at` (timestamptz)
    
    - `user_network_points` - Unified points system
      - `id` (uuid, primary key)
      - `user_identifier` (text, unique)
      - `total_points` (integer)
      - `lifetime_points` (integer)
      - `current_level` (integer)
      - `properties_visited_today` (integer)
      - `last_updated` (timestamptz)
      - `created_at` (timestamptz)
    
    - `network_badges` - Available badges
      - `id` (uuid, primary key)
      - `badge_name` (text)
      - `description` (text)
      - `icon` (text)
      - `requirement_type` (text) - 'visits', 'points', 'properties', 'streak'
      - `requirement_value` (integer)
      - `points_reward` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
    
    - `user_badges` - User earned badges
      - `id` (uuid, primary key)
      - `user_identifier` (text)
      - `badge_id` (uuid, foreign key to network_badges)
      - `earned_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for public access
*/

-- Create network_properties table
CREATE TABLE IF NOT EXISTS network_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  color_primary TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_network_visits table
CREATE TABLE IF NOT EXISTS user_network_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier TEXT NOT NULL,
  property_id UUID REFERENCES network_properties(id) ON DELETE CASCADE,
  visit_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_identifier, property_id, visit_date)
);

-- Create user_network_points table
CREATE TABLE IF NOT EXISTS user_network_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier TEXT UNIQUE NOT NULL,
  total_points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  properties_visited_today INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create network_badges table
CREATE TABLE IF NOT EXISTS network_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('visits', 'points', 'properties', 'streak')),
  requirement_value INTEGER NOT NULL,
  points_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier TEXT NOT NULL,
  badge_id UUID REFERENCES network_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_identifier, badge_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_network_visits_user ON user_network_visits(user_identifier);
CREATE INDEX IF NOT EXISTS idx_network_visits_date ON user_network_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_network_points_user ON user_network_points(user_identifier);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_identifier);

-- Enable RLS
ALTER TABLE network_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_network_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_network_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Policies for network_properties
CREATE POLICY "Anyone can view network properties"
  ON network_properties FOR SELECT
  TO public
  USING (is_active = true);

-- Policies for user_network_visits
CREATE POLICY "Anyone can view visits"
  ON user_network_visits FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can record visits"
  ON user_network_visits FOR INSERT
  TO public
  WITH CHECK (true);

-- Policies for user_network_points
CREATE POLICY "Anyone can view points"
  ON user_network_points FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create points record"
  ON user_network_points FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update their points"
  ON user_network_points FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Policies for network_badges
CREATE POLICY "Anyone can view badges"
  ON network_badges FOR SELECT
  TO public
  USING (is_active = true);

-- Policies for user_badges
CREATE POLICY "Anyone can view earned badges"
  ON user_badges FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can earn badges"
  ON user_badges FOR INSERT
  TO public
  WITH CHECK (true);

-- Insert default network properties
INSERT INTO network_properties (domain, name, description, icon, color_primary, sort_order) VALUES
  ('mydailyinfo.com', 'Daily Hub', 'Your daily dose of everything', 'Home', '#3B82F6', 1),
  ('quoteofday.net', 'Quote of Day', 'Inspiring quotes daily', 'MessageSquare', '#8B5CF6', 2),
  ('jokeofday.net', 'Joke of Day', 'Laugh every day', 'Laugh', '#F59E0B', 3),
  ('factofday.com', 'Fact of Day', 'Learn something new daily', 'Brain', '#10B981', 4),
  ('gameofday.net', 'Game of Day', 'Play a new game daily', 'Gamepad2', '#EF4444', 5),
  ('scoresofday.net', 'Scores of Day', 'Daily sports scores', 'Trophy', '#06B6D4', 6)
ON CONFLICT (domain) DO NOTHING;

-- Insert default badges
INSERT INTO network_badges (badge_name, description, icon, requirement_type, requirement_value, points_reward) VALUES
  ('First Visit', 'Welcome to the network!', 'Star', 'visits', 1, 10),
  ('Explorer', 'Visited 3 different properties', 'Compass', 'properties', 3, 25),
  ('Network Master', 'Visited all 6 properties', 'Crown', 'properties', 6, 100),
  ('Daily Visitor', 'Visit 7 days in a row', 'Flame', 'streak', 7, 50),
  ('Point Collector', 'Earned 100 points', 'Coins', 'points', 100, 0),
  ('Super User', 'Earned 500 points', 'Award', 'points', 500, 50),
  ('Network Legend', 'Earned 1000 points', 'Medal', 'points', 1000, 100)
ON CONFLICT DO NOTHING;

-- Function to award points for property visit
CREATE OR REPLACE FUNCTION award_visit_points(p_user_identifier TEXT, p_property_domain TEXT)
RETURNS TABLE(points_earned INTEGER, new_total INTEGER, level_up BOOLEAN, new_badges INTEGER) AS $$
DECLARE
  v_property_id UUID;
  v_visit_exists BOOLEAN;
  v_points_to_award INTEGER := 10;
  v_old_total INTEGER;
  v_new_total INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_properties_today INTEGER;
  v_new_badges_count INTEGER := 0;
BEGIN
  -- Get property ID
  SELECT id INTO v_property_id FROM network_properties WHERE domain = p_property_domain;
  
  IF v_property_id IS NULL THEN
    RETURN QUERY SELECT 0, 0, false, 0;
    RETURN;
  END IF;
  
  -- Check if already visited today
  SELECT EXISTS(
    SELECT 1 FROM user_network_visits 
    WHERE user_identifier = p_user_identifier 
    AND property_id = v_property_id 
    AND visit_date = CURRENT_DATE
  ) INTO v_visit_exists;
  
  -- Record visit if not exists
  IF NOT v_visit_exists THEN
    INSERT INTO user_network_visits (user_identifier, property_id, visit_date)
    VALUES (p_user_identifier, v_property_id, CURRENT_DATE);
    
    -- Count unique properties visited today
    SELECT COUNT(DISTINCT property_id) INTO v_properties_today
    FROM user_network_visits
    WHERE user_identifier = p_user_identifier AND visit_date = CURRENT_DATE;
    
    -- Bonus points for visiting multiple properties
    IF v_properties_today >= 3 THEN
      v_points_to_award := v_points_to_award + 15;
    END IF;
    IF v_properties_today >= 5 THEN
      v_points_to_award := v_points_to_award + 25;
    END IF;
    
    -- Update or create points record
    INSERT INTO user_network_points (user_identifier, total_points, lifetime_points, properties_visited_today, last_updated)
    VALUES (p_user_identifier, v_points_to_award, v_points_to_award, v_properties_today, NOW())
    ON CONFLICT (user_identifier) DO UPDATE SET
      total_points = user_network_points.total_points + v_points_to_award,
      lifetime_points = user_network_points.lifetime_points + v_points_to_award,
      properties_visited_today = v_properties_today,
      last_updated = NOW()
    RETURNING user_network_points.total_points - v_points_to_award, user_network_points.total_points, user_network_points.current_level
    INTO v_old_total, v_new_total, v_old_level;
    
    -- Calculate new level (every 100 points = 1 level)
    v_new_level := FLOOR(v_new_total / 100) + 1;
    
    -- Update level if changed
    IF v_new_level > v_old_level THEN
      UPDATE user_network_points SET current_level = v_new_level WHERE user_identifier = p_user_identifier;
    END IF;
    
    -- Check for new badges
    SELECT COUNT(*) INTO v_new_badges_count FROM (
      SELECT nb.id FROM network_badges nb
      WHERE nb.is_active = true
      AND NOT EXISTS (SELECT 1 FROM user_badges ub WHERE ub.user_identifier = p_user_identifier AND ub.badge_id = nb.id)
      AND (
        (nb.requirement_type = 'visits' AND 
          (SELECT COUNT(*) FROM user_network_visits WHERE user_identifier = p_user_identifier) >= nb.requirement_value)
        OR
        (nb.requirement_type = 'properties' AND v_properties_today >= nb.requirement_value)
        OR
        (nb.requirement_type = 'points' AND v_new_total >= nb.requirement_value)
      )
    ) AS new_badges;
    
    RETURN QUERY SELECT v_points_to_award, v_new_total, (v_new_level > v_old_level), v_new_badges_count;
  ELSE
    -- Already visited, return current points
    SELECT total_points, current_level INTO v_new_total, v_new_level
    FROM user_network_points WHERE user_identifier = p_user_identifier;
    
    RETURN QUERY SELECT 0, COALESCE(v_new_total, 0), false, 0;
  END IF;
END;
$$ LANGUAGE plpgsql;
