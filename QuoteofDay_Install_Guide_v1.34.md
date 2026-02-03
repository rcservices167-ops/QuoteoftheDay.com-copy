# QuoteofDay.com Category-Specific Implementation Guide v1.34
## Smart Image Matching System for Quotes, Facts, and Jokes

**Version:** 1.34 (Category-Specific Implementation of v1.31 Smart Image Matching)
**Date:** January 31, 2026
**Status:** ✅ READY FOR IMPLEMENTATION
**Purpose:** Step-by-step guide for implementing smart image matching specifically for quote, fact, and joke categories
**Target Domains:** QuoteoftheDay.com, FactsofDay.com, JokesofDay.com

---

## Quick Start Summary

This guide implements the smart image matching system from **Master_Install_Guide_v1.31** with specific focus on:
- Category detection and routing
- Mood-based image filtering for each category
- Keyword extraction tuned for quotes, facts, and jokes
- Database population with category-specific images

---

## PART 1: Category-Specific Database Setup

### 1.1 Image Categories & Moods

#### QUOTES Category
**Purpose:** Inspirational, motivational, philosophical quotes
**Mood Palette:**
- `serene`: Peaceful landscapes, sunsets, calm water (30%)
- `ethereal`: Dreamy, soft focus, bokeh effects (25%)
- `atmospheric`: Moody skies, dramatic lighting (20%)
- `contemplative`: Empty spaces, solitude, introspection (15%)
- `peaceful`: Zen gardens, meditation vibes (10%)

**Keyword Examples:**
- Big Hits: love, success, courage, strength, wisdom, dream, faith, peace
- TF-IDF: motivation, inspiration, growth, reflection, journey, soul, spirit

**Target Images:** 1000+
- Natural landscapes with soft lighting
- Empty spaces suggesting contemplation
- Bokeh backgrounds
- Sunrises/sunsets
- Water reflections

#### FACTS Category
**Purpose:** Educational, informative, scientific facts
**Mood Palette:**
- `minimalist`: Clean white backgrounds, simple composition (30%)
- `clean`: Organized, uncluttered, clear visual hierarchy (25%)
- `sharp`: Detailed focus, macro photography, precision (20%)
- `educational`: Diagrams, charts, organized information (15%)
- `scientific`: Lab equipment, microscopy, technical imagery (10%)

**Keyword Examples:**
- Big Hits: science, knowledge, technology, learn, truth, nature, explore
- TF-IDF: research, discovery, analysis, innovation, information, data, study

**Target Images:** 1000+
- Laboratory and technical equipment
- Organized workspaces
- Educational diagrams and blueprints
- Macro photography (nature details)
- Charts and infographics

#### JOKES Category
**Purpose:** Humorous, funny, entertaining jokes
**Mood Palette:**
- `vibrant`: Bright, saturated colors, high energy (30%)
- `playful`: Fun compositions, humorous subjects (25%)
- `bright`: Daylight, cheerful lighting (20%)
- `colorful`: Multi-colored, energetic palette (15%)
- `energetic`: Action, movement, dynamic energy (10%)

**Keyword Examples:**
- Big Hits: cat, dog, funny, laugh, happy, silly, fun, play
- TF-IDF: humor, wit, comedy, entertainment, absurd, ridiculous, jest

**Target Images:** 1000+
- Funny animals (cats, dogs, pets)
- People laughing and smiling
- Colorful, vibrant compositions
- Playful activities
- Animated GIFs (converted to stills)

---

## PART 2: Category-Specific Keyword Extraction

### 2.1 Big Hits by Category

**QUOTES Big Hits** (High-Priority Keywords)
```typescript
const QUOTE_BIG_HITS = [
  'love', 'success', 'courage', 'strength', 'wisdom', 'dream', 'faith',
  'peace', 'hope', 'truth', 'beauty', 'freedom', 'justice', 'knowledge',
  'life', 'death', 'time', 'change', 'growth', 'journey', 'path',
  'mountain', 'ocean', 'sky', 'light', 'darkness', 'soul', 'spirit'
];
```

**FACTS Big Hits** (High-Priority Keywords)
```typescript
const FACTS_BIG_HITS = [
  'science', 'knowledge', 'technology', 'learn', 'truth', 'nature', 'explore',
  'research', 'discovery', 'innovation', 'data', 'study', 'brain', 'universe',
  'earth', 'physics', 'chemistry', 'biology', 'evolution', 'quantum', 'space'
];
```

**JOKES Big Hits** (High-Priority Keywords)
```typescript
const JOKES_BIG_HITS = [
  'cat', 'dog', 'funny', 'laugh', 'happy', 'silly', 'fun', 'play',
  'joke', 'humor', 'comedy', 'person', 'people', 'animal', 'pet',
  'food', 'money', 'work', 'family', 'friend', 'ridiculous', 'crazy'
];
```

### 2.2 Category-Aware Extraction in Edge Function

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

## PART 3: Image Database Population by Category

### 3.1 Sample Images Structure

```typescript
// QUOTES Category - Serene Mood
const QUOTES_SERENE = [
  {
    url: 'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg',
    keywords: ['serene', 'peaceful', 'sunset', 'calm', 'nature'],
    sourceId: '1761279',
    mood: 'serene'
  },
  {
    url: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg',
    keywords: ['landscape', 'mountain', 'serene', 'peaceful'],
    sourceId: '1619317',
    mood: 'serene'
  },
  // ... 198 more images per mood
];

// FACTS Category - Minimalist Mood
const FACTS_MINIMALIST = [
  {
    url: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
    keywords: ['minimalist', 'clean', 'simple', 'white', 'organized'],
    sourceId: '3945683',
    mood: 'minimalist'
  },
  // ... 199 more images per mood
];

// JOKES Category - Vibrant Mood
const JOKES_VIBRANT = [
  {
    url: 'https://images.pexels.com/photos/3945657/pexels-photo-3945657.jpeg',
    keywords: ['vibrant', 'colorful', 'happy', 'funny', 'playful'],
    sourceId: '3945657',
    mood: 'vibrant'
  },
  // ... 199 more images per mood
];
```

### 3.2 Batch Population Script

```typescript
// src/scripts/populateImagesByCategory.ts
import { createClient } from '@supabase/supabase-js';

async function populateCategoryImages() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Populate quotes
  await populateCategory('quotes', [
    { mood: 'serene', images: QUOTES_SERENE },
    { mood: 'ethereal', images: QUOTES_ETHEREAL },
    { mood: 'atmospheric', images: QUOTES_ATMOSPHERIC },
    { mood: 'contemplative', images: QUOTES_CONTEMPLATIVE },
    { mood: 'peaceful', images: QUOTES_PEACEFUL },
  ]);

  // Populate facts
  await populateCategory('facts', [
    { mood: 'minimalist', images: FACTS_MINIMALIST },
    { mood: 'clean', images: FACTS_CLEAN },
    { mood: 'sharp', images: FACTS_SHARP },
    { mood: 'educational', images: FACTS_EDUCATIONAL },
    { mood: 'scientific', images: FACTS_SCIENTIFIC },
  ]);

  // Populate jokes
  await populateCategory('jokes', [
    { mood: 'vibrant', images: JOKES_VIBRANT },
    { mood: 'playful', images: JOKES_PLAYFUL },
    { mood: 'bright', images: JOKES_BRIGHT },
    { mood: 'colorful', images: JOKES_COLORFUL },
    { mood: 'energetic', images: JOKES_ENERGETIC },
  ]);

  console.log('Category-specific images populated successfully');
}
```

---

## PART 4: Component Implementation

### 4.1 Updated QuoteOfTheDay Component

The `QuoteOfTheDay.tsx` component already detects category:

```typescript
// Current implementation - NO CHANGES NEEDED
const [selectedTopic, setSelectedTopic] = useState<
  'inspiration' | 'motivation' | 'funny'
>('inspiration');

// Map to database category
const getCategory = (topic: string): 'quotes' | 'facts' | 'jokes' => {
  switch(topic) {
    case 'inspiration':
    case 'motivation':
      return 'quotes';
    case 'funny':
      return 'jokes';
    default:
      return 'quotes';
  }
};

const category = getCategory(selectedTopic);
```

### 4.2 Updated QuoteShareModal Component

```typescript
interface QuoteShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteText: string;
  quoteAuthor?: string;
  category?: 'quotes' | 'facts' | 'jokes'; // NEW: Add category
}

export function QuoteShareModal({
  isOpen,
  onClose,
  quoteText,
  quoteAuthor,
  category = 'quotes' // NEW: Default to quotes
}: QuoteShareModalProps) {
  // ... existing code ...

  const generateImage = async () => {
    setIsGenerating(true);
    try {
      // NEW: Pass category to image generator
      const file = await generateQuoteImageWithBackground(
        quoteText,
        quoteAuthor,
        category // Add this parameter
      );
      if (file) {
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        setImageFile(file);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // ... rest of component ...
}
```

### 4.3 DisplayScreen Component Integration

```typescript
// In DisplayScreen.tsx, pass category to QuoteShareModal
<QuoteShareModal
  isOpen={showShareModal}
  onClose={() => setShowShareModal(false)}
  quoteText={quote.quote_text}
  quoteAuthor={quote.author}
  category={category} // NEW: Pass detected category
/>
```

---

## PART 5: Testing by Category

### 5.1 Quote Matching Test
```typescript
// Test content
const quoteText = "The greatest glory in living lies not in never falling, but in rising every time we fall.";

// Expected extraction
// Big Hits: glory, living, falling, rising
// TF-IDF: greatest, lying, rising

// Expected mood filter: serene, ethereal, atmospheric, contemplative, peaceful
// Expected images: Sunset landscapes, empty spaces, bokeh effects
```

### 5.2 Fact Matching Test
```typescript
// Test content
const factText = "The human brain contains approximately 86 billion neurons, each capable of making thousands of connections.";

// Expected extraction
// Big Hits: brain, neurons, human
// TF-IDF: billions, connections, capable

// Expected mood filter: minimalist, clean, sharp, educational, scientific
// Expected images: Brain diagrams, neurons, organized layouts, microscopy
```

### 5.3 Joke Matching Test
```typescript
// Test content
const jokeText = "Why did the cat sit on the computer? Because it wanted to keep an eye on the mouse!";

// Expected extraction
// Big Hits: cat, mouse, eye, computer
// TF-IDF: wanted, computer

// Expected mood filter: vibrant, playful, bright, colorful, energetic
// Expected images: Funny cats, mice, computers, people laughing
```

---

## PART 6: Deployment Checklist

### Pre-Deployment
- [ ] Run `npm run typecheck` (no TypeScript errors)
- [ ] Run `npm run build` (build succeeds)
- [ ] Test edge function with all three categories
- [ ] Verify database has minimum images:
  - [ ] 100+ quotes images (all moods)
  - [ ] 100+ facts images (all moods)
  - [ ] 100+ jokes images (all moods)

### Deployment
- [ ] Deploy edge function: `smart-image-match`
- [ ] Deploy updated `canvasImageGenerator.ts`
- [ ] Deploy updated component files
- [ ] Verify QuoteShareModal receives category parameter

### Post-Deployment
- [ ] Test share on QuoteoftheDay.com (serene images)
- [ ] Test share on FactsofDay.com (minimalist images)
- [ ] Test share on JokesofDay.com (vibrant images)
- [ ] Verify cache is working (same quote, different images)
- [ ] Monitor edge function logs for errors

---

## PART 7: Monitoring & Optimization

### 7.1 Key Metrics by Category

**QUOTES**
- Image match accuracy: >80% should be contemplative/serene
- Average load time: <1.5 seconds
- Cache hit rate: >70% (users share same quotes)

**FACTS**
- Image match accuracy: >85% should be educational/minimalist
- Average load time: <1 second
- Cache hit rate: >60% (fact variety changes daily)

**JOKES**
- Image match accuracy: >75% should be vibrant/playful
- Average load time: <1 second
- Cache hit rate: >70% (people share funny jokes multiple times)

### 7.2 Troubleshooting by Category

**Quotes: Wrong mood images appearing?**
- Solution: Verify "serene" images have keywords like "sunset", "peaceful", "landscape"
- Check TF-IDF extraction for abstract keywords

**Facts: Educational images not matching?**
- Solution: Verify "educational" mood has technical/scientific keywords
- Add more diagrams and macro photography

**Jokes: Not funny enough?**
- Solution: Increase "playful" mood images with animals
- Add more colorful, energetic compositions

---

## PART 8: File Checklist (100% Regeneration)

### New Files to Create
- [ ] `src/lib/keywordExtractor.ts` - Keyword extraction utility
- [ ] `src/lib/imagePopulator.ts` - Database population
- [ ] `supabase/functions/smart-image-match/index.ts` - Edge function
- [ ] `master_install_guide_v1.31.md` - Master guide
- [ ] `QuoteofDay_Install_Guide_v1.34.md` - This file

### Files to Update
- [ ] `src/services/canvasImageGenerator.ts` - Add smart matching
- [ ] `src/components/QuoteShareModal.tsx` - Pass category parameter
- [ ] `src/components/DisplayScreen.tsx` - Pass category to modal

### Database Migrations
- [ ] `20260131_create_background_images_table.sql` - Create tables
- [ ] Run migration via Supabase dashboard

### No Changes Required
- [ ] `src/App.tsx` - Keep as is
- [ ] `src/components/QuoteOfTheDay.tsx` - Already detects category
- [ ] `src/lib/supabase.ts` - Keep as is
- [ ] Other components - Keep as is

---

## PART 9: Quick Reference

### Category → Mood Mapping
```
QUOTES:
  serene → sunsets, calm water, peaceful landscape
  ethereal → dreamy, soft focus, bokeh
  atmospheric → dramatic sky, moody lighting
  contemplative → empty space, solitude
  peaceful → zen, meditation, tranquility

FACTS:
  minimalist → clean, white, simple
  clean → organized, uncluttered
  sharp → detailed, macro photography
  educational → diagrams, charts
  scientific → lab, microscopy, technical

JOKES:
  vibrant → bright colors, high saturation
  playful → fun animals, humorous subjects
  bright → daylight, cheerful lighting
  colorful → multi-colored, energetic
  energetic → action, movement, dynamic
```

### API Request Format
```javascript
POST /functions/v1/smart-image-match

{
  "contentText": "Quote or fact or joke text",
  "category": "quotes" | "facts" | "jokes"
}

// Response
{
  "success": true,
  "count": 10,
  "images": [
    { "id": "...", "url": "...", "mood": "...", "keywords": [...], "source": "..." },
    ...
  ],
  "cached": true | false
}
```

---

## Summary

This guide enables category-specific smart image matching for the QuoteoftheDay.com network:

1. **QUOTES** receive serene, contemplative images
2. **FACTS** receive educational, scientific images
3. **JOKES** receive vibrant, playful images

All powered by intelligent keyword extraction and 30-day result caching.

---

**End of QuoteofDay_Install_Guide_v1.34**
