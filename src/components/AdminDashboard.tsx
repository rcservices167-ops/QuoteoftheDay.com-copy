import { useEffect, useState } from 'react';
import { supabase, Visitor, Quote } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  LogOut,
  Users,
  Eye,
  Calendar,
  Globe,
  Monitor,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface VisitorWithQuote extends Visitor {
  quotes?: Quote;
}

interface TopicStats {
  topic: string;
  count: number;
}

interface DashboardStats {
  totalVisitors: number;
  todayVisitors: number;
  uniqueLocations: number;
  topTopics: TopicStats[];
}

export function AdminDashboard() {
  const { signOut, user } = useAuth();
  const [visitors, setVisitors] = useState<VisitorWithQuote[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('visitors')
        .select('*, quotes(*)')
        .order('visited_at', { ascending: false });

      if (filter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('visited_at', today.toISOString());
      } else if (filter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('visited_at', weekAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      setVisitors(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (visitorsData: VisitorWithQuote[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayVisitors = visitorsData.filter(
      (v) => new Date(v.visited_at) >= today
    ).length;

    const locations = new Set(
      visitorsData.filter((v) => v.location).map((v) => v.location)
    );

    const topicCounts: { [key: string]: number } = {};
    visitorsData.forEach((v) => {
      const topic = v.selected_topic || 'all';
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });

    const topTopics = Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({
      totalVisitors: visitorsData.length,
      todayVisitors,
      uniqueLocations: locations.size,
      topTopics,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-300 text-sm">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md rounded-xl p-6 border border-blue-500/30">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-blue-400" />
                  <TrendingUp className="w-5 h-5 text-blue-300" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stats?.totalVisitors || 0}</p>
                <p className="text-blue-200 text-sm">Total Visitors</p>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md rounded-xl p-6 border border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-8 h-8 text-green-400" />
                  <Eye className="w-5 h-5 text-green-300" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stats?.todayVisitors || 0}</p>
                <p className="text-green-200 text-sm">Today's Visitors</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <Globe className="w-8 h-8 text-purple-400" />
                  <BarChart3 className="w-5 h-5 text-purple-300" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stats?.uniqueLocations || 0}</p>
                <p className="text-purple-200 text-sm">Unique Locations</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-md rounded-xl p-6 border border-orange-500/30">
                <div className="flex items-center justify-between mb-2">
                  <Monitor className="w-8 h-8 text-orange-400" />
                  <Eye className="w-5 h-5 text-orange-300" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{visitors.length}</p>
                <p className="text-orange-200 text-sm">Page Views</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Recent Visitors</h2>
                  <div className="flex gap-2">
                    {(['all', 'today', 'week'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                          filter === f
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left text-gray-300 font-medium pb-3 px-2">Date & Time</th>
                        <th className="text-left text-gray-300 font-medium pb-3 px-2">Location</th>
                        <th className="text-left text-gray-300 font-medium pb-3 px-2">Topic</th>
                        <th className="text-left text-gray-300 font-medium pb-3 px-2">Quote</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visitors.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center text-gray-400 py-8">
                            No visitors yet
                          </td>
                        </tr>
                      ) : (
                        visitors.map((visitor) => (
                          <tr key={visitor.id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="py-3 px-2 text-white text-sm">
                              {formatDate(visitor.visited_at)}
                            </td>
                            <td className="py-3 px-2 text-gray-300 text-sm">
                              {visitor.location || 'Unknown'}
                            </td>
                            <td className="py-3 px-2">
                              <span className="inline-block bg-blue-500/30 text-blue-200 px-2 py-1 rounded text-xs">
                                {visitor.selected_topic}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-gray-300 text-sm truncate max-w-xs">
                              {visitor.quotes?.quote_text || 'N/A'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-6">Popular Topics</h2>
                <div className="space-y-4">
                  {stats?.topTopics.map((topic, index) => {
                    const maxCount = stats.topTopics[0]?.count || 1;
                    const percentage = (topic.count / maxCount) * 100;

                    return (
                      <div key={topic.topic}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium capitalize">{topic.topic}</span>
                          <span className="text-gray-300 text-sm">{topic.count} views</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {(!stats?.topTopics || stats.topTopics.length === 0) && (
                    <p className="text-gray-400 text-center py-4">No data available</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
