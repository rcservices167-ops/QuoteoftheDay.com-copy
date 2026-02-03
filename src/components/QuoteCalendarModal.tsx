import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getESTDateString } from '../lib/dateUtils';

interface QuoteCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function QuoteCalendarModal({
  isOpen,
  onClose,
  selectedDate,
  onDateSelect,
}: QuoteCalendarModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) fetchAvailableDates();
  }, [isOpen]);

  async function fetchAvailableDates() {
    const { data } = await supabase.from('quotes').select('date');
    if (data) {
      const dateSet = new Set(data.map(item => item.date));
      setAvailableDates(dateSet);
    }
  }

  if (!isOpen) return null;

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDateSelect(newDate);
    onClose();
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const days = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="fixed inset-0 bg-sky-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-sky-50 rounded-3xl shadow-2xl p-6 max-w-sm w-full border-8 border-sky-600">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 hover:bg-sky-200 rounded-full text-sky-700 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-lg font-black text-sky-900 uppercase tracking-tight">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 hover:bg-sky-200 rounded-full text-sky-700 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-black text-sky-400 mb-2 uppercase">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (!day) return <div key={i} />;
            
            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isWhitelisted = availableDates.has(dateStr);
            const isSelected = getESTDateString(selectedDate) === dateStr;

            return (
              <button
                key={i}
                disabled={!isWhitelisted}
                onClick={() => handleDateClick(day)}
                className={`aspect-square rounded-lg text-sm font-bold transition-all flex flex-col items-center justify-center border
                  ${isSelected 
                    ? 'bg-gradient-to-br from-sky-500 to-sky-700 text-white border-sky-800 shadow-inner scale-95' 
                    : isWhitelisted 
                      ? 'bg-white text-sky-700 hover:border-sky-400 hover:bg-sky-100 border-sky-100 shadow-sm' 
                      : 'bg-slate-50 text-slate-300 cursor-not-allowed opacity-40 border-transparent'}`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <button 
          onClick={onClose} 
          className="mt-6 w-full py-3 bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-xl font-bold hover:from-sky-700 hover:to-sky-800 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <X size={18}/> CLOSE
        </button>
      </div>
    </div>
  );
}
