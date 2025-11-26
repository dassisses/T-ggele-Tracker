import { useMemo } from 'react';
import { TrendingUp, Target, Flame, Award } from 'lucide-react';
import { Match, Player } from '../types';

interface DashboardProps {
  players: Player[];
  matches: Match[];
  onPlayerClick: (playerId: string) => void;
}

export default function Dashboard({ players, matches, onPlayerClick }: DashboardProps) {
  const topPlayers = useMemo(
    () => [...players].sort((a, b) => b.elo_rating - a.elo_rating).slice(0, 5),
    [players]
  );

  const recentMatches = useMemo(
    () =>
      [...matches]
        .sort((a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime())
        .slice(0, 10),
    [matches]
  );

  const stats = useMemo(() => {
    const totalGoals = matches.reduce((sum, m) => sum + m.score1 + m.score2, 0);
    return {
      totalPlayers: players.length,
      totalMatches: matches.length,
      avgGoals: matches.length ? (totalGoals / matches.length).toFixed(1) : '0.0',
    };
  }, [matches, players]);

  const playersById = useMemo(() => {
    const map: Record<string, Player> = {};
    players.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [players]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Players"
          value={stats.totalPlayers || 0}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Matches Played"
          value={stats.totalMatches || 0}
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
              <MatchCard key={match.id} match={match} players={playersById} />
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

function MatchCard({ match, players }: { match: Match; players: Record<string, Player> }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
      <div className="flex items-center space-x-3 flex-1">
        <div className={`text-sm font-semibold ${match.winner_id === match.player1_id ? 'text-emerald-600' : 'text-gray-600'}`}>
          {players[match.player1_id || '']?.name || 'Player 1'}
        </div>
        <div className="text-lg font-bold text-gray-900">
          {match.score1} - {match.score2}
        </div>
        <div className={`text-sm font-semibold ${match.winner_id === match.player2_id ? 'text-emerald-600' : 'text-gray-600'}`}>
          {players[match.player2_id || '']?.name || 'Player 2'}
        </div>
      </div>
      <div className="text-xs text-gray-500">
        {new Date(match.played_at).toLocaleDateString()}
      </div>
    </div>
  );
}
