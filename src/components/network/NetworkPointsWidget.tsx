import { useEffect, useState } from 'react';
import { supabase, getUserIdentifier } from '../../lib/supabase';
import { Star, Award, TrendingUp, Zap } from 'lucide-react';

interface UserPoints {
  total_points: number;
  lifetime_points: number;
  current_level: number;
  properties_visited_today: number;
}

interface PointsUpdate {
  points_earned: number;
  new_total: number;
  level_up: boolean;
  new_badges: number;
}

export function NetworkPointsWidget() {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [recentPoints, setRecentPoints] = useState(0);

  useEffect(() => {
    loadUserPoints();
    recordVisit();
  }, []);

  const loadUserPoints = async () => {
    try {
      const userIdentifier = getUserIdentifier();
      const { data, error } = await supabase
        .from('user_network_points')
        .select('*')
        .eq('user_identifier', userIdentifier)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setUserPoints(data);
      }
    } catch (error) {
      console.error('Error loading points:', error);
    }
  };

  const recordVisit = async () => {
    try {
      const userIdentifier = getUserIdentifier();
      const currentDomain = 'quoteofday.net';

      const { data, error } = await supabase.rpc('award_visit_points', {
        p_user_identifier: userIdentifier,
        p_property_domain: currentDomain,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0] as PointsUpdate;

        if (result.points_earned > 0) {
          setRecentPoints(result.points_earned);
          setShowAnimation(true);
          setTimeout(() => setShowAnimation(false), 3000);

          await loadUserPoints();

          if (result.level_up) {
            showNotification('Level Up!', `You reached level ${Math.floor(result.new_total / 100) + 1}!`);
          }

          if (result.new_badges > 0) {
            showNotification('New Badge!', `You earned ${result.new_badges} new badge(s)!`);
          }
        }
      }
    } catch (error) {
      console.error('Error recording visit:', error);
    }
  };

  const showNotification = (title: string, message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  };

  const getPointsToNextLevel = () => {
    if (!userPoints) return 100;
    const currentLevelPoints = (userPoints.current_level - 1) * 100;
    const nextLevelPoints = userPoints.current_level * 100;
    return nextLevelPoints - userPoints.total_points;
  };

  const getLevelProgress = () => {
    if (!userPoints) return 0;
    const currentLevelPoints = (userPoints.current_level - 1) * 100;
    const nextLevelPoints = userPoints.current_level * 100;
    const progress = ((userPoints.total_points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (!userPoints) return null;

  return (
    <div className="relative">
      {showAnimation && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-bounce z-50">
          <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="font-bold">+{recentPoints} pts</span>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl p-4 border border-sky-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-sky-900 font-bold text-lg">{userPoints.total_points}</p>
              <p className="text-sky-700 text-xs">Network Points</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 bg-sky-600 px-2 py-1 rounded-full">
              <Star className="w-4 h-4 text-white" />
              <span className="text-white font-bold text-sm">Lvl {userPoints.current_level}</span>
            </div>
            <p className="text-sky-700 text-xs mt-1">{getPointsToNextLevel()} to next</p>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs text-sky-700 mb-1">
            <span>Level Progress</span>
            <span>{Math.round(getLevelProgress())}%</span>
          </div>
          <div className="w-full bg-sky-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-sky-600 h-full transition-all duration-500 rounded-full"
              style={{ width: `${getLevelProgress()}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="w-3 h-3" />
            <span>{userPoints.properties_visited_today} sites today</span>
          </div>
          <span className="text-sky-600">{userPoints.lifetime_points} lifetime</span>
        </div>

        {userPoints.properties_visited_today < 6 && (
          <div className="mt-3 pt-3 border-t border-sky-300">
            <p className="text-amber-600 text-xs text-center font-medium">
              Visit {6 - userPoints.properties_visited_today} more site(s) for bonus points!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
