import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getESTDateString } from '../lib/dateUtils';

interface SearchBarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  availableSubcategories: Array<{ id: string; name: string; icon: string }>;
  selectedSubcategory: string | null;
  onSubcategoryChange: (subcategory: string) => void;
  loading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchMode?: boolean;
  onSearchModeChange?: (mode: boolean) => void;
}

export function SearchBar({
  selectedDate,
  onDateChange,
  availableSubcategories,
  selectedSubcategory,
  onSubcategoryChange,
  loading = false,
  searchQuery = '',
  onSearchChange = () => {},
  searchMode = false,
  onSearchModeChange = () => {}
}: SearchBarProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const today = new Date();
  const isToday = getESTDateString(selectedDate) === getESTDateString(today);

  useEffect(() => {
    fetchAvailableDates();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchQuery.trim().length > 0) {
        onSearchChange(localSearchQuery);
        onSearchModeChange(true);
      } else {
        onSearchChange('');
        onSearchModeChange(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchQuery]);

  async function fetchAvailableDates() {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('date')
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        const uniqueDates = [...new Set(data.map(item => item.date))];
        setAvailableDates(uniqueDates);
      }
    } catch (error) {
      console.error('Error fetching available dates:', error);
    }
  }

  async function handleRandomClick() {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .not('content', 'is', null)
        .neq('content', '');

      if (error) throw error;

      if (data && data.length > 0) {
        const randomEntry = data[Math.floor(Math.random() * data.length)];
        const [year, month, day] = randomEntry.date.split('-').map(Number);
        const randomDate = new Date(year, month - 1, day);

        onDateChange(randomDate);
        onSubcategoryChange(randomEntry.subcategory);
      }
    } catch (error) {
      console.error('Error fetching random quote:', error);
    }
  }

  async function handlePreviousClick() {
    const currentDateStr = getESTDateString(selectedDate);
    const currentIndex = availableDates.indexOf(currentDateStr);

    if (currentIndex < availableDates.length - 1) {
      const previousDateStr = availableDates[currentIndex + 1];
      const [year, month, day] = previousDateStr.split('-').map(Number);
      onDateChange(new Date(year, month - 1, day));
    }
  }

  async function handleNextClick() {
    const currentDateStr = getESTDateString(selectedDate);
    const currentIndex = availableDates.indexOf(currentDateStr);

    if (currentIndex > 0) {
      const nextDateStr = availableDates[currentIndex - 1];
      const [year, month, day] = nextDateStr.split('-').map(Number);
      onDateChange(new Date(year, month - 1, day));
    }
  }

  const hasPrevious = availableDates.indexOf(getESTDateString(selectedDate)) < availableDates.length - 1;
  const hasNext = availableDates.indexOf(getESTDateString(selectedDate)) > 0 && !isToday;

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    onSearchChange('');
    onSearchModeChange(false);
  };

  return (
    <div className="bg-gradient-to-br from-sky-100 to-sky-200 rounded-3xl shadow-2xl border-8 border-sky-600 p-2 md:p-4">

      {/* ROW 1: Labels - Desktop Only */}
      <div className="hidden md:grid md:grid-cols-3 gap-2 mb-2">
        <h3 className="text-sm font-bold text-sky-900 text-left">
          PICK DATE
        </h3>
        <h3 className="text-sm font-bold text-sky-900 text-center">
          QUOTE FOR {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </h3>
        <h3 className="text-sm font-bold text-sky-900 text-right">
          PICK CATEGORY
        </h3>
      </div>

      {/* ROW 2: Controls - Single row on mobile, 3 columns on desktop */}
      <div className="flex md:grid md:grid-cols-[auto_1fr_auto] gap-1 md:gap-3 items-center">

        {/* LEFT SECTION: Date Buttons */}
        <div className="flex gap-0.5 md:gap-1">
            <button
              onClick={handlePreviousClick}
              disabled={!hasPrevious || loading}
              className="px-1 md:px-2 py-1 md:py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded font-bold hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              title="Previous"
            >
              <span className="hidden md:inline">← PREV</span>
              <span className="md:hidden">←</span>
            </button>

            <button
              onClick={handleRandomClick}
              disabled={loading}
              className="px-1 md:px-2 py-1 md:py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded font-bold hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              title="Random"
            >
              🎲
            </button>

            <div className="relative">
              <button
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="px-1 md:px-2 py-1 md:py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded font-bold hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg hover:shadow-xl text-xs"
                title="Calendar"
              >
                <span className="hidden md:inline">DATE 📅</span>
                <span className="md:hidden">📅</span>
              </button>

              {isCalendarOpen && (
                <div className="absolute z-10 mt-2 w-64 bg-white rounded-xl shadow-2xl p-4 max-h-64 overflow-y-auto border-4 border-sky-400 left-0">
                  {availableDates.map(dateStr => {
                    const [year, month, day] = dateStr.split('-').map(Number);
                    const date = new Date(year, month - 1, day);
                    return (
                      <button
                        key={dateStr}
                        onClick={() => {
                          onDateChange(date);
                          setIsCalendarOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-sky-100 rounded-lg transition-colors text-sky-900 font-medium"
                      >
                        {date.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={handleNextClick}
              disabled={!hasNext || loading}
              className="px-1 md:px-2 py-1 md:py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded font-bold hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              title="Next"
            >
              <span className="hidden md:inline">NEXT →</span>
              <span className="md:hidden">→</span>
            </button>
        </div>

        {/* CENTER SECTION: Search Field */}
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex gap-0.5 md:gap-1">
            <input
              type="text"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              placeholder="🔍"
              className="flex-1 px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm rounded border-2 border-sky-500 focus:border-sky-700 focus:outline-none focus:ring-1 focus:ring-sky-300 shadow"
            />
            {searchMode && (
              <button
                onClick={handleClearSearch}
                className="px-1 md:px-2 py-1 md:py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl text-xs"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>
          {searchMode && (
            <p className="hidden md:block text-sky-700 font-medium text-center text-xs">
              🔎 Search active
            </p>
          )}
        </div>

        {/* RIGHT SECTION: Category Buttons */}
        <div className="flex gap-0.5 md:gap-1">
          {availableSubcategories.length > 0 ? (
            availableSubcategories.map((category) => (
              <button
                key={category.id}
                onClick={() => onSubcategoryChange(category.id)}
                className={`px-1 md:px-2 py-1 md:py-2 rounded font-bold transition-all shadow-lg text-xs whitespace-nowrap ${
                  selectedSubcategory === category.id
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-white text-sky-900 hover:bg-sky-50'
                }`}
                title={category.name}
              >
                <span className="hidden md:inline">{category.icon} {category.name.toUpperCase()}</span>
                <span className="md:hidden">{category.icon}</span>
              </button>
            ))
          ) : null}
        </div>

      </div>
    </div>
  );
}
