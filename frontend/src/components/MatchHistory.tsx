import { useMemo, useState } from 'react';
import { Calendar, Filter, Trophy } from 'lucide-react';
import { Match, Player } from '../types';

interface MatchHistoryProps {
  matches: Match[];
  players: Player[];
}

export default function MatchHistory({ matches, players }: MatchHistoryProps) {
  const [dateFilter, setDateFilter] = useState('all');

  const playersById = useMemo(() => {
    const map: Record<string, Player> = {};
    players.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [players]);

  const filteredMatches = useMemo(() => {
    const now = new Date();
    let startDate: Date | null = null;

    switch (dateFilter) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate = null;
    }

    const filtered = startDate
      ? matches.filter((m) => new Date(m.played_at).getTime() >= startDate!.getTime())
      : matches;

    return [...filtered].sort(
      (a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime()
    );
  }, [matches, dateFilter]);

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
          {filteredMatches.map((match) => (
            <MatchItem key={match.id} match={match} players={playersById} />
          ))}
          {filteredMatches.length === 0 && (
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
  const teamName = (ids: string[]) =>
    ids.map((id) => players[id]?.name || 'Unknown').join(' & ');
  const team1Name = teamName(match.team1_ids);
  const team2Name = teamName(match.team2_ids);
  const team1Won = match.winner_ids.some((id) => match.team1_ids.includes(id));
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
            <div className={`flex items-center space-x-2 ${team1Won ? '' : 'opacity-60'}`}>
              {team1Won && <Trophy className="w-5 h-5 text-yellow-500" />}
              <div>
                <div className="font-semibold text-gray-900">{team1Name || 'Team 1'}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
              <span className="text-2xl font-bold text-gray-900">{match.score1}</span>
              <span className="text-gray-400">-</span>
              <span className="text-2xl font-bold text-gray-900">{match.score2}</span>
            </div>

            <div className={`flex items-center space-x-2 ${!team1Won ? '' : 'opacity-60'}`}>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{team2Name || 'Team 2'}</div>
              </div>
              {!team1Won && <Trophy className="w-5 h-5 text-yellow-500" />}
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
