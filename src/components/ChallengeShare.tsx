import { useState } from 'react';
import { Users, Copy, Check, ExternalLink } from 'lucide-react';
import { supabase, getUserIdentifier } from '../lib/supabase';

interface ChallengeShareProps {
  quoteId: string;
  challengeType: 'quote_reaction' | 'streak' | 'badges' | 'points';
  challengeData: any;
  buttonText?: string;
}

export function ChallengeShare({ quoteId, challengeType, challengeData, buttonText = 'Challenge a Friend' }: ChallengeShareProps) {
  const [showModal, setShowModal] = useState(false);
  const [challengeUrl, setChallengeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const createChallenge = async () => {
    setLoading(true);
    try {
      const userIdentifier = getUserIdentifier();
      const challengeCode = await generateChallengeCode();

      const { error } = await supabase.from('user_challenges').insert({
        challenge_code: challengeCode,
        user_identifier: userIdentifier,
        quote_id: quoteId,
        challenge_type: challengeType,
        challenge_data: challengeData,
      });

      if (error) throw error;

      const url = `${window.location.origin}?challenge=${challengeCode}`;
      setChallengeUrl(url);
      setShowModal(true);
    } catch (error) {
      console.error('Error creating challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChallengeCode = async () => {
    const { data, error } = await supabase.rpc('generate_challenge_code');
    if (error) throw error;
    return data as string;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(challengeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const shareChallenge = async (platform: string) => {
    const text = getChallengeText();
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(challengeUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(challengeUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + challengeUrl)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=550,height=420');
    }
  };

  const getChallengeText = () => {
    switch (challengeType) {
      case 'quote_reaction':
        return `I just reacted to an amazing quote! Can you beat my reaction time? 🎯`;
      case 'streak':
        return `I'm on a ${challengeData.streak}-day streak! Think you can match it? 🔥`;
      case 'badges':
        return `I just earned a new badge! Can you unlock it too? 🏆`;
      case 'points':
        return `I scored ${challengeData.points} points! Beat my score! ⭐`;
      default:
        return `Join me on Quote of the Day! 💬`;
    }
  };

  return (
    <>
      <button
        onClick={createChallenge}
        disabled={loading}
        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl font-semibold"
      >
        <Users className="w-5 h-5" />
        {loading ? 'Creating...' : buttonText}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-500/30 p-3 rounded-full">
                <Users className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Challenge Created!</h3>
                <p className="text-gray-400 text-sm">Share with your friends</p>
              </div>
            </div>

            <p className="text-white mb-4">{getChallengeText()}</p>

            <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-4">
              <p className="text-gray-400 text-xs mb-2">Challenge Link:</p>
              <p className="text-white text-sm break-all">{challengeUrl}</p>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => shareChallenge('twitter')}
                className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 py-2 px-4 rounded-lg transition-all text-sm"
              >
                Twitter
              </button>
              <button
                onClick={() => shareChallenge('facebook')}
                className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 text-blue-400 py-2 px-4 rounded-lg transition-all text-sm"
              >
                Facebook
              </button>
              <button
                onClick={() => shareChallenge('whatsapp')}
                className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 py-2 px-4 rounded-lg transition-all text-sm"
              >
                WhatsApp
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
