import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function sanitizeSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

function generateArchivePath(date: string, id: string, slug: string): string {
  const dateObj = new Date(date + "T00:00:00");
  const year = String(dateObj.getUTCFullYear()).slice(-2);
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getUTCDate()).padStart(2, "0");
  const idShort = id.slice(0, 8);
  return `archives/${year}/${month}/${day}/${idShort}/${slug}.html`;
}

function generateSchemaMarkup(quote: any, url: string): string {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Quotation",
    "text": quote.content,
    "author": quote.author ? {
      "@type": "Person",
      "name": quote.author
    } : undefined,
    "inLanguage": "en-US",
    "datePublished": quote.date,
    "url": url,
    "publisher": {
      "@type": "Organization",
      "name": "QuoteoftheDay.com",
      "url": "https://quoteoftheday.com"
    }
  };
  return `<script type="application/ld+json">${JSON.stringify(schemaData)}</script>`;
}

function generateMetaTags(quote: any, domainUrl: string, archivePath: string): string {
  const contentPreview = quote.content.slice(0, 160);
  const fullUrl = `${domainUrl}/${archivePath}`;
  const title = `Quote of the Day - ${quote.date}`;

  return `
  <meta name="description" content="${contentPreview}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta charset="UTF-8">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${fullUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${contentPreview}">
  <meta property="og:image:secure_url" content="${domainUrl}/img/quoteofday_website.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${contentPreview}">
  <link rel="canonical" href="${fullUrl}">
  `;
}

function generateArchiveHTML(quote: any, archivePath: string, domainUrl: string): string {
  const metaTags = generateMetaTags(quote, domainUrl, archivePath);
  const fullUrl = `${domainUrl}/${archivePath}`;
  const schemaMarkup = generateSchemaMarkup(quote, fullUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Quote of the Day - ${quote.date}</title>
  ${metaTags}
  ${schemaMarkup}
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      min-height: 100vh;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .container {
      max-width: 800px;
      width: 100%;
      background: white;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      border: 8px solid #0284c7;
      padding: 40px;
      text-align: center;
    }
    .quote-content {
      margin: 30px 0;
      font-size: 22px;
      font-weight: 500;
      color: #1f2937;
      line-height: 1.8;
      font-style: italic;
    }
    .quote-author {
      font-size: 16px;
      font-weight: 600;
      color: #0369a1;
      margin-top: 20px;
    }
    .category-badge {
      display: inline-block;
      background: #dbeafe;
      color: #0c4a6e;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="quote-content">"${quote.content}"</div>
    ${quote.author ? `<div class="quote-author">— ${quote.author}</div>` : ""}
    ${quote.subcategory ? `<div class="category-badge">${quote.subcategory}</div>` : ""}
  </div>
</body>
</html>`;
}

function generateCompleteSitemap(quotes: any[], domainUrl: string): string {
  const today = new Date().toISOString().split("T")[0];

  const archiveEntries = quotes.map(quote => {
    const slug = sanitizeSlug(quote.content);
    const path = generateArchivePath(quote.date, quote.id, slug);
    const url = `${domainUrl}/${path}`;
    return `  <url>
    <loc>${url}</loc>
    <lastmod>${quote.date}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domainUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${domainUrl}/today.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
${archiveEntries}
</urlset>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const today = new Date().toISOString().split("T")[0];

    const { data: quotes, error: fetchError } = await supabase
      .from("quotes")
      .select("id, content, author, subcategory, date, slug")
      .eq("date", today)
      .limit(1);

    if (fetchError) {
      throw fetchError;
    }

    if (!quotes || quotes.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No quote found for today - local file generation skipped",
          instructions: "Run 'npm run generate-archives' to regenerate local archive files"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const quote = quotes[0];
    const slug = sanitizeSlug(quote.content);
    const archivePath = generateArchivePath(quote.date, quote.id, slug);
    const domainUrl = "https://quoteoftheday.com";

    if (!quote.slug) {
      await supabase
        .from("quotes")
        .update({ slug: archivePath })
        .eq("id", quote.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Local file generation triggered - run 'npm run generate-archives'",
        note: "This edge function checks for today's quote. Archive files are generated locally via npm scripts.",
        quote: {
          id: quote.id,
          content: quote.content,
          author: quote.author,
          date: quote.date,
        },
        archivePath,
        archiveUrl: `${domainUrl}/${archivePath}`,
        todayUrl: `${domainUrl}/today.html`,
        instructions: [
          "1. Quote data fetched from database",
          "2. Run 'npm run generate-archives' to create local archive HTML files",
          "3. Files saved to public/archives/ and public/today.html",
          "4. Sitemaps generated in public/sitemap.xml",
        ]
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        note: "Edge function checks database. Local files are generated via 'npm run generate-archives'"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
