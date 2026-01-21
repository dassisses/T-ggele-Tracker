import { useMemo, useState } from 'react';
import { Calendar, Filter, Trophy, Clock } from 'lucide-react';
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
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Spielverlauf</h1>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white outline-none text-sm transition-all"
            >
              <option value="all">Alle Zeit</option>
              <option value="today">Heute</option>
              <option value="week">Letzte 7 Tage</option>
              <option value="month">Letzte 30 Tage</option>
            </select>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {filteredMatches.map((match) => (
            <MatchItem key={match.id} match={match} players={playersById} />
          ))}
          {filteredMatches.length === 0 && (
            <div className="text-center py-20">
              <Clock className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm italic">Keine Matches im gewählten Zeitraum</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MatchItem({ match, players }: { match: Match; players: Record<string, Player> }) {
  const getTeamNames = (ids: string[]) =>
    ids.map((id) => players[id]?.name || '...').join(' & ');

  const team1Name = getTeamNames(match.team1_ids);
  const team2Name = getTeamNames(match.team2_ids);
  const team1Won = match.winner_ids.some((id) => match.team1_ids.includes(id));
  const matchDate = new Date(match.played_at);

  return (
    <div className="bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 sm:p-5 hover:shadow-lg hover:border-emerald-100 dark:hover:border-emerald-900/50 transition-all duration-300 group">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <div className="flex flex-col items-center sm:items-start shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
              <Calendar className="w-3.5 h-3.5" />
              {matchDate.toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase mt-0.5">
              <Clock className="w-3 h-3" />
              {matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="flex-1 w-full grid grid-cols-3 items-center gap-2 sm:gap-4">
            <div className={`text-center sm:text-right flex flex-col items-center sm:items-end ${team1Won ? '' : 'opacity-40'}`}>
              <div className="flex items-center gap-2">
                {team1Won && <Trophy className="w-4 h-4 text-yellow-500 hidden sm:block" />}
                <span className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm sm:text-base truncate max-w-[120px]">
                  {team1Name}
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{team1Won ? 'Winner' : ''}</span>
            </div>

            <div className="flex justify-center">
              <div className="bg-gray-900 dark:bg-gray-700 text-white rounded-xl px-4 py-2 flex items-center gap-2 shadow-inner border border-white/5">
                <span className="text-xl font-black">{match.score1}</span>
                <span className="text-gray-500 font-bold">:</span>
                <span className="text-xl font-black">{match.score2}</span>
              </div>
            </div>

            <div className={`text-center sm:text-left flex flex-col items-center sm:items-start ${!team1Won ? '' : 'opacity-40'}`}>
              <div className="flex items-center gap-2">
                <span className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm sm:text-base truncate max-w-[120px]">
                  {team2Name}
                </span>
                {!team1Won && <Trophy className="w-4 h-4 text-yellow-500 hidden sm:block" />}
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{!team1Won ? 'Winner' : ''}</span>
            </div>
          </div>
        </div>

        <div className="flex md:flex-col items-center justify-between md:justify-center md:pl-6 md:border-l border-gray-100 dark:border-gray-700 shrink-0">
          <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">ELO Change</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter mt-1">
            +{Math.round(match.elo_change)}
          </div>
        </div>
      </div>
    </div>
  );
}
