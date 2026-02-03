import { useState } from 'react';
import { Share2, Twitter, Facebook, Instagram, Linkedin, Copy, Check } from 'lucide-react';
import { supabase, getUserIdentifier } from '../lib/supabase';

interface SocialShareProps {
  quote?: {
    id: string;
    quote_text: string;
    author: string;
    topic: string;
  };
  shareType?: 'quote' | 'leaderboard' | 'badge' | 'challenge' | 'streak';
  customText?: string;
  customUrl?: string;
}

export function SocialShare({ quote, shareType = 'quote', customText, customUrl }: SocialShareProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const getShareText = () => {
    if (customText) return customText;

    if (quote) {
      return `"${quote.quote_text}" - ${quote.author}\n\n#QuoteOfDay #DailyInspiration`;
    }

    return 'Check out Quote of the Day on the Daily Network! #QuoteOfDay';
  };

  const getShareUrl = () => {
    if (customUrl) return customUrl;
    return window.location.href;
  };

  const trackShare = async (platform: string) => {
    try {
      const userIdentifier = getUserIdentifier();
      await supabase.from('social_shares').insert({
        user_identifier: userIdentifier,
        quote_id: quote?.id || null,
        platform,
        share_type: shareType,
      });
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  const shareToTwitter = () => {
    const text = getShareText();
    const url = getShareUrl();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    trackShare('twitter');
    setShowShareMenu(false);
  };

  const shareToFacebook = () => {
    const url = getShareUrl();
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
    trackShare('facebook');
    setShowShareMenu(false);
  };

  const shareToLinkedIn = () => {
    const url = getShareUrl();
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
    trackShare('linkedin');
    setShowShareMenu(false);
  };

  const shareToThreads = () => {
    const text = getShareText();
    const url = getShareUrl();
    const threadsUrl = `https://threads.net/intent/post?text=${encodeURIComponent(text + '\n' + url)}`;
    window.open(threadsUrl, '_blank', 'width=550,height=420');
    trackShare('threads');
    setShowShareMenu(false);
  };

  const copyToClipboard = async () => {
    try {
      const text = `${getShareText()}\n\n${getShareUrl()}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      trackShare('clipboard');
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Quote of the Day',
          text: getShareText(),
          url: getShareUrl(),
        });
        trackShare('native');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      setShowShareMenu(true);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={shareNative}
        className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl font-semibold"
      >
        <Share2 className="w-5 h-5" />
        Share
      </button>

      {showShareMenu && (
        <div className="absolute top-full mt-2 right-0 bg-slate-900 border border-white/20 rounded-xl shadow-2xl p-4 min-w-[280px] z-50">
          <p className="text-white font-semibold mb-3">Share this quote</p>

          <div className="space-y-2">
            <button
              onClick={shareToTwitter}
              className="w-full flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg transition-all"
            >
              <Twitter className="w-5 h-5 text-blue-400" />
              <span>Share on Twitter</span>
            </button>

            <button
              onClick={shareToThreads}
              className="w-full flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg transition-all"
            >
              <Instagram className="w-5 h-5 text-purple-400" />
              <span>Share on Threads</span>
            </button>

            <button
              onClick={shareToFacebook}
              className="w-full flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg transition-all"
            >
              <Facebook className="w-5 h-5 text-blue-500" />
              <span>Share on Facebook</span>
            </button>

            <button
              onClick={shareToLinkedIn}
              className="w-full flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg transition-all"
            >
              <Linkedin className="w-5 h-5 text-blue-600" />
              <span>Share on LinkedIn</span>
            </button>

            <button
              onClick={copyToClipboard}
              className="w-full flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 text-gray-400" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => setShowShareMenu(false)}
            className="w-full mt-3 text-gray-400 hover:text-white text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
