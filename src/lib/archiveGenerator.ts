import { createClient } from '@supabase/supabase-js';

export interface QuoteEntry {
  id: string;
  content: string;
  subcategory?: string;
  date: string;
  slug?: string;
}

export function sanitizeSlug(text: string, maxLength = 100): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, maxLength);
}

export function generateArchivePath(date: string, id: string, slug: string): string {
  const dateObj = new Date(date + 'T00:00:00');
  const year = String(dateObj.getUTCFullYear()).slice(-2);
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  const idShort = id.slice(0, 8);

  return `archives/${year}/${month}/${day}/${idShort}/${slug}.html`;
}

export function generateMetaTags(
  quote: QuoteEntry,
  domainUrl: string,
  archivePath: string
): string {
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
  <meta property="og:site_name" content="QuoteoftheDay.com">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${contentPreview}">
  <meta name="twitter:image" content="${domainUrl}/img/quoteofday_website.jpg">

  <link rel="canonical" href="${fullUrl}">
  `;
}

export function generateArchiveHTML(
  quote: QuoteEntry,
  archivePath: string,
  domainUrl: string
): string {
  const metaTags = generateMetaTags(quote, domainUrl, archivePath);
  const shareUrl = encodeURIComponent(`${domainUrl}/${archivePath}`);
  const shareText = encodeURIComponent('Check out this quote!');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Quote of the Day - ${quote.date}</title>
  ${metaTags}
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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

    .logo-section {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #dbeafe;
    }

    .logo {
      max-width: 200px;
      height: auto;
      margin: 0 auto 15px;
    }

    .site-name {
      font-size: 18px;
      font-weight: bold;
      color: #0c4a6e;
      margin-bottom: 5px;
    }

    .date {
      font-size: 14px;
      color: #0369a1;
    }

    .quote-content {
      margin: 30px 0;
      font-size: 22px;
      font-weight: 500;
      color: #1f2937;
      line-height: 1.8;
      min-height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-style: italic;
    }

    .share-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #dbeafe;
    }

    .share-label {
      font-size: 14px;
      font-weight: bold;
      color: #0c4a6e;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .share-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
    }

    .share-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }

    .share-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(2, 132, 199, 0.4);
    }

    .back-link {
      margin-top: 30px;
      text-align: center;
    }

    .back-link a {
      font-size: 14px;
      color: #0369a1;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .back-link a:hover {
      color: #0c4a6e;
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

    @media (max-width: 600px) {
      .container {
        padding: 24px;
        border-width: 6px;
      }

      .quote-content {
        font-size: 18px;
      }

      .share-buttons {
        gap: 8px;
      }

      .share-button {
        padding: 10px 16px;
        font-size: 12px;
      }

      .logo {
        max-width: 150px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo-section">
      <img src="/img/quoteofday_website.jpg" alt="QuoteoftheDay.com Logo" class="logo">
      <div class="site-name">QuoteoftheDay.com</div>
      <div class="date">${new Date(quote.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })}</div>
    </div>

    <div class="quote-content">
      "${quote.content}"
    </div>

    ${quote.subcategory ? `<div class="category-badge">${quote.subcategory}</div>` : ''}

    <div class="share-section">
      <div class="share-label">Share This Quote</div>
      <div class="share-buttons">
        <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}" target="_blank" class="share-button">
          𝕏
        </a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" class="share-button">
          Facebook
        </a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}" target="_blank" class="share-button">
          LinkedIn
        </a>
        <a href="mailto:?subject=Check%20out%20this%20quote&body=${shareUrl}" class="share-button">
          Email
        </a>
      </div>
    </div>

    <div class="back-link">
      <a href="/">← Back to QuoteoftheDay.com</a>
    </div>
  </div>
</body>
</html>`;
}

export async function getAllQuotes(supabase: any): Promise<QuoteEntry[]> {
  const { data, error } = await supabase
    .from('quotes')
    .select('id, content, author, subcategory, date, slug')
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateQuoteSlug(supabase: any, quoteId: string, slug: string): Promise<void> {
  const { error } = await supabase
    .from('quotes')
    .update({ slug })
    .eq('id', quoteId);

  if (error) throw error;
}
