import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SmartMatchRequest {
  contentText: string;
  category: "jokes" | "facts" | "quotes";
  contentHash?: string;
}

interface MatchedImage {
  id: string;
  url: string;
  mood: string;
  keywords: string[];
  source: string;
}

/**
 * Simple regex for high-priority keywords
 */
const BIG_HITS = [
  "cat", "dog", "bird", "horse", "lion", "eagle", "wolf", "fox",
  "love", "laugh", "happy", "sad", "angry", "fear", "hope",
  "sunset", "sunrise", "ocean", "mountain", "forest", "tree",
  "success", "failure", "courage", "strength", "wisdom", "truth",
  "money", "wealth", "health", "life", "death", "work", "time"
];

/**
 * Extract big hit keywords from text
 */
function extractBigHits(text: string): string[] {
  const lowerText = text.toLowerCase();
  const hits: string[] = [];

  for (const keyword of BIG_HITS) {
    const regex = new RegExp(`\\b${keyword}s?\\b`, "g");
    if (regex.test(lowerText)) {
      hits.push(keyword);
    }
  }

  return [...new Set(hits)];
}

/**
 * Extract meaningful keywords using TF-IDF
 */
function extractTFIDF(text: string, topN: number = 5): string[] {
  const STOP_WORDS = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "it", "its", "this", "that", "i", "you", "he", "she", "we", "they"
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));

  if (words.length === 0) return [];

  const termFreq = new Map<string, number>();
  for (const word of words) {
    termFreq.set(word, (termFreq.get(word) || 0) + 1);
  }

  const tfidfScores: Array<[string, number]> = [];
  for (const [term, freq] of termFreq.entries()) {
    const tf = freq / words.length;
    const idf = Math.log(1 + tf);
    tfidfScores.push([term, tf * idf]);
  }

  return tfidfScores
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([term]) => term);
}

/**
 * Combine keywords and get appropriate mood
 */
function extractKeywords(text: string): string[] {
  const primary = extractBigHits(text);
  const secondary = extractTFIDF(text, 5).filter(kw => !primary.includes(kw));
  return [...primary, ...secondary.slice(0, 3)];
}

/**
 * Get mood based on category
 */
function getMoodByCategory(category: string): string[] {
  const moodMap: { [key: string]: string[] } = {
    jokes: ["vibrant", "playful", "bright", "colorful", "energetic"],
    facts: ["minimalist", "clean", "sharp", "educational", "scientific"],
    quotes: ["serene", "ethereal", "atmospheric", "contemplative", "peaceful"]
  };
  return moodMap[category] || moodMap["quotes"];
}

/**
 * Query Supabase for matching images
 */
async function queryMatchingImages(
  supabase: any,
  keywords: string[],
  moods: string[],
  category: string
): Promise<MatchedImage[]> {
  try {
    let query = supabase
      .from("background_images")
      .select("id, url, mood, keywords, source")
      .eq("category", category)
      .in("mood", moods);

    // If we have keywords, filter by them
    if (keywords.length > 0) {
      // Build OR filter for keywords
      const keywordFilters = keywords
        .map((kw, i) => `keywords.cs.{${kw}}`)
        .join(",");
      query = query.or(keywordFilters);
    }

    // Get top 10 matches
    const { data, error } = await query.limit(10);

    if (error) {
      console.error("Query error:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Database query failed:", err);
    return [];
  }
}

/**
 * Fallback to random images if no matches found
 */
async function getFallbackImages(
  supabase: any,
  category: string,
  limit: number = 10
): Promise<MatchedImage[]> {
  try {
    const { data } = await supabase
      .from("background_images")
      .select("id, url, mood, keywords, source")
      .eq("category", category)
      .limit(limit);

    return data || [];
  } catch (err) {
    console.error("Fallback query failed:", err);
    return [];
  }
}

/**
 * Cache matched images for future use
 */
async function cacheMatchedImages(
  supabase: any,
  contentHash: string,
  category: string,
  imageIds: string[]
): Promise<void> {
  try {
    await supabase
      .from("image_cache")
      .insert({
        content_hash: contentHash,
        category,
        matched_image_ids: imageIds
      })
      .throwOnError();
  } catch (err) {
    // Cache failure is not critical
    console.log("Cache write failed (non-critical):", err);
  }
}

/**
 * Retrieve cached images if available
 */
async function getCachedImages(
  supabase: any,
  contentHash: string
): Promise<string[] | null> {
  try {
    const { data } = await supabase
      .from("image_cache")
      .select("matched_image_ids")
      .eq("content_hash", contentHash)
      .maybeSingle();

    return data?.matched_image_ids || null;
  } catch {
    return null;
  }
}

/**
 * Simple hash function for content
 */
function hashContent(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `hash_${Math.abs(hash).toString(36)}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body = (await req.json()) as SmartMatchRequest;
    const { contentText, category, contentHash: providedHash } = body;

    if (!contentText || !category) {
      return new Response(
        JSON.stringify({ error: "Missing contentText or category" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const contentHash = providedHash || hashContent(contentText);

    // Try to get cached images first
    const cachedIds = await getCachedImages(supabase, contentHash);

    let imageIds: string[];
    let matchedImages: MatchedImage[];

    if (cachedIds && cachedIds.length > 0) {
      // Use cache - fetch full image objects by IDs
      const { data } = await supabase
        .from("background_images")
        .select("id, url, mood, keywords, source")
        .in("id", cachedIds);
      matchedImages = data || [];
      imageIds = cachedIds;
    } else {
      // Extract keywords
      const keywords = extractKeywords(contentText);
      const moods = getMoodByCategory(category);

      // Query for matching images
      matchedImages = await queryMatchingImages(
        supabase,
        keywords,
        moods,
        category
      );

      // Fallback to random if no matches
      if (matchedImages.length === 0) {
        matchedImages = await getFallbackImages(supabase, category, 10);
      }

      imageIds = matchedImages.map(img => img.id);

      // Cache the result
      if (imageIds.length > 0) {
        await cacheMatchedImages(supabase, contentHash, category, imageIds);
      }
    }

    // Return matched images
    return new Response(
      JSON.stringify({
        success: true,
        count: matchedImages.length,
        images: matchedImages,
        cached: cachedIds ? true : false
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process image matching request",
        details: String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
