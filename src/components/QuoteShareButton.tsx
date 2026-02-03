import { Share2 } from 'lucide-react';

interface QuoteShareButtonProps {
  quoteText: string;
  quoteAuthor?: string;
  onClick: () => void;
}

export function QuoteShareButton({ quoteText, quoteAuthor, onClick }: QuoteShareButtonProps) {
  return (
    <div className="flex justify-center mt-8">
      <button
        onClick={onClick}
        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <Share2 size={24} />
        <span className="text-lg">Share This Quote</span>
      </button>
    </div>
  );
}
