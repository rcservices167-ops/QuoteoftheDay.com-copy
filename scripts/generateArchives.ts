import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
  generateArchivePath,
  generateArchiveHTML,
  sanitizeSlug,
  getAllQuotes,
  updateQuoteSlug,
} from '../src/lib/archiveGenerator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const archivesBaseDir = path.join(publicDir, 'archives');

async function generateArchives() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase credentials not configured. Skipping archive generation.');
    console.warn('   Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const domainUrl = 'https://quoteoftheday.com';

  console.log('📚 Fetching all quotes from database...');

  try {
    const quotes = await getAllQuotes(supabase);

    if (quotes.length === 0) {
      console.warn('⚠️  No quotes found in database.');
      return;
    }

    console.log(`✅ Found ${quotes.length} quotes. Generating archive pages...`);

    const sitemapUrls: string[] = [];
    let successCount = 0;

    for (const quote of quotes) {
      const slug = sanitizeSlug(quote.content);
      const archivePath = generateArchivePath(quote.date, quote.id, slug);
      const fullPath = path.join(publicDir, archivePath);
      const dirPath = path.dirname(fullPath);

      fs.mkdirSync(dirPath, { recursive: true });

      const html = generateArchiveHTML(quote, archivePath, domainUrl);
      fs.writeFileSync(fullPath, html, 'utf-8');

      await updateQuoteSlug(supabase, quote.id, archivePath);

      sitemapUrls.push(`${domainUrl}/${archivePath}`);
      successCount++;

      process.stdout.write(`\r✓ Generated ${successCount}/${quotes.length} archives`);
    }

    console.log(`\n✅ Archive generation complete! Generated ${successCount} pages.`);

    // Generate today.html with today's quote
    const todayDate = new Date().toISOString().split('T')[0];
    const todayQuote = quotes.find(q => q.date === todayDate);

    if (todayQuote) {
      const todaySlug = sanitizeSlug(todayQuote.content);
      const todayArchivePath = generateArchivePath(todayQuote.date, todayQuote.id, todaySlug);
      const todayHTML = generateArchiveHTML(todayQuote, todayArchivePath, domainUrl);
      const todayPath = path.join(publicDir, 'today.html');
      fs.writeFileSync(todayPath, todayHTML, 'utf-8');
      console.log(`📄 Today.html generated for: ${todayDate}`);
    } else {
      console.log(`ℹ️  No quote found for today (${todayDate}). Skipping today.html.`);
    }

    // Delete all old sitemap files (sitemap-*.xml and sitemap.xml)
    const existingSitemaps = fs.readdirSync(publicDir).filter(file => file.startsWith('sitemap') && file.endsWith('.xml'));
    existingSitemaps.forEach(file => {
      fs.unlinkSync(path.join(publicDir, file));
      console.log(`🗑️  Deleted old sitemap: ${file}`);
    });

    // Generate sitemap with today's date containing ALL archives + today.html
    const today = new Date();
    const month = today.getMonth() + 1; // No padding - single digit for months 1-9
    const day = String(today.getDate()).padStart(2, '0');
    const year = String(today.getFullYear()).slice(-2);
    const todaySitemapFilename = `sitemap-${month}-${day}-${year}.xml`;
    const todaySitemapPath = path.join(publicDir, todaySitemapFilename);

    const sitemapContent = generateSitemap(sitemapUrls, domainUrl, todayQuote ? `${domainUrl}/today.html` : null);

    // Write dated sitemap: sitemap-M-DD-YY.xml
    fs.writeFileSync(todaySitemapPath, sitemapContent, 'utf-8');
    console.log(`📍 Dated sitemap generated: ${todaySitemapFilename}`);

    // Write generic sitemap: sitemap.xml
    const genericSitemapPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(genericSitemapPath, sitemapContent, 'utf-8');
    console.log(`📍 Generic sitemap generated: sitemap.xml`);

    console.log(`📊 Total URLs in sitemap: ${sitemapUrls.length + (todayQuote ? 2 : 1)} (homepage${todayQuote ? ' + today.html' : ''} + ${sitemapUrls.length} archives)`);
  } catch (error) {
    console.error('❌ Error generating archives:', error);
    process.exit(1);
  }
}

function generateSitemap(urls: string[], domainUrl: string, todayUrl?: string | null): string {
  const todayEntry = todayUrl ? `
  <url>
    <loc>${todayUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>` : '';

  const urlEntries = urls
    .map(
      (url) => `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domainUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${todayEntry}${urlEntries}
</urlset>`;
}

generateArchives();
