import { useMemo } from 'react';
import { ArrowLeft, Trophy, Target, TrendingUp, Flame, Award, History, Users } from 'lucide-react';
import { Match, Player } from '../types';

interface PlayerProfileProps {
  playerId: string;
  players: Player[];
  matches: Match[];
  onBack: () => void;
}

export default function PlayerProfile({ playerId, players, matches, onBack }: PlayerProfileProps) {
  const player = useMemo(() => players.find((p) => p.id === playerId) || null, [players, playerId]);

  const playerMatches = useMemo(
    () =>
      matches
        .filter((m) => m.team1_ids.includes(playerId) || m.team2_ids.includes(playerId))
        .sort((a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime())
        .slice(0, 10),
    [matches, playerId]
  );

  const recentForm = useMemo(
    () => playerMatches.slice(0, 5).map((m) => (m.winner_ids.includes(playerId) ? 'W' : 'L')),
    [playerMatches, playerId]
  );

  const playersById = useMemo(() => {
    const map: Record<string, Player> = {};
    players.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [players]);

  if (!player) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <Users className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm">Spieler nicht gefunden</p>
        <button onClick={onBack} className="mt-6 flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mx-auto font-bold">
          <ArrowLeft className="w-4 h-4" /> Zurück zum Leaderboard
        </button>
      </div>
    );
  }

  const winRate = player.matches_played > 0
    ? ((player.matches_won / player.matches_played) * 100).toFixed(1)
    : '0.0';

  const goalDiff = player.goals_scored - player.goals_conceded;

  return (
    <div className="space-y-8 animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold uppercase tracking-widest text-xs">Zurück zum Leaderboard</span>
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-8 pb-12 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-emerald-500 flex items-center justify-center text-white text-4xl sm:text-6xl font-black shadow-2xl shadow-emerald-500/20 transform -rotate-3 border-4 border-white dark:border-gray-800">
                {player.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                  {player.name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-black text-white px-2 py-0.5 bg-emerald-600 rounded uppercase tracking-widest">Active Player</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Member since {new Date(player.created_at).getFullYear()}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] mb-2">Current Rating</div>
              <div className="text-6xl font-black text-emerald-600 dark:text-emerald-400 leading-none tracking-tighter">
                {Math.round(player.elo_rating)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatBox icon={Trophy} label="Matches" value={player.matches_played} color="blue" />
            <StatBox icon={Award} label="Wins" value={player.matches_won} color="emerald" />
            <StatBox icon={Target} label="Win Rate" value={`${winRate}%`} color="purple" />
            <StatBox icon={Flame} label="Goal Diff" value={goalDiff > 0 ? `+${goalDiff}` : goalDiff} color={goalDiff > 0 ? 'emerald' : 'red'} />
            <StatBox icon={TrendingUp} label="Best Streak" value={player.best_streak} color="orange" />
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6">Recent Form</h3>
            <div className="flex flex-wrap items-center gap-3">
              {recentForm.map((result, index) => (
                <div
                  key={index}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm border-2 ${result === 'W'
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
                    }`}
                >
                  {result}
                </div>
              ))}
              {player.current_streak !== 0 && (
                <div className={`ml-auto px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-sm ${player.current_streak > 0
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                    : 'bg-red-600 text-white shadow-red-500/20'
                  }`}>
                  Streak: {Math.abs(player.current_streak)} {player.current_streak > 0 ? 'Wins' : 'Losses'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Match Historie</h2>
        </div>
        <div className="space-y-4">
          {playerMatches.map((match) => (
            <MatchRow key={match.id} match={match} playerId={playerId} players={playersById} />
          ))}
          {playerMatches.length === 0 && (
            <p className="text-center text-gray-400 py-12 italic font-medium">Noch keine Matches gespielt.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-gray-900/50 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700/50 shadow-sm">
      <div className={`inline-flex p-3 rounded-xl mb-4 ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</div>
      <div className="text-2xl font-black text-gray-900 dark:text-white mt-1 leading-none">{value}</div>
    </div>
  );
}

function MatchRow({ match, playerId, players }: { match: Match; playerId: string; players: Record<string, Player> }) {
  const isTeam1 = match.team1_ids.includes(playerId);
  const isWinner = match.winner_ids.includes(playerId);
  const playerScore = isTeam1 ? match.score1 : match.score2;
  const opponentScore = isTeam1 ? match.score2 : match.score1;
  const opponentIds = isTeam1 ? match.team2_ids : match.team1_ids;
  const opponentNames = opponentIds.map((id) => players[id]?.name || '...').join(' & ');

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border-2 transition-all group ${isWinner
        ? 'border-emerald-50 dark:border-emerald-900/20 bg-emerald-50/30 dark:bg-emerald-900/10'
        : 'border-red-50 dark:border-red-900/20 bg-red-50/30 dark:bg-red-900/10'
      }`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-sm ${isWinner ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}>
            {isWinner ? 'W' : 'L'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gegen</span>
              <span className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{opponentNames}</span>
            </div>
            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase mt-0.5">
              {new Date(match.played_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-gray-900 dark:text-white">{playerScore}</span>
            <span className="text-gray-300 dark:text-gray-700 font-bold">:</span>
            <span className="text-3xl font-black text-gray-400 dark:text-gray-600">{opponentScore}</span>
          </div>
          <div className="text-right min-w-[80px]">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ELO</div>
            <div className={`font-black text-lg ${isWinner ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {isWinner ? '+' : '-'}{Math.round(match.elo_change)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
