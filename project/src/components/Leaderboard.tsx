import { useEffect, useState } from 'react';
import { supabase, Player } from '../lib/supabase';
import { Search, Medal, TrendingUp, TrendingDown } from 'lucide-react';

interface LeaderboardProps {
  onPlayerClick: (playerId: string) => void;
}

export default function Leaderboard({ onPlayerClick }: LeaderboardProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = players.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPlayers(filtered);
    } else {
      setFilteredPlayers(players);
    }
  }, [searchQuery, players]);

  async function loadPlayers() {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('elo_rating', { ascending: false });

      if (error) throw error;
      if (data) {
        setPlayers(data);
        setFilteredPlayers(data);
      }
    } catch (error) {
      console.error('Error loading players:', error);
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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Global Leaderboard</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Rank</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Player</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">ELO</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Matches</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">W/L</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Win Rate</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Goals</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Streak</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player, index) => {
                const winRate = player.matches_played > 0
                  ? ((player.matches_won / player.matches_played) * 100).toFixed(1)
                  : '0.0';
                const goalDiff = player.goals_scored - player.goals_conceded;

                return (
                  <tr
                    key={player.id}
                    onClick={() => onPlayerClick(player.id)}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {index < 3 ? (
                          <Medal className={`w-5 h-5 ${
                            index === 0 ? 'text-yellow-500' :
                            index === 1 ? 'text-gray-400' :
                            'text-amber-600'
                          }`} />
                        ) : (
                          <span className="font-semibold text-gray-600 w-5 text-center">{index + 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{player.name}</div>
                      <div className="text-sm text-gray-500">{player.email}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                        {player.elo_rating}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">{player.matches_played}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-emerald-600 font-semibold">{player.matches_won}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-red-600 font-semibold">{player.matches_lost}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-semibold text-gray-900">{winRate}%</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="text-sm">
                        <span className="text-gray-900">{player.goals_scored}</span>
                        <span className="text-gray-400"> / </span>
                        <span className="text-gray-600">{player.goals_conceded}</span>
                      </div>
                      <div className={`text-xs font-semibold ${goalDiff > 0 ? 'text-emerald-600' : goalDiff < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        {goalDiff > 0 ? '+' : ''}{goalDiff}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {player.current_streak !== 0 && (
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded ${
                          player.current_streak > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {player.current_streak > 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="font-semibold">{Math.abs(player.current_streak)}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredPlayers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No players found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
