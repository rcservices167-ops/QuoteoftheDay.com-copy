/*
  # Add slug column to jokes table for archive generation

  1. New Columns
    - `slug` (text, nullable) - Stores the relative path to the archive page
      - Format: `archives/YY/MM/DD/UUID-short/text-slug.html`
      - Auto-populated by archive generator
      - Example: `archives/25/12/10/60db55fa/why-cant-you-hear-a-pterodactyl.html`

  2. Purpose
    - Enables archive page generation system
    - One archive page generated per joke in database
    - All database entries get archive pages automatically
    - Slug field updated on each archive generation run

  3. Implementation
    - Archive generator queries all jokes
    - Creates static HTML files for each entry
    - Updates slug field with archive path
    - Generates comprehensive sitemap.xml with all archive URLs
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jokes' AND column_name = 'slug'
  ) THEN
    ALTER TABLE jokes ADD COLUMN slug VARCHAR(255);
  END IF;
END $$;
