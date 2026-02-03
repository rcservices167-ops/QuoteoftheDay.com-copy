# QuoteofDay.com Category-Specific Implementation Guide v1.34 (CONSOLIDATED)
## Smart Image Matching for Quotes, Facts, and Jokes

**Version:** 1.34 (CONSOLIDATED - Category-Specific Smart Matching)
**Date:** January 31, 2026
**Status:** ✅ READY FOR IMPLEMENTATION
**Purpose:** Step-by-step guide for implementing smart image matching for quote, fact, and joke categories
**Target Domains:** QuoteoftheDay.com, FactsofDay.com, JokesofDay.com

---

## Quick Start Summary

This guide implements category-specific smart image matching with:
- Category detection and routing (quotes/facts/jokes)
- Mood-based image filtering for each category
- Keyword extraction tuned for quotes, facts, and jokes
- Database population with 1000+ category-specific images
- Edge function smart-image-match processing
- Frontend integration with QuoteShareModal

---

## PART 1: CATEGORY DEFINITIONS & MOODS

### QUOTES Category
**Purpose:** Inspirational, motivational, philosophical quotes

**Mood Distribution:**
- `serene` (30%): Peaceful landscapes, sunsets, calm water
- `ethereal` (25%): Dreamy, soft focus, bokeh effects
- `atmospheric` (20%): Moody skies, dramatic lighting
- `contemplative` (15%): Empty spaces, solitude, introspection
- `peaceful` (10%): Zen gardens, meditation vibes

**Big Hit Keywords:**
```
love, success, courage, strength, wisdom, dream, faith, peace, hope,
truth, beauty, freedom, justice, knowledge, life, death, time, change,
growth, journey, path, mountain, ocean, sky, light, darkness, soul, spirit
```

**Target Image Characteristics:**
- Natural landscapes with soft lighting
- Empty spaces suggesting contemplation
- Bokeh backgrounds and soft focus
- Sunrises/sunsets with reflection
- Water reflections and peaceful scenes
- Minimum 1000 images across all moods

---

### FACTS Category
**Purpose:** Educational, informative, scientific facts

**Mood Distribution:**
- `minimalist` (30%): Clean white backgrounds, simple composition
- `clean` (25%): Organized, uncluttered, clear visual hierarchy
- `sharp` (20%): Detailed focus, macro photography, precision
- `educational` (15%): Diagrams, charts, organized information
- `scientific` (10%): Lab equipment, microscopy, technical imagery

**Big Hit Keywords:**
```
science, knowledge, technology, learn, truth, nature, explore, research,
discovery, innovation, data, study, brain, universe, earth, physics,
chemistry, biology, evolution, quantum, space, energy, matter, light, sound
```

**Target Image Characteristics:**
- Laboratory and technical equipment
- Organized workspaces and minimal aesthetics
- Educational diagrams and blueprints
- Macro photography (nature details)
- Charts, infographics, and data visualization
- Minimum 1000 images across all moods

---

### JOKES Category
**Purpose:** Humorous, funny, entertaining jokes

**Mood Distribution:**
- `vibrant` (30%): Bright, saturated colors, high energy
- `playful` (25%): Fun compositions, humorous subjects
- `bright` (20%): Daylight, cheerful lighting
- `colorful` (15%): Multi-colored, energetic palette
- `energetic` (10%): Action, movement, dynamic energy

**Big Hit Keywords:**
```
cat, dog, funny, laugh, happy, silly, fun, play, joke, humor, comedy,
person, people, animal, pet, food, money, work, family, friend,
ridiculous, crazy, weird, strange, odd, clever, smart
```

**Target Image Characteristics:**
- Funny animals (cats, dogs, pets in humorous situations)
- People laughing and smiling
- Colorful, vibrant compositions
- Playful activities and silly moments
- Animated GIFs converted to stills
- Minimum 1000 images across all moods

---

## PART 2: KEYWORD EXTRACTION BY CATEGORY

### Big Hits Extraction

**Category-Specific Keywords:**

```typescript
const QUOTE_BIG_HITS = [
  'love', 'success', 'courage', 'strength', 'wisdom', 'dream', 'faith',
  'peace', 'hope', 'truth', 'beauty', 'freedom', 'justice', 'knowledge',
  'life', 'death', 'time', 'change', 'growth', 'journey', 'path',
  'mountain', 'ocean', 'sky', 'light', 'darkness', 'soul', 'spirit'
];

const FACTS_BIG_HITS = [
  'science', 'knowledge', 'technology', 'learn', 'truth', 'nature', 'explore',
  'research', 'discovery', 'innovation', 'data', 'study', 'brain', 'universe',
  'earth', 'physics', 'chemistry', 'biology', 'evolution', 'quantum', 'space'
];

const JOKES_BIG_HITS = [
  'cat', 'dog', 'funny', 'laugh', 'happy', 'silly', 'fun', 'play',
  'joke', 'humor', 'comedy', 'person', 'people', 'animal', 'pet',
  'food', 'money', 'work', 'family', 'friend', 'ridiculous', 'crazy'
];
```

### Category-Aware Extraction Function

```typescript
function getKeywordsByCategory(category: string): string[] {
  const keywordMap = {
    'quotes': QUOTE_BIG_HITS,
    'facts': FACTS_BIG_HITS,
    'jokes': JOKES_BIG_HITS
  };
  return keywordMap[category] || QUOTE_BIG_HITS;
}

function extractKeywords(text: string, category: string): string[] {
  const categoryKeywords = getKeywordsByCategory(category);
  const primaryKeywords = extractBigHits(text, categoryKeywords);
  const secondaryKeywords = extractTFIDF(text, 5);
  return [...primaryKeywords, ...secondaryKeywords.slice(0, 3)];
}
```

---

## PART 3: MOOD MATCHING BY CATEGORY

### Mood-Based Image Selection

```typescript
function getMoodByCategory(category: string): string[] {
  const moodMap = {
    'quotes': ['serene', 'ethereal', 'atmospheric', 'contemplative', 'peaceful'],
    'facts': ['minimalist', 'clean', 'sharp', 'educational', 'scientific'],
    'jokes': ['vibrant', 'playful', 'bright', 'colorful', 'energetic']
  };
  return moodMap[category] || moodMap['quotes'];
}
```

### Edge Function Implementation

**Location:** `supabase/functions/smart-image-match/index.ts`

**Process:**
1. Receive: contentText + category
2. Extract category-specific keywords
3. Get mood list for category
4. Query database: WHERE category=? AND mood IN (...)
5. Rank by keyword matches
6. Return top 10 images
7. Cache for 30 days

**API Request:**
```json
POST /functions/v1/smart-image-match
{
  "contentText": "Quote or fact or joke text",
  "category": "quotes" | "facts" | "jokes"
}
```

**API Response:**
```json
{
  "success": true,
  "count": 10,
  "images": [
    {
      "id": "uuid-1",
      "url": "https://images.pexels.com/...",
      "mood": "serene",
      "keywords": ["peaceful", "nature", "calm"],
      "source": "pexels"
    },
    ...
  ],
  "cached": false
}
```

---

## PART 4: DATABASE POPULATION

### Sample Database Schema

```sql
-- Background images table
INSERT INTO background_images (url, category, mood, keywords, source, source_id)
VALUES
  -- QUOTES - SERENE
  ('https://images.pexels.com/photos/1761279/...', 'quotes', 'serene', ARRAY['serene', 'peaceful', 'sunset', 'calm'], 'pexels', '1761279'),
  ('https://images.pexels.com/photos/1619317/...', 'quotes', 'serene', ARRAY['landscape', 'mountain', 'serene', 'peaceful'], 'pexels', '1619317'),

  -- QUOTES - ETHEREAL
  ('https://images.pexels.com/photos/1470496/...', 'quotes', 'ethereal', ARRAY['ethereal', 'dreamy', 'soft', 'bokeh'], 'pexels', '1470496'),

  -- FACTS - MINIMALIST
  ('https://images.pexels.com/photos/3945683/...', 'facts', 'minimalist', ARRAY['minimalist', 'clean', 'white', 'simple'], 'pexels', '3945683'),

  -- JOKES - VIBRANT
  ('https://images.pexels.com/photos/3945657/...', 'jokes', 'vibrant', ARRAY['vibrant', 'colorful', 'happy', 'bright'], 'pexels', '3945657');
```

### Bulk Population Script

Use `src/lib/imagePopulator.ts`:

```typescript
export async function populateBackgroundImages(supabaseClient: any) {
  for (const category of ['quotes', 'facts', 'jokes']) {
    for (const mood of getMoodsForCategory(category)) {
      const images = getImagesForMood(category, mood);

      const { error } = await supabaseClient
        .from('background_images')
        .insert(images.map(img => ({
          url: img.url,
          category,
          mood,
          keywords: img.keywords,
          source: img.source,
          source_id: img.sourceId
        })));

      if (error) console.error(`Failed to insert ${category}/${mood}:`, error);
    }
  }
}
```

---

## PART 5: FRONTEND COMPONENT UPDATES

### Component 1: QuoteShareModal

```typescript
interface QuoteShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteText: string;
  quoteAuthor?: string;
  category?: 'quotes' | 'facts' | 'jokes';
}

export function QuoteShareModal({
  isOpen,
  onClose,
  quoteText,
  quoteAuthor,
  category = 'quotes'
}: QuoteShareModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Pass category to image generator
      generateQuoteImageWithBackground(quoteText, quoteAuthor, category);
    }
  }, [isOpen, quoteText, quoteAuthor, category]);
}
```

### Component 2: canvasImageGenerator

```typescript
async function getSmartMatchedImage(
  contentText: string,
  category: string = 'quotes'
): Promise<string> {
  try {
    const functionUrl = `${supabaseUrl}/functions/v1/smart-image-match`;

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`
      },
      body: JSON.stringify({ contentText, category })
    });

    const data = await response.json();

    if (!data.images || data.images.length === 0) {
      return getRandomFallbackImage();
    }

    // Randomly select from top 10 for variety
    const randomIndex = Math.floor(Math.random() * data.images.length);
    return data.images[randomIndex].url;
  } catch (error) {
    return getRandomFallbackImage();
  }
}

export async function generateQuoteImageWithBackground(
  quoteText: string,
  quoteAuthor?: string,
  category: string = 'quotes'
): Promise<File | null> {
  // ... existing canvas code ...
  const backgroundUrl = await getSmartMatchedImage(quoteText, category);
  // ... rest of function ...
}
```

### Component 3: DisplayScreen (Pass Category)

```typescript
const category = useMemo(() => {
  switch(selectedTopic) {
    case 'inspiration':
    case 'motivation':
      return 'quotes';
    case 'funny':
      return 'jokes';
    default:
      return 'quotes';
  }
}, [selectedTopic]);

// Pass to modal
<QuoteShareModal
  isOpen={showShareModal}
  onClose={() => setShowShareModal(false)}
  quoteText={quote.quote_text}
  quoteAuthor={quote.author}
  category={category}
/>
```

---

## PART 6: TESTING BY CATEGORY

### Test Case 1: Quotes

**Input:**
```
"The greatest glory in living lies not in never falling,
but in rising every time we fall."
```

**Expected Extraction:**
- Big Hits: glory, living, falling, rising (HIGH PRIORITY)
- TF-IDF: greatest, lying, rising (SECONDARY)

**Expected Mood Filter:**
- serene, ethereal, atmospheric, contemplative, peaceful

**Expected Result:**
- Top images show sunsets, landscapes, empty spaces
- Soft, peaceful aesthetic

---

### Test Case 2: Facts

**Input:**
```
"The human brain contains approximately 86 billion neurons,
each capable of making thousands of connections."
```

**Expected Extraction:**
- Big Hits: brain, neurons, human (HIGH PRIORITY)
- TF-IDF: billions, connections, capable (SECONDARY)

**Expected Mood Filter:**
- minimalist, clean, sharp, educational, scientific

**Expected Result:**
- Top images show brain diagrams, lab equipment
- Organized, scientific aesthetic

---

### Test Case 3: Jokes

**Input:**
```
"Why did the cat sit on the computer?
Because it wanted to keep an eye on the mouse!"
```

**Expected Extraction:**
- Big Hits: cat, mouse, eye, computer (HIGH PRIORITY)
- TF-IDF: wanted, computer, eye (SECONDARY)

**Expected Mood Filter:**
- vibrant, playful, bright, colorful, energetic

**Expected Result:**
- Top images show funny cats, animals, computers
- Colorful, playful aesthetic

---

## PART 7: DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Run `npm run typecheck` (no errors)
- [ ] Run `npm run build` (succeeds)
- [ ] Edge function tested with all three categories
- [ ] Database verified: 100+ images per mood
- [ ] Verify image URLs are accessible
- [ ] Test with sample quotes/jokes/facts

### Deployment
- [ ] Deploy edge function: smart-image-match
- [ ] Deploy updated canvasImageGenerator.ts
- [ ] Deploy updated QuoteShareModal.tsx
- [ ] Deploy updated DisplayScreen.tsx
- [ ] Verify category parameter flows through system

### Post-Deployment
- [ ] Test share on QuoteoftheDay.com (serene images)
- [ ] Test share on FactsofDay.com (minimalist images)
- [ ] Test share on JokesofDay.com (vibrant images)
- [ ] Verify cache is working (same content = same images)
- [ ] Monitor edge function logs for errors
- [ ] Monitor database query performance

---

## PART 8: MONITORING & OPTIMIZATION

### Success Metrics

**QUOTES Category:**
- Image match accuracy: >80% should be serene/ethereal
- Cache hit rate: >70% (quotes shared multiple times)
- Average match time: <1 second

**FACTS Category:**
- Image match accuracy: >85% should be educational/minimalist
- Cache hit rate: >60% (facts vary daily)
- Average match time: <1 second

**JOKES Category:**
- Image match accuracy: >75% should be vibrant/playful
- Cache hit rate: >70% (jokes shared frequently)
- Average match time: <1 second

### Troubleshooting

**Problem:** Wrong mood images appearing for quotes
**Solution:** Verify "serene" images have keywords: sunset, peaceful, landscape, calm

**Problem:** Educational images not matching facts
**Solution:** Verify "educational" mood has technical/scientific keywords; add more diagrams

**Problem:** Jokes not funny enough
**Solution:** Increase "playful" mood images with animals; add more colorful, energetic compositions

---

## PART 9: QUICK REFERENCE

### Category → Mood Mapping

```
QUOTES:
  serene → sunsets, calm water, peaceful landscape (30%)
  ethereal → dreamy, soft focus, bokeh (25%)
  atmospheric → dramatic sky, moody lighting (20%)
  contemplative → empty space, solitude (15%)
  peaceful → zen, meditation, tranquility (10%)

FACTS:
  minimalist → clean, white, simple (30%)
  clean → organized, uncluttered (25%)
  sharp → detailed, macro photography (20%)
  educational → diagrams, charts (15%)
  scientific → lab, microscopy, technical (10%)

JOKES:
  vibrant → bright colors, high saturation (30%)
  playful → fun animals, humorous subjects (25%)
  bright → daylight, cheerful lighting (20%)
  colorful → multi-colored, energetic (15%)
  energetic → action, movement, dynamic (10%)
```

### Big Hits by Category

```
QUOTES: love, success, courage, wisdom, dream, faith, peace
FACTS: science, knowledge, technology, research, discovery, brain
JOKES: cat, dog, funny, laugh, happy, silly, fun, animal
```

---

## Summary

This v1.34 guide provides:

1. **Complete Category Definitions** - Moods, keywords, image types for each category
2. **Keyword Extraction Strategy** - Category-specific big hits + TF-IDF
3. **Database Population** - 1000+ images per category pre-loaded
4. **Edge Function Integration** - Smart-image-match processes requests
5. **Frontend Updates** - Components pass category through system
6. **Testing Framework** - Validate each category works correctly
7. **Deployment Process** - Step-by-step production rollout

---

**End of QuoteofDay Installation Guide v1.34**
