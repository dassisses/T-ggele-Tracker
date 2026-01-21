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
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Top Spieler</h2>
          </div>
          <div className="space-y-3">
            {topPlayers.map((player, index) => (
              <div
                key={player.id}
                onClick={() => onPlayerClick(player.id)}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-gray-600"
              >
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white shadow-sm ${index === 0 ? 'bg-yellow-500 ring-4 ring-yellow-100 dark:ring-yellow-900/30' :
                      index === 1 ? 'bg-gray-400 ring-4 ring-gray-100 dark:ring-gray-700/30' :
                        index === 2 ? 'bg-amber-600 ring-4 ring-amber-100 dark:ring-amber-900/30' :
                          'bg-gray-200 text-gray-500'
                    }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{player.name}</div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {player.matches_won} Siege • {player.matches_lost} Niederlagen
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-xl text-emerald-600 dark:text-emerald-400 leading-none">{Math.round(player.elo_rating)}</div>
                  <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mt-1">ELO</div>
                </div>
              </div>
            ))}
            {topPlayers.length === 0 && <p className="text-center text-gray-400 py-8 italic text-sm">Noch keine Spieler registriert.</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Letzte Spiele</h2>
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{title}</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white mt-2 leading-none">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
}

function MatchHistory({ players, matches }: any) {
  return <History />
}

function MatchCard({ match, players }: { match: Match; players: Record<string, Player> }) {
  const getTeamNames = (ids: string[]) =>
    ids.map((id) => players[id]?.name || '...').join(' & ');

  const team1Name = getTeamNames(match.team1_ids);
  const team2Name = getTeamNames(match.team2_ids);
  const team1Won = match.winner_ids.some((id) => match.team1_ids.includes(id));

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
      <div className="grid grid-cols-3 gap-2 items-center flex-1">
        <div className={`text-xs sm:text-sm font-bold truncate ${team1Won ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {team1Name}
        </div>
        <div className="text-center">
          <span className="font-mono font-black text-lg dark:text-white px-3 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            {match.score1}:{match.score2}
          </span>
        </div>
        <div className={`text-xs sm:text-sm font-bold truncate text-right ${!team1Won ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {team2Name}
        </div>
      </div>
      <div className="ml-4 text-[10px] font-bold text-gray-400 dark:text-gray-600 whitespace-nowrap hidden sm:block">
        {new Date(match.played_at).toLocaleDateString()}
      </div>
    </div>
  );
}
