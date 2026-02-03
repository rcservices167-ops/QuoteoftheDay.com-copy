/*
  # Quote of the Day Application Schema

  ## Overview
  This migration creates the complete database schema for a Quote of the Day application
  with visitor tracking and admin functionality.

  ## New Tables

  ### 1. `quotes`
  Stores inspirational quotes with categorization
  - `id` (uuid, primary key) - Unique identifier for each quote
  - `quote_text` (text) - The actual quote content
  - `author` (text) - Author of the quote
  - `topic` (text) - Category/topic of the quote (e.g., motivation, wisdom, humor)
  - `created_at` (timestamptz) - When the quote was added
  
  ### 2. `visitors`
  Tracks visitor information and their interactions
  - `id` (uuid, primary key) - Unique identifier for each visit
  - `ip_address` (text) - Visitor's IP address
  - `location` (text) - Geographic location (city, country)
  - `user_agent` (text) - Browser/device information
  - `visited_at` (timestamptz) - Timestamp of visit
  - `selected_topic` (text) - Topic they selected (if any)
  - `quote_viewed_id` (uuid) - Reference to the quote they viewed

  ### 3. `admin_users`
  Stores admin user credentials linked to Supabase auth
  - `id` (uuid, primary key, references auth.users) - Links to Supabase auth user
  - `email` (text) - Admin email address
  - `full_name` (text) - Admin's full name
  - `created_at` (timestamptz) - When admin account was created
  - `last_login` (timestamptz) - Last time admin logged in

  ## Security

  ### Row Level Security (RLS)
  All tables have RLS enabled with the following policies:

  #### quotes table:
  - Public read access (anyone can view quotes)
  - Only authenticated admins can insert/update/delete quotes

  #### visitors table:
  - Anyone can insert visitor records (for tracking)
  - Only authenticated admins can view visitor data

  #### admin_users table:
  - Only authenticated admins can view their own profile
  - Only authenticated admins can update their own profile

  ## Notes
  - The quotes table is pre-populated with sample quotes across different topics
  - All timestamps use timestamptz for proper timezone handling
  - Foreign key constraints ensure data integrity
  - Indexes are added for frequently queried columns (topic, visited_at)
*/

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_text text NOT NULL,
  author text NOT NULL,
  topic text NOT NULL DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

-- Create visitors table
CREATE TABLE IF NOT EXISTS visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text,
  location text,
  user_agent text,
  visited_at timestamptz DEFAULT now(),
  selected_topic text DEFAULT 'all',
  quote_viewed_id uuid REFERENCES quotes(id)
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quotes_topic ON quotes(topic);
CREATE INDEX IF NOT EXISTS idx_visitors_visited_at ON visitors(visited_at);
CREATE INDEX IF NOT EXISTS idx_visitors_topic ON visitors(selected_topic);

-- Enable Row Level Security
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quotes table
CREATE POLICY "Anyone can view quotes"
  ON quotes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can insert quotes"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Only admins can update quotes"
  ON quotes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Only admins can delete quotes"
  ON quotes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- RLS Policies for visitors table
CREATE POLICY "Anyone can insert visitor records"
  ON visitors FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Only admins can view visitor data"
  ON visitors FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- RLS Policies for admin_users table
CREATE POLICY "Admins can view own profile"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update own profile"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Insert sample quotes
INSERT INTO quotes (quote_text, author, topic) VALUES
  ('The only way to do great work is to love what you do.', 'Steve Jobs', 'motivation'),
  ('In the middle of difficulty lies opportunity.', 'Albert Einstein', 'wisdom'),
  ('Life is what happens to you while you''re busy making other plans.', 'John Lennon', 'life'),
  ('The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt', 'inspiration'),
  ('It is during our darkest moments that we must focus to see the light.', 'Aristotle', 'wisdom'),
  ('The only impossible journey is the one you never begin.', 'Tony Robbins', 'motivation'),
  ('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 'success'),
  ('Happiness is not something ready made. It comes from your own actions.', 'Dalai Lama', 'happiness'),
  ('The best time to plant a tree was 20 years ago. The second best time is now.', 'Chinese Proverb', 'wisdom'),
  ('Your time is limited, don''t waste it living someone else''s life.', 'Steve Jobs', 'life'),
  ('The only limit to our realization of tomorrow is our doubts of today.', 'Franklin D. Roosevelt', 'inspiration'),
  ('Do what you can, with what you have, where you are.', 'Theodore Roosevelt', 'motivation'),
  ('Everything you''ve ever wanted is on the other side of fear.', 'George Addair', 'courage'),
  ('Believe you can and you''re halfway there.', 'Theodore Roosevelt', 'inspiration'),
  ('The purpose of our lives is to be happy.', 'Dalai Lama', 'happiness')
ON CONFLICT DO NOTHING;