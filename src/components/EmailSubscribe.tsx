import { useState } from 'react';
import { Mail, Check, AlertCircle } from 'lucide-react';
import { supabase, getUserIdentifier } from '../lib/supabase';

export function EmailSubscribe() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userIdentifier = getUserIdentifier();
      const verificationToken = Math.random().toString(36).substring(2, 15);

      const { error: insertError } = await supabase
        .from('email_subscriptions')
        .insert({
          user_identifier: userIdentifier,
          email: email,
          is_active: true,
          notification_time: '09:00:00',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          verification_token: verificationToken,
        });

      if (insertError) {
        if (insertError.code === '23505') {
          setError('This email is already subscribed!');
        } else {
          throw insertError;
        }
      } else {
        setSuccess(true);
        setEmail('');
        setTimeout(() => {
          setShowForm(false);
          setSuccess(false);
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl p-6 border border-sky-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-sky-500 p-2 rounded-lg">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-sky-900 font-bold text-lg">Daily Email Reminders</h3>
          <p className="text-sky-700 text-sm">Never miss your daily inspiration</p>
        </div>
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl"
        >
          Subscribe to Daily Emails
        </button>
      ) : (
        <form onSubmit={handleSubscribe} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full bg-white border border-sky-300 rounded-lg py-3 px-4 text-sky-900 placeholder-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-300 text-sm bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-300 text-sm bg-green-500/20 border border-green-500/30 rounded-lg p-3">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>Successfully subscribed! Check your email.</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition-all disabled:cursor-not-allowed"
            >
              {loading ? 'Subscribing...' : success ? 'Subscribed!' : 'Subscribe'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError('');
              }}
              className="bg-white hover:bg-sky-50 text-sky-900 border border-sky-300 py-2 px-4 rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>

          <p className="text-sky-600 text-xs">
            By subscribing, you agree to receive daily emails. Unsubscribe anytime.
          </p>
        </form>
      )}
    </div>
  );
}
