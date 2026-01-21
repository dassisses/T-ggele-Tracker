import { useMemo, useState } from 'react';
import { Search, Medal, TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';
import { Player, Rank } from '../types';
import { getRank, getRankBadgeClasses } from '../utils/ranks';

interface LeaderboardProps {
  players: Player[];
  onPlayerClick: (playerId: string) => void;
  ranks: Rank[];
}

export default function Leaderboard({ players, onPlayerClick, ranks }: LeaderboardProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => b.elo_rating - a.elo_rating),
    [players]
  );

  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return sortedPlayers;
    return sortedPlayers.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedPlayers, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Medal className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Global Leaderboard</h1>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Suche Spieler..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white outline-none transition-shadow text-sm"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-gray-800 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">
                <th className="py-4 px-6">Pos</th>
                <th className="py-4 px-6">Spieler & Rang</th>
                <th className="py-4 px-6 text-center">ELO</th>
                <th className="py-4 px-6 text-center">W / L</th>
                <th className="py-4 px-6 text-center">Siegquote</th>
                <th className="py-4 px-6 text-center">Tore (Diff)</th>
                <th className="py-4 px-6 text-center">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {filteredPlayers.map((player, index) => {
                const winRate = player.matches_played > 0
                  ? ((player.matches_won / player.matches_played) * 100).toFixed(1)
                  : '0.0';
                const goalDiff = player.goals_scored - player.goals_conceded;
                const rank = getRank(player.elo_rating, ranks);

                return (
                  <tr
                    key={player.id}
                    onClick={() => onPlayerClick(player.id)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-5 px-6">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900 font-black text-gray-300 dark:text-gray-700 group-hover:text-emerald-500 transition-colors">
                        {index < 3 ? (
                          <Medal className={`w-5 h-5 ${index === 0 ? 'text-yellow-500' :
                              index === 1 ? 'text-gray-400' : 'text-amber-600'
                            }`} />
                        ) : (
                          index + 1
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {player.name}
                        </span>
                        <div className="mt-1 flex">
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase border border-current leading-none ${getRankBadgeClasses(rank)}`}>
                            {rank.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400">
                        {Math.round(player.elo_rating)}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <div className="flex items-center justify-center gap-1 font-bold text-sm">
                        <span className="text-emerald-600 dark:text-emerald-400">{player.matches_won}</span>
                        <span className="text-gray-300 dark:text-gray-700">/</span>
                        <span className="text-red-500">{player.matches_lost}</span>
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase mt-0.5">
                        {player.matches_played} Matches
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-black text-gray-900 dark:text-white">{winRate}%</span>
                        <div className="w-12 h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${Math.min(100, parseFloat(winRate))}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {player.goals_scored} <span className="text-gray-400">:</span> {player.goals_conceded}
                        </div>
                        <span className={`text-[10px] font-black px-1.5 rounded mt-1 ${goalDiff > 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' :
                            goalDiff < 0 ? 'bg-red-50 text-red-600 dark:bg-red-900/30' :
                              'bg-gray-50 text-gray-500'
                          }`}>
                          {goalDiff > 0 ? '+' : ''}{goalDiff}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center">
                      {player.current_streak !== 0 ? (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase ${player.current_streak > 0
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                            : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                          }`}>
                          {player.current_streak > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {Math.abs(player.current_streak)}
                        </div>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-700 font-bold">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredPlayers.length === 0 && (
            <div className="text-center py-20">
              <Users className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm">Kein Spieler gefunden</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
