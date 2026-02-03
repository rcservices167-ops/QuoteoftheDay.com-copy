import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  text?: string;
}

export function ShareModal({ isOpen, onClose, title, url, text = 'Check this out!' }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(text + ' ' + url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    { name: '𝕏 (Twitter)', url: shareUrls.twitter, icon: '𝕏' },
    { name: 'Facebook', url: shareUrls.facebook, icon: 'f' },
    { name: 'LinkedIn', url: shareUrls.linkedin, icon: 'in' },
    { name: 'Email', url: shareUrls.email, icon: '✉️' },
    { name: 'Threads', url: shareUrls.threads, icon: '@' },
    { name: 'WhatsApp', url: shareUrls.whatsapp, icon: '💬' },
    { name: 'Telegram', url: shareUrls.telegram, icon: '✈️' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border-4 border-yellow-500">
          <div className="flex justify-between items-center p-6 border-b-2 border-yellow-200">
            <h2 className="text-2xl font-bold text-yellow-900">Share</h2>
            <button
              onClick={onClose}
              className="text-yellow-700 hover:text-yellow-900 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((option) => (
                <a
                  key={option.name}
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-xl font-bold hover:from-yellow-500 hover:to-yellow-600 transition-all hover:shadow-lg"
                >
                  {option.name}
                </a>
              ))}
            </div>

            <div className="pt-4 border-t-2 border-yellow-200">
              <p className="text-sm text-yellow-700 font-semibold mb-3">Copy Link</p>
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 p-3 bg-yellow-100 text-yellow-900 rounded-xl font-bold hover:bg-yellow-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={20} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={20} />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
