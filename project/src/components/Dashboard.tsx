import { useEffect, useState } from 'react';
import { supabase, Player, Match } from '../lib/supabase';
import { TrendingUp, Target, Flame, Award } from 'lucide-react';

interface DashboardProps {
  onPlayerClick: (playerId: string) => void;
}

export default function Dashboard({ onPlayerClick }: DashboardProps) {
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalMatches: 0,
    avgGoals: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [playersRes, matchesRes] = await Promise.all([
        supabase
          .from('players')
          .select('*')
          .order('elo_rating', { ascending: false })
          .limit(5),
        supabase
          .from('matches')
          .select('*')
          .order('played_at', { ascending: false })
          .limit(10),
      ]);

      if (playersRes.data) setTopPlayers(playersRes.data);
      if (matchesRes.data) {
        setRecentMatches(matchesRes.data);
        const totalGoals = matchesRes.data.reduce((sum, m) => sum + m.score1 + m.score2, 0);
        setStats({
          totalPlayers: playersRes.data?.length || 0,
          totalMatches: matchesRes.data.length,
          avgGoals: matchesRes.data.length ? (totalGoals / matchesRes.data.length).toFixed(1) as any : 0,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Players"
          value={stats.totalPlayers}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Matches Played"
          value={stats.totalMatches}
          icon={Target}
          color="blue"
        />
        <StatCard
          title="Avg Goals/Match"
          value={stats.avgGoals}
          icon={Flame}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">Top Players</h2>
          </div>
          <div className="space-y-3">
            {topPlayers.map((player, index) => (
              <div
                key={player.id}
                onClick={() => onPlayerClick(player.id)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{player.name}</div>
                    <div className="text-sm text-gray-500">
                      {player.matches_won}W - {player.matches_lost}L
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-emerald-600">{player.elo_rating}</div>
                  <div className="text-xs text-gray-500">ELO</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Matches</h2>
          <div className="space-y-3">
            {recentMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  const [players, setPlayers] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPlayerNames();
  }, [match]);

  async function loadPlayerNames() {
    if (match.match_type === 'singles' && match.player1_id && match.player2_id) {
      const { data } = await supabase
        .from('players')
        .select('id, name')
        .in('id', [match.player1_id, match.player2_id]);

      if (data) {
        const names: Record<string, string> = {};
        data.forEach(p => names[p.id] = p.name);
        setPlayers(names);
      }
    }
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
      <div className="flex items-center space-x-3 flex-1">
        <div className={`text-sm font-semibold ${match.winner_id === match.player1_id ? 'text-emerald-600' : 'text-gray-600'}`}>
          {players[match.player1_id || ''] || 'Player 1'}
        </div>
        <div className="text-lg font-bold text-gray-900">
          {match.score1} - {match.score2}
        </div>
        <div className={`text-sm font-semibold ${match.winner_id === match.player2_id ? 'text-emerald-600' : 'text-gray-600'}`}>
          {players[match.player2_id || ''] || 'Player 2'}
        </div>
      </div>
      <div className="text-xs text-gray-500">
        {new Date(match.played_at).toLocaleDateString()}
      </div>
    </div>
  );
}
