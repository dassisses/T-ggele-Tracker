import { useMemo } from 'react';
import { TrendingUp, Target, Flame, Award, History } from 'lucide-react';
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
    <div className="space-y-10 animate-fade-in pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          title="Gesamt Spieler"
          value={stats.totalPlayers || 0}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Gespielte Matches"
          value={stats.totalMatches || 0}
          icon={Target}
          color="blue"
        />
        <StatCard
          title="Tore pro Match"
          value={stats.avgGoals}
          icon={Flame}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Top Spieler</h2>
          </div>
          <div className="space-y-3">
            {topPlayers.map((player, index) => (
              <div
                key={player.id}
                onClick={() => onPlayerClick(player.id)}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-gray-600"
              >
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-2xl font-black text-lg text-white shadow-xl ${index === 0 ? 'bg-yellow-500 ring-4 ring-yellow-400/20' :
                    index === 1 ? 'bg-gray-400 ring-4 ring-gray-400/20' :
                      index === 2 ? 'bg-amber-600 ring-4 ring-amber-600/20' :
                        'bg-gray-200 text-gray-500'
                    }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight">{player.name}</div>
                    <div className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-0.5">
                      {player.matches_won}W – {player.matches_lost}L
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-2xl text-emerald-600 dark:text-emerald-400 leading-none tracking-tighter">{Math.round(player.elo_rating)}</div>
                  <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mt-1 tracking-widest">ELO</div>
                </div>
              </div>
            ))}
            {topPlayers.length === 0 && <p className="text-center text-gray-400 py-8 italic text-sm">Noch keine Spieler registriert.</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Letzte Spiele</h2>
          </div>
          <div className="space-y-3">
            {recentMatches.map((match) => (
              <MatchCard key={match.id} match={match} players={playersById} />
            ))}
            {recentMatches.length === 0 && <p className="text-center text-gray-400 py-8 italic text-sm">Noch keine Matches aufgezeichnet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colorClasses = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl hover:translate-y-[-2px] group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2">{title}</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tighter">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match, players }: { match: Match; players: Record<string, Player> }) {
  const getTeamNames = (ids: string[]) =>
    ids.map((id) => players[id]?.name || '...').join(' & ');

  const team1Name = getTeamNames(match.team1_ids);
  const team2Name = getTeamNames(match.team2_ids);
  const team1Won = match.winner_ids.some((id) => match.team1_ids.includes(id));

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent hover:border-blue-500/20 transition-all shadow-sm group">
      <div className="grid grid-cols-3 gap-4 items-center flex-1">
        <div className={`text-xs sm:text-base font-black uppercase tracking-tight truncate ${team1Won ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-600'}`}>
          {team1Name}
        </div>
        <div className="text-center">
          <span className="font-mono font-black text-xl dark:text-white px-4 py-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform inline-block">
            {match.score1}:{match.score2}
          </span>
        </div>
        <div className={`text-xs sm:text-base font-black uppercase tracking-tight truncate text-right ${!team1Won ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-600'}`}>
          {team2Name}
        </div>
      </div>
      <div className="ml-8 text-xs font-black text-gray-300 dark:text-gray-700 whitespace-nowrap hidden md:block uppercase tracking-widest">
        {new Date(match.played_at).toLocaleDateString()}
      </div>
    </div>
  );
}
