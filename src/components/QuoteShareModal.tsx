import { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, Download } from 'lucide-react';
import { generateQuoteImageWithBackground } from '../services/canvasImageGenerator';

interface QuoteShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteText: string;
  quoteAuthor?: string;
}

async function fetchImageAsFile(): Promise<File | null> {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const imagePath = '/img/quoteofday_full.png';
    const imageUrl = `${origin}${imagePath}`;

    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new File([blob], 'quoteofday_full.png', { type: 'image/png' });
  } catch (error) {
    console.error('Failed to fetch image:', error);
    return null;
  }
}

export function QuoteShareModal({ isOpen, onClose, quoteText, quoteAuthor }: QuoteShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedImageFile, setGeneratedImageFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsGenerating(true);
      generateQuoteImageWithBackground(quoteText, quoteAuthor).then((file) => {
        if (file) {
          const url = URL.createObjectURL(file);
          setGeneratedImageUrl(url);
          setGeneratedImageFile(file);
        }
        setIsGenerating(false);
      });
    }

    return () => {
      if (generatedImageUrl) {
        URL.revokeObjectURL(generatedImageUrl);
      }
    };
  }, [isOpen, quoteText, quoteAuthor, generatedImageUrl]);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const imageUrl = `${origin}/img/quoteofday_full.png`;

  // v3.28 format: No archive URL, two-tier structure
  const shareText = `***"${quoteText}"***\n\nBrought to you by https://QuoteofDay.com, an AllofDay.com Network Member`;

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(shareText);
  const encodedTitle = encodeURIComponent('Check out this quote from QuoteofDay.com');
  const encodedImageUrl = encodeURIComponent(imageUrl);

  const handleDownloadImage = () => {
    if (generatedImageUrl && generatedImageFile) {
      const a = document.createElement('a');
      a.href = generatedImageUrl;
      a.download = 'quote-of-the-day.png';
      a.click();
    }
  };

  const shareOptions = [
    {
      name: 'Messages',
      action: async () => {
        if (navigator.share) {
          try {
            const imageFile = generatedImageFile || await fetchImageAsFile();
            const shareData: ShareData = {
              title: 'Check out this quote from QuoteofDay.com',
              text: shareText,
              url: 'https://www.quoteofday.com',
            };

            if (imageFile && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
              shareData.files = [imageFile];
            }

            await navigator.share(shareData);
            onClose();
          } catch (err) {
            console.log('Share cancelled');
          }
        } else {
          window.open(`sms:?body=${encodedText}`, 'messages-share');
        }
      },
      icon: '💬',
      color: 'from-green-400 to-green-500 hover:from-green-500 hover:to-green-600'
    },
    {
      name: 'More',
      action: async () => {
        if (navigator.share) {
          try {
            const imageFile = generatedImageFile || await fetchImageAsFile();
            const shareData: ShareData = {
              title: 'Check out this quote from QuoteofDay.com',
              text: shareText,
              url: currentUrl,
            };

            if (imageFile && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
              shareData.files = [imageFile];
            }

            await navigator.share(shareData);
            onClose();
          } catch (err) {
            console.log('Share cancelled');
          }
        }
      },
      icon: '⬆️',
      color: 'from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600'
    },
    {
      name: 'Copy',
      action: async () => {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      icon: copied ? '✓' : '📋',
      color: 'from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600'
    },
    {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      icon: '𝕏',
      color: 'from-black to-gray-800 hover:from-gray-900 hover:to-black'
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      icon: 'f',
      color: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedText}`,
      icon: 'in',
      color: 'from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900'
    },
    {
      name: 'Email',
      url: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
      icon: '✉️',
      color: 'from-red-400 to-red-500 hover:from-red-500 hover:to-red-600'
    }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b-2 border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
            <h2 className="text-2xl font-bold text-gray-900">Share this Quote</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={28} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Image Preview */}
            <div className="mb-8 flex justify-center">
              <div className="relative group">
                <a
                  href="https://quoteofday.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg overflow-hidden border-4 border-transparent hover:border-cyan-500 transition-all duration-300"
                >
                  {generatedImageUrl ? (
                    <img
                      src={generatedImageUrl}
                      alt="Quote Share Image"
                      className="w-80 h-auto object-cover rounded-lg shadow-xl hover:shadow-2xl transition-shadow"
                    />
                  ) : (
                    <div className="w-80 h-48 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg shadow-lg flex items-center justify-center">
                      <p className="text-white font-semibold">Generating image...</p>
                    </div>
                  )}
                </a>

                {generatedImageUrl && (
                  <button
                    onClick={handleDownloadImage}
                    className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100 duration-300"
                    title="Download image"
                  >
                    <Download size={20} className="text-cyan-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Quote Preview */}
            <div className="mb-8 text-center p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
              <p className="text-xl italic text-gray-800 mb-3">"{quoteText}"</p>
              {quoteAuthor && (
                <p className="text-sm text-gray-600">— {quoteAuthor}</p>
              )}
            </div>

            {/* Share Options Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {shareOptions.map((option) => (
                <div key={option.name}>
                  {option.url ? (
                    <a
                      href={option.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-r ${option.color} text-white rounded-lg font-semibold transition-all hover:shadow-lg h-full`}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <span className="text-xs text-center">{option.name}</span>
                    </a>
                  ) : (
                    <button
                      onClick={option.action}
                      className={`flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-r ${option.color} text-white rounded-lg font-semibold transition-all hover:shadow-lg w-full h-full`}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <span className="text-xs text-center">{option.name}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Share Text Info */}
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-blue-900">Share Text:</span>
                <br />
                <code className="text-xs text-gray-600 block mt-2 whitespace-pre-wrap break-words">
                  {shareText}
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
