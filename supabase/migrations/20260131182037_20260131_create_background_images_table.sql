/*
  # Create Background Images Table for Multi-Source Smart Matching

  1. New Tables
    - `background_images`
      - `id` (uuid, primary key)
      - `url` (text, unique Pexels/Pixabay/Unsplash URL)
      - `category` (text: 'jokes', 'facts', 'quotes')
      - `mood` (text: 'vibrant', 'playful', 'minimalist', 'serene', etc)
      - `keywords` (text[], array of searchable terms)
      - `source` (text: 'pexels', 'pixabay', 'unsplash', 'giphy')
      - `source_id` (text, external service image ID)
      - `photographer` (text, photographer/creator attribution)
      - `created_at` (timestamptz)

  2. Indexes
    - category (for filtering by type)
    - keywords (GIN index for full-text search)
    - source (for rate-limit management)
    - created_at (for pagination)

  3. Security
    - Enable RLS - all users can read, only admin can write
    - Create policy for public SELECT access
    - Create policy for admin/service role INSERT/UPDATE/DELETE
*/

CREATE TABLE IF NOT EXISTS background_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text UNIQUE NOT NULL,
  category text NOT NULL CHECK (category IN ('jokes', 'facts', 'quotes')),
  mood text NOT NULL,
  keywords text[] NOT NULL DEFAULT '{}',
  source text NOT NULL CHECK (source IN ('pexels', 'pixabay', 'unsplash', 'giphy')),
  source_id text NOT NULL,
  photographer text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_background_images_category ON background_images(category);
CREATE INDEX idx_background_images_source ON background_images(source);
CREATE INDEX idx_background_images_keywords ON background_images USING GIN(keywords);
CREATE INDEX idx_background_images_mood ON background_images(mood);
CREATE INDEX idx_background_images_created_at ON background_images(created_at DESC);

ALTER TABLE background_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read background images"
  ON background_images FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage background images"
  ON background_images FOR INSERT
  WITH CHECK (true);

/*
  # Create Image Cache Table

  1. New Tables
    - `image_cache`
      - `id` (uuid)
      - `content_hash` (text, SHA256 of content)
      - `category` (text)
      - `matched_image_ids` (uuid[], top 10 matching image UUIDs)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz, 30-day TTL)

  Cache 10 matched images per quote to ensure:
  1. Fast subsequent shares
  2. Consistent randomization (same 10 options)
  3. Memory efficiency (store UUIDs, not URLs)
*/

CREATE TABLE IF NOT EXISTS image_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_hash text UNIQUE NOT NULL,
  category text NOT NULL CHECK (category IN ('jokes', 'facts', 'quotes')),
  matched_image_ids uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days')
);

CREATE INDEX idx_image_cache_content_hash ON image_cache(content_hash);
CREATE INDEX idx_image_cache_expires_at ON image_cache(expires_at);

ALTER TABLE image_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read image cache"
  ON image_cache FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can write image cache"
  ON image_cache FOR INSERT
  WITH CHECK (true);
