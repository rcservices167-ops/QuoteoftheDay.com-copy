/*
  # Create Quotes Table for Archive Generation

  Creates the quotes table with the schema expected by the archive generator script.
  
  ## New Tables
  - `quotes`: Stores daily quotes with content, author, dates, and archive metadata
    - `id` (uuid): Unique identifier
    - `content` (text): The quote text
    - `author` (text): Quote author
    - `subcategory` (text): Quote category
    - `date` (date): The date for the quote
    - `slug` (text): URL-friendly slug for archives
    - `created_at` (timestamptz): When added to database
    
  ## Security
  - RLS enabled with public read access for all users
  - Appropriate policies for data access
*/

CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  author text NOT NULL,
  subcategory text DEFAULT 'general',
  date date NOT NULL,
  slug text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotes_date ON quotes(date);
CREATE INDEX IF NOT EXISTS idx_quotes_slug ON quotes(slug);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quotes"
  ON quotes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert quotes"
  ON quotes FOR INSERT
  TO public
  WITH CHECK (true);
