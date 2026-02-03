/*
  # Add category column to quotes table

  1. Changes
    - Add `category` column (varchar, required, default: 'wisdom')
    - Used for color-coding and filtering quotes
    - Values: wisdom, inspiration, success, love, motivation, humor
    
  2. Impact
    - Populates existing quotes with 'wisdom' as default
    - All future quotes must have valid category
*/

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'wisdom';

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_quotes_category ON quotes(category);
