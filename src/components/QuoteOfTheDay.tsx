import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getESTDateString } from '../lib/dateUtils';
import { SearchBar } from './SearchBar';
import { DisplayScreen } from './DisplayScreen';

interface QuoteSubcategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const ALL_QUOTE_SUBCATEGORIES: Record<string, QuoteSubcategory> = {
  'inspirational': { id: 'inspirational', name: 'Inspirational', icon: '✨', description: 'Uplifting and inspiring' },
  'motivational': { id: 'motivational', name: 'Motivational', icon: '💪', description: 'Inspiration and encouragement' },
  'life': { id: 'life', name: 'Life', icon: '🌱', description: 'Life wisdom and advice' },
  'general': { id: 'general', name: 'General', icon: '💬', description: 'Various quotes' },
  'wisdom': { id: 'wisdom', name: 'Wisdom', icon: '🦉', description: 'Words of wisdom' },
  'love': { id: 'love', name: 'Love', icon: '❤️', description: 'Love and relationships' },
};

export function QuoteOfTheDay() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSubcategories, setAvailableSubcategories] = useState<QuoteSubcategory[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);

  useEffect(() => {
    fetchAvailableSubcategories();
  }, [selectedDate]);

  async function fetchAvailableSubcategories() {
    setLoading(true);
    try {
      const dateStr = getESTDateString(selectedDate);
      console.log(`💭 Fetching available subcategories for ${dateStr}`);

      const { data, error } = await supabase
        .from('quotes')
        .select('subcategory')
        .eq('date', dateStr);

      if (error) throw error;

      if (data && data.length > 0) {
        const uniqueSubcategories = [...new Set(data.map(item => item.subcategory))];
        const subcategoryObjects = uniqueSubcategories
          .map(subcat => ALL_QUOTE_SUBCATEGORIES[subcat.toLowerCase()])
          .filter(Boolean);

        const seenIds = new Set<string>();
        const deduplicatedSubcategories = subcategoryObjects.filter(subcat => {
          if (seenIds.has(subcat.id)) return false;
          seenIds.add(subcat.id);
          return true;
        });

        setAvailableSubcategories(deduplicatedSubcategories);

        if (deduplicatedSubcategories.length > 0 && !selectedSubcategory) {
          setSelectedSubcategory(deduplicatedSubcategories[0].id);
        }
      } else {
        setAvailableSubcategories([]);
        setSelectedSubcategory(null);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setAvailableSubcategories([]);
    } finally {
      setLoading(false);
    }
  }

  const subcategoryName = availableSubcategories.find(s => s.id === selectedSubcategory)?.name || 'Quote';

  return (
    <div className="bg-gradient-to-br from-sky-50 via-white to-sky-100 px-2 md:px-4 py-1 md:py-2">
      <div className="container mx-auto max-w-7xl space-y-1 md:space-y-2">
        {/* COMPONENT 1: SEARCH BAR */}
        <SearchBar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          availableSubcategories={availableSubcategories}
          selectedSubcategory={selectedSubcategory}
          onSubcategoryChange={setSelectedSubcategory}
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchMode={searchMode}
          onSearchModeChange={setSearchMode}
        />

        {/* COMPONENT 2: DISPLAY SCREEN */}
        <DisplayScreen
          selectedDate={selectedDate}
          selectedSubcategory={selectedSubcategory}
          subcategoryName={subcategoryName}
          searchQuery={searchQuery}
          searchMode={searchMode}
        />
      </div>
    </div>
  );
}
