import { useEffect, useState } from 'react';
import { supabase, getUserIdentifier } from '../../lib/supabase';
import { Award, Lock, Star, Sparkles } from 'lucide-react';

interface Badge {
  id: string;
  badge_name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  points_reward: number;
  is_earned?: boolean;
}

export function BadgesPanel() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const userIdentifier = getUserIdentifier();

      const { data: allBadges, error: badgesError } = await supabase
        .from('network_badges')
        .select('*')
        .eq('is_active', true)
        .order('requirement_value');

      if (badgesError) throw badgesError;

      const { data: earnedBadges, error: earnedError } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_identifier', userIdentifier);

      if (earnedError) throw earnedError;

      const earnedIds = new Set(earnedBadges?.map((b) => b.badge_id) || []);

      const badgesWithStatus = (allBadges || []).map((badge) => ({
        ...badge,
        is_earned: earnedIds.has(badge.id),
      }));

      setBadges(badgesWithStatus);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const earnedCount = badges.filter((b) => b.is_earned).length;

  return (
    <>
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-32 right-6 bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 z-50"
      >
        <Award className="w-6 h-6" />
        {earnedCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {earnedCount}
          </span>
        )}
      </button>

      {showPanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-sky-200">
            <div className="bg-gradient-to-r from-sky-100 to-sky-200 border-b border-sky-300 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-sky-900 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                    Your Badges
                  </h2>
                  <p className="text-sky-700 text-sm mt-1">
                    {earnedCount} of {badges.length} earned
                  </p>
                </div>
                <button
                  onClick={() => setShowPanel(false)}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition-all"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`rounded-xl p-4 border transition-all ${
                      badge.is_earned
                        ? 'bg-gradient-to-br from-sky-100 to-sky-200 border-sky-400'
                        : 'bg-sky-50 border-sky-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`p-3 rounded-full ${
                          badge.is_earned ? 'bg-sky-500' : 'bg-sky-200'
                        }`}
                      >
                        {badge.is_earned ? (
                          <Star className="w-6 h-6 text-white" />
                        ) : (
                          <Lock className="w-6 h-6 text-sky-600" />
                        )}
                      </div>
                      {badge.is_earned && (
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          Earned
                        </div>
                      )}
                    </div>

                    <h3 className="text-sky-900 font-bold mb-1">{badge.badge_name}</h3>
                    <p className="text-sky-700 text-sm mb-3">{badge.description}</p>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-sky-600">
                        {badge.requirement_type === 'visits' && `${badge.requirement_value} visits`}
                        {badge.requirement_type === 'properties' && `${badge.requirement_value} sites`}
                        {badge.requirement_type === 'points' && `${badge.requirement_value} points`}
                        {badge.requirement_type === 'streak' && `${badge.requirement_value} day streak`}
                      </span>
                      {badge.points_reward > 0 && (
                        <span className="text-amber-600 font-bold">+{badge.points_reward} pts</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
