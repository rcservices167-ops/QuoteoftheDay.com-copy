/**
 * Fallback images in case API fails
 */
const FALLBACK_IMAGES = [
  'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=1600',
];

interface SmartMatchImage {
  id: string;
  url: string;
  mood: string;
  keywords: string[];
  source: string;
}

/**
 * Fetch smart-matched images from edge function
 * Returns top 10 matching images for the quote text, then randomly selects one
 */
async function getSmartMatchedImage(
  contentText: string,
  category: string = 'quotes'
): Promise<string> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      throw new Error('Missing Supabase configuration');
    }

    const functionUrl = `${supabaseUrl}/functions/v1/smart-image-match`;

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'X-Client-Info': 'supabase-js/2.0.0',
      },
      body: JSON.stringify({
        contentText,
        category,
      }),
    });

    if (!response.ok) {
      console.warn('Smart match API failed:', response.status);
      return getRandomFallbackImage();
    }

    const data = await response.json();

    if (!data.images || data.images.length === 0) {
      console.warn('No matching images returned');
      return getRandomFallbackImage();
    }

    // Randomly select from top 10 matches for variety
    const randomIndex = Math.floor(Math.random() * data.images.length);
    const selectedImage = data.images[randomIndex] as SmartMatchImage;

    return selectedImage.url;
  } catch (error) {
    console.error('Smart image matching failed:', error);
    return getRandomFallbackImage();
  }
}

/**
 * Get random fallback image (simple backup)
 */
function getRandomFallbackImage(): string {
  return FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
}

async function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function generateQuoteImageWithBackground(
  quoteText: string,
  quoteAuthor?: string,
  category: string = 'quotes'
): Promise<File | null> {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = 1200;
    canvas.height = 630;

    const backgroundUrl = await getSmartMatchedImage(quoteText, category);
    const backgroundImg = await loadImage(backgroundUrl);

    if (backgroundImg) {
      ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#0ea5e9');
      gradient.addColorStop(1, '#0284c7');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const maxWidth = 1000;
    const words = quoteText.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);

    const lineHeight = 60;
    const startY = canvas.height / 2 - (lines.length * lineHeight) / 2;

    ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    lines.forEach((line, index) => {
      const prefix = index === 0 ? '"' : '';
      const suffix = index === lines.length - 1 ? '"' : '';
      ctx.fillText(prefix + line + suffix, canvas.width / 2, startY + index * lineHeight);
    });

    if (quoteAuthor) {
      ctx.font = 'italic 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#f0f9ff';
      ctx.fillText(`— ${quoteAuthor}`, canvas.width / 2, startY + lines.length * lineHeight + 40);
    }

    ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText('QuoteoftheDay.com', canvas.width - 40, canvas.height - 40);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], 'quote-share.png', { type: 'image/png' }));
        } else {
          resolve(null);
        }
      }, 'image/png');
    });
  } catch (error) {
    console.error('Failed to generate quote image:', error);
    return null;
  }
}
