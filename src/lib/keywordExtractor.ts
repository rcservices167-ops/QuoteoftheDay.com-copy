/**
 * Hybrid Keyword Extraction: Simple Regex + TF-IDF
 *
 * Strategy:
 * 1. BIG HITS: Use simple regex for high-priority matches (Cat, Dog, Love, Money, etc)
 * 2. SAFETY NET: Use TF-IDF on abstract content to find meaningful keywords
 * 3. Combine both for targeted image search
 */

// High-priority keywords that always match (exact case-insensitive)
const BIG_HITS = [
  // Animals
  'cat', 'cats', 'dog', 'dogs', 'bird', 'birds', 'horse', 'lion', 'eagle',
  'wolf', 'fox', 'rabbit', 'butterfly', 'fish', 'whale', 'shark', 'snake',

  // Emotions & Relationships
  'love', 'laugh', 'happy', 'sad', 'angry', 'fear', 'hope', 'dream',
  'family', 'friend', 'friend', 'relationship', 'mother', 'father',

  // Nature & Elements
  'sunset', 'sunrise', 'ocean', 'mountain', 'forest', 'tree', 'flower',
  'sky', 'rain', 'storm', 'sun', 'moon', 'star', 'night', 'day',

  // Concepts & Values
  'success', 'failure', 'courage', 'strength', 'power', 'wisdom', 'truth',
  'beauty', 'peace', 'freedom', 'justice', 'knowledge', 'money', 'wealth',
  'health', 'life', 'death', 'work', 'time',

  // Actions & States
  'run', 'jump', 'fly', 'dance', 'sing', 'cry', 'smile', 'think', 'grow',
  'believe', 'try', 'persist', 'persist'
];

/**
 * Simple Regex Extractor - Fast, high-precision matches
 * Returns keywords that are guaranteed hits for image search
 */
export function extractBigHits(text: string): string[] {
  const lowerText = text.toLowerCase();
  const hits: string[] = [];

  for (const keyword of BIG_HITS) {
    // Word boundary match to avoid partial matches (e.g., "caterpillar" matching "cat")
    const regex = new RegExp(`\\b${keyword}s?\\b`, 'g');
    if (regex.test(lowerText)) {
      hits.push(keyword);
    }
  }

  return [...new Set(hits)]; // Remove duplicates
}

/**
 * TF-IDF Extractor - Sophisticated analysis for abstract content
 * Identifies statistically significant terms that describe the content
 *
 * TF-IDF = (Term Frequency in Doc / Total Words) * log(Total Docs / Docs with Term)
 * Higher score = more meaningful keyword
 */
export function extractTFIDF(text: string, topN: number = 5): string[] {
  // Stop words to filter out (common but meaningless words)
  const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'can', 'it', 'its', 'this',
    'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they',
    'what', 'which', 'who', 'why', 'how', 'if', 'as', 'so', 'than', 'up'
  ]);

  // Tokenize: convert to lowercase, split by non-word chars, remove empty strings
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));

  if (words.length === 0) return [];

  // Calculate term frequency
  const termFreq = new Map<string, number>();
  for (const word of words) {
    termFreq.set(word, (termFreq.get(word) || 0) + 1);
  }

  // Convert frequencies to TF scores (normalize by total words)
  const tfScores = new Map<string, number>();
  for (const [term, freq] of termFreq.entries()) {
    tfScores.set(term, freq / words.length);
  }

  // Simple IDF approximation: penalize very common words slightly
  // (In a real system, you'd use corpus-wide statistics)
  const idfBoosts = new Map<string, number>();
  for (const term of tfScores.keys()) {
    // Assume common corpus: IDF = log(1 + termFreq)
    idfBoosts.set(term, Math.log(1 + tfScores.get(term)!));
  }

  // Calculate TF-IDF scores
  const tfidfScores: Array<[string, number]> = [];
  for (const [term, tf] of tfScores.entries()) {
    const idf = idfBoosts.get(term) || 0;
    const tfidf = tf * idf;
    tfidfScores.push([term, tfidf]);
  }

  // Sort by score descending and return top N
  return tfidfScores
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([term]) => term);
}

/**
 * Hybrid Keyword Extraction - Combines both strategies
 * Returns: Big Hits first (highest priority) + TF-IDF results (secondary)
 */
export function extractKeywords(
  text: string,
  includeSecondary: boolean = true
): string[] {
  // Priority 1: Big Hits (exact matches)
  const primaryKeywords = extractBigHits(text);

  if (!includeSecondary) {
    return primaryKeywords;
  }

  // Priority 2: TF-IDF (abstract terms) - but exclude primary keywords
  const secondaryKeywords = extractTFIDF(text, 5);
  const filtered = secondaryKeywords.filter(
    kw => !primaryKeywords.includes(kw)
  );

  // Combine: primary keywords + up to 3 secondary keywords
  return [...primaryKeywords, ...filtered.slice(0, 3)];
}

/**
 * Generate search query for image API
 * Combines all keywords into a single, optimized search string
 */
export function generateSearchQuery(
  keywords: string[],
  mood: string
): string {
  if (keywords.length === 0) {
    return mood;
  }

  // Prioritize primary keywords (first 2) + mood
  const primary = keywords.slice(0, 2).join(' ');
  return `${primary} ${mood}`;
}

/**
 * Hash content for caching purposes
 * Deterministic SHA-like hash (simple version for frontend use)
 */
export function hashContent(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `hash_${Math.abs(hash).toString(36)}`;
}
