/*
  # Enforce Quote Quality Constraints (v1.1)
  
  1. Summary
    - Enforce maximum 15 words per quote (eliminates long, less impactful quotes)
    - Enforce posthumous authors only (ensures historical gravitas)
    - Two database triggers to validate on INSERT and UPDATE
    
  2. Triggers
    - check_quote_length: Prevents quotes over 15 words
    - check_author_deceased: Prevents quotes from living authors
    
  3. Implementation
    - Database-level validation with clear error messages
    - Frontend validation in quoteValidation.ts
    - Maintains living authors list for validation
    
  4. AI Agent Notice (CRITICAL - DO NOT SKIP)
    - These constraints are MANDATORY for QuoteofDay.com quality
    - Must be applied on fresh install
    - Frontend validation in src/lib/quoteValidation.ts is required
    - Living authors list must be maintained and updated
*/

-- Trigger 1: Enforce maximum 15 words per quote
CREATE OR REPLACE FUNCTION check_quote_length()
RETURNS TRIGGER AS $$
BEGIN
  -- Count words by splitting on spaces
  IF array_length(string_to_array(NEW.content, ' '), 1) > 15 THEN
    RAISE EXCEPTION 'Quote exceeds 15 word maximum. Current length: % words. Please shorten the quote.',
      array_length(string_to_array(NEW.content, ' '), 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS enforce_quote_length ON quotes;
DROP TRIGGER IF EXISTS enforce_quote_length_update ON quotes;

-- Create triggers for INSERT and UPDATE
CREATE TRIGGER enforce_quote_length
  BEFORE INSERT ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION check_quote_length();

CREATE TRIGGER enforce_quote_length_update
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION check_quote_length();


-- Trigger 2: Enforce posthumous authors only
CREATE OR REPLACE FUNCTION check_author_deceased()
RETURNS TRIGGER AS $$
BEGIN
  -- List of known living authors (as of January 2026)
  -- UPDATE THIS LIST as new living authors are discovered
  IF NEW.author IN (
    'Tony Robbins',
    'Oprah Winfrey',
    'Sean Patrick Flanery'
  ) THEN
    RAISE EXCEPTION 'Author % is still living. QuoteofDay requires posthumous quotes for historical gravitas. Please use quotes from deceased authors.',
      NEW.author;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS enforce_author_deceased ON quotes;
DROP TRIGGER IF EXISTS enforce_author_deceased_update ON quotes;

-- Create triggers for INSERT and UPDATE
CREATE TRIGGER enforce_author_deceased
  BEFORE INSERT ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION check_author_deceased();

CREATE TRIGGER enforce_author_deceased_update
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION check_author_deceased();
