import { useMemo, useState } from 'react';
import { Search, Medal, TrendingUp, TrendingDown, Users } from 'lucide-react';
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
    <div className="space-y-10 animate-fade-in pb-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl shadow-inner">
                <Medal className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Leaderboard</h1>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest leading-none">Deine Arena. Deine Regeln.</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                placeholder="Spieler suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 dark:text-white outline-none transition-all font-bold text-sm shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-gray-800 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b-2 border-gray-50 dark:border-gray-700">
                <th className="py-4 px-6 text-center">Pos</th>
                <th className="py-4 px-6">Spieler & Rang</th>
                <th className="py-4 px-6 text-center">ELO</th>
                <th className="py-4 px-6 text-center">W / L</th>
                <th className="py-4 px-6 text-center">Quote</th>
                <th className="py-4 px-6 text-center">Goals</th>
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
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all cursor-pointer group border-b border-gray-50 dark:border-gray-800"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900/50 font-black text-lg text-gray-300 dark:text-gray-700 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 transition-all shadow-sm">
                        {index < 3 ? (
                          <Medal className={`w-6 h-6 ${index === 0 ? 'text-yellow-500 group-hover:text-white' :
                            index === 1 ? 'text-gray-400 group-hover:text-white' : 'text-amber-600 group-hover:text-white'
                            }`} />
                        ) : (
                          index + 1
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900 dark:text-white text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight leading-none mb-1.5">
                          {player.name}
                        </span>
                        <div className="flex">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase border border-current shadow-sm ${getRankBadgeClasses(rank)}`}>
                            {rank.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-mono font-black text-2xl text-emerald-600 dark:text-emerald-400 tracking-tighter shadow-sm">
                        {Math.round(player.elo_rating)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1 font-black text-base">
                        <span className="text-emerald-600 dark:text-emerald-400">{player.matches_won}</span>
                        <span className="text-gray-200 dark:text-gray-800">|</span>
                        <span className="text-red-500">{player.matches_lost}</span>
                      </div>
                      <div className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase mt-0.5 tracking-widest">
                        {player.matches_played} m
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-black text-lg text-gray-900 dark:text-white">{winRate}%</span>
                        <div className="w-12 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-1.5 overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-emerald-500 shadow-lg"
                            style={{ width: `${Math.min(100, parseFloat(winRate))}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <div className="text-base font-black text-gray-900 dark:text-white">
                          {player.goals_scored}:{player.goals_conceded}
                        </div>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md mt-1.5 shadow-sm ${goalDiff > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                          goalDiff < 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                            'bg-gray-100 text-gray-500 dark:bg-gray-800'
                          }`}>
                          {goalDiff > 0 ? '+' : ''}{goalDiff}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {player.current_streak !== 0 ? (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-sm ${player.current_streak > 0
                          ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                          : 'bg-red-600 text-white shadow-red-500/20'
                          }`}>
                          {player.current_streak > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {Math.abs(player.current_streak)}
                        </div>
                      ) : (
                        <span className="text-gray-200 dark:text-gray-800 font-black text-lg">-</span>
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
