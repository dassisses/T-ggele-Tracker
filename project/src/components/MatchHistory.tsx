import { useEffect, useState } from 'react';
import { supabase, Match, Player } from '../lib/supabase';
import { Calendar, Filter, Trophy } from 'lucide-react';

export default function MatchHistory() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    loadMatches();
  }, [dateFilter]);

  async function loadMatches() {
    try {
      let query = supabase
        .from('matches')
        .select('*')
        .order('played_at', { ascending: false });

      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate = new Date();

        switch (dateFilter) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        }

        query = query.gte('played_at', startDate.toISOString());
      }

      const { data: matchesData, error } = await query;

      if (error) throw error;

      if (matchesData) {
        setMatches(matchesData);

        const playerIds = new Set<string>();
        matchesData.forEach(m => {
          if (m.player1_id) playerIds.add(m.player1_id);
          if (m.player2_id) playerIds.add(m.player2_id);
        });

        if (playerIds.size > 0) {
          const { data: playersData } = await supabase
            .from('players')
            .select('*')
            .in('id', Array.from(playerIds));

          if (playersData) {
            const playersMap: Record<string, Player> = {};
            playersData.forEach(p => playersMap[p.id] = p);
            setPlayers(playersMap);
          }
        }
      }
    } catch (error) {
      console.error('Error loading matches:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">Match History</h1>
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {matches.map((match) => (
            <MatchItem key={match.id} match={match} players={players} />
          ))}
          {matches.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No matches found for the selected time period.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MatchItem({ match, players }: { match: Match; players: Record<string, Player> }) {
  const player1 = players[match.player1_id || ''];
  const player2 = players[match.player2_id || ''];

  const isPlayer1Winner = match.winner_id === match.player1_id;
  const matchDate = new Date(match.played_at);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6 flex-1">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div className="text-sm text-gray-600">
              {matchDate.toLocaleDateString()} {matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="flex items-center space-x-4 flex-1">
            <div className={`flex items-center space-x-2 ${isPlayer1Winner ? '' : 'opacity-60'}`}>
              {isPlayer1Winner && <Trophy className="w-5 h-5 text-yellow-500" />}
              <div>
                <div className="font-semibold text-gray-900">{player1?.name || 'Unknown'}</div>
                <div className="text-sm text-gray-500">{player1?.elo_rating || 0} ELO</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
              <span className="text-2xl font-bold text-gray-900">{match.score1}</span>
              <span className="text-gray-400">-</span>
              <span className="text-2xl font-bold text-gray-900">{match.score2}</span>
            </div>

            <div className={`flex items-center space-x-2 ${!isPlayer1Winner ? '' : 'opacity-60'}`}>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{player2?.name || 'Unknown'}</div>
                <div className="text-sm text-gray-500">{player2?.elo_rating || 0} ELO</div>
              </div>
              {!isPlayer1Winner && <Trophy className="w-5 h-5 text-yellow-500" />}
            </div>
          </div>
        </div>

        <div className="ml-4 text-right">
          <div className="text-sm text-gray-500">ELO Change</div>
          <div className="text-lg font-bold text-emerald-600">±{match.elo_change}</div>
        </div>
      </div>
    </div>
  );
}
