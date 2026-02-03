import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getESTDateString } from '../lib/dateUtils';
import { SocialShare } from './SocialShare';
import { QuoteShareButton } from './QuoteShareButton';
import { QuoteShareModal } from './QuoteShareModal';

interface DisplayScreenProps {
  selectedDate: Date;
  selectedSubcategory: string | null;
  subcategoryName: string;
  searchQuery?: string;
  searchMode?: boolean;
}

interface DailyQuote {
  id: string;
  content: string;
  author: string;
  subcategory: string;
  date: string;
  source_url?: string;
}

export function DisplayScreen({ selectedDate, selectedSubcategory, subcategoryName, searchQuery = '', searchMode = false }: DisplayScreenProps) {
  const [quote, setQuote] = useState<DailyQuote | null>(null);
  const [searchResults, setSearchResults] = useState<DailyQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    if (searchMode && searchQuery) {
      performSearch();
    } else if (selectedSubcategory) {
      fetchQuote();
    }
  }, [selectedDate, selectedSubcategory, searchQuery, searchMode]);

  useEffect(() => {
    // Add schema markup for the current quote
    if (quote && !searchMode) {
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
        "url": window.location.href,
        "publisher": {
          "@type": "Organization",
          "name": "QuoteoftheDay.com",
          "url": "https://quoteoftheday.com"
        }
      };

      const existingScript = document.getElementById('quote-schema');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'quote-schema';
      script.textContent = JSON.stringify(schemaData);
      document.head.appendChild(script);

      return () => {
        const scriptToRemove = document.getElementById('quote-schema');
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    }
  }, [quote, searchMode]);

  async function performSearch() {
    setLoading(true);
    try {
      console.log(`🔍 Searching quotes for: "${searchQuery}"`);

      const searchTerm = searchQuery.toLowerCase().trim();

      const { data: quotes, error } = await supabase
        .from('quotes')
        .select('*')
        .or(`content.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,subcategory.ilike.%${searchTerm}%`)
        .order('date', { ascending: false })
        .limit(50);

      if (error) throw error;

      setSearchResults(quotes || []);
      setQuote(null);
    } catch (error) {
      console.error('Error searching quotes:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchQuote() {
    setLoading(true);
    setSearchResults([]);
    try {
      const dateStr = getESTDateString(selectedDate);
      console.log(`💭 Fetching quote for ${selectedSubcategory} on ${dateStr}`);

      const cacheKey = `quote_${selectedSubcategory}_${dateStr}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setQuote(JSON.parse(cached));
        setLoading(false);
        return;
      }

      const { data: quotes, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('subcategory', selectedSubcategory.toLowerCase())
        .eq('date', dateStr);

      if (error) throw error;

      const data = quotes && quotes.length > 0
        ? quotes[Math.floor(Math.random() * quotes.length)]
        : null;

      if (data) {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        setQuote(data);
      } else {
        setQuote(null);
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (date: Date, short: boolean = false) => {
    return date.toLocaleDateString('en-US', {
      weekday: short ? 'short' : 'long',
      month: short ? 'short' : 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/New_York'
    });
  };

  return (
    <div className="bg-gradient-to-br from-sky-100 to-sky-200 rounded-3xl shadow-2xl border-8 border-sky-600 p-8">
      {/* TOP ROW: Header */}
      <div className="text-center mb-8 pb-6 border-b-4 border-sky-400">
        {searchMode ? (
          <h2 className="text-3xl font-bold text-sky-900 mb-2">
            Search Results for "{searchQuery}"
          </h2>
        ) : (
          <>
            {/* Mobile: Shorthand date */}
            <h1 className="md:hidden text-2xl font-bold text-sky-900 mb-2">
              {subcategoryName} Quote from {formatDate(selectedDate, true)}
            </h1>
            {/* Desktop: Full date */}
            <h1 className="hidden md:block text-3xl font-bold text-sky-900 mb-2">
              Here is your {subcategoryName} Quote from {formatDate(selectedDate)}
            </h1>
          </>
        )}
      </div>

      {/* BOTTOM ROW: Display Content */}
      <div className="min-h-[300px] flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-8 border-sky-600 border-t-transparent"></div>
            <p className="text-sky-700 font-medium text-lg">{searchMode ? 'Searching...' : 'Loading quote...'}</p>
          </div>
        ) : searchMode && searchResults.length > 0 ? (
          <div className="w-full space-y-4 max-h-[600px] overflow-y-auto">
            <p className="text-center text-sky-700 font-bold mb-4">
              Found {searchResults.length} matching quote{searchResults.length !== 1 ? 's' : ''}
            </p>
            {searchResults.map((result) => (
              <div key={result.id} className="bg-white rounded-2xl p-6 border-4 border-sky-300 shadow-lg hover:shadow-xl transition-shadow">
                <blockquote className="text-lg leading-relaxed text-sky-900 mb-4 italic">
                  "{result.content}"
                </blockquote>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm">
                  <p className="text-sky-700 font-bold">— {result.author}</p>
                  <div className="flex gap-2 text-sky-600">
                    <span className="bg-sky-100 px-3 py-1 rounded-full">{result.subcategory}</span>
                    <span className="bg-sky-100 px-3 py-1 rounded-full">
                      {new Date(result.date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searchMode && searchResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-2xl font-bold text-sky-900 mb-2">No results found</p>
            <p className="text-lg text-sky-700">
              No quotes found matching "{searchQuery}"
            </p>
            <p className="text-sky-600 mt-4">Try different keywords or clear the search</p>
          </div>
        ) : quote ? (
          <div className="w-full space-y-6">
            <div className="bg-white rounded-2xl p-8 border-4 border-sky-300 shadow-xl">
              <div className="text-center mb-4">
                <div className="text-6xl mb-4">💭</div>
              </div>
              <blockquote className="text-2xl leading-relaxed text-sky-900 mb-6 italic text-center">
                "{quote.content}"
              </blockquote>
              <p className="text-sky-700 font-bold text-xl text-center">— {quote.author}</p>
            </div>

            <QuoteShareButton
              quoteText={quote.content}
              quoteAuthor={quote.author}
              onClick={() => setShareModalOpen(true)}
            />

            <QuoteShareModal
              isOpen={shareModalOpen}
              onClose={() => setShareModalOpen(false)}
              quoteText={quote.content}
              quoteAuthor={quote.author}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-2xl font-bold text-sky-900 mb-2">No quote available</p>
            {/* Mobile: Shorthand date */}
            <p className="md:hidden text-lg text-sky-700">
              No {subcategoryName} quote for {formatDate(selectedDate, true)}
            </p>
            {/* Desktop: Full date */}
            <p className="hidden md:block text-lg text-sky-700">
              No {subcategoryName} quote found for {formatDate(selectedDate)}
            </p>
            <p className="text-sky-600 mt-4">Try selecting a different date or category</p>
          </div>
        )}
      </div>
    </div>
  );
}
