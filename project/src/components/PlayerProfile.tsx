import { useEffect, useState } from 'react';
import { supabase, Player, Match } from '../lib/supabase';
import { ArrowLeft, Trophy, Target, TrendingUp, Flame, Award } from 'lucide-react';

interface PlayerProfileProps {
  playerId: string;
  onBack: () => void;
}

export default function PlayerProfile({ playerId, onBack }: PlayerProfileProps) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentForm, setRecentForm] = useState<string[]>([]);

  useEffect(() => {
    loadPlayerData();
  }, [playerId]);

  async function loadPlayerData() {
    try {
      const [playerRes, matchesRes] = await Promise.all([
        supabase.from('players').select('*').eq('id', playerId).single(),
        supabase
          .from('matches')
          .select('*')
          .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
          .order('played_at', { ascending: false })
          .limit(10),
      ]);

      if (playerRes.data) {
        setPlayer(playerRes.data);
      }

      if (matchesRes.data) {
        setMatches(matchesRes.data);

        const form = matchesRes.data.slice(0, 5).map(m =>
          m.winner_id === playerId ? 'W' : 'L'
        );
        setRecentForm(form);
      }
    } catch (error) {
      console.error('Error loading player data:', error);
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

  if (!player) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Player not found</p>
        <button onClick={onBack} className="mt-4 text-emerald-600 hover:text-emerald-700">
          Go Back
        </button>
      </div>
    );
  }

  const winRate = player.matches_played > 0
    ? ((player.matches_won / player.matches_played) * 100).toFixed(1)
    : '0.0';

  const goalDiff = player.goals_scored - player.goals_conceded;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Leaderboard</span>
      </button>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold">
              {player.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{player.name}</h1>
              <p className="text-gray-600">{player.email}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">ELO Rating</div>
            <div className="text-4xl font-bold text-emerald-600">{player.elo_rating}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatBox
            icon={Trophy}
            label="Matches Played"
            value={player.matches_played}
            color="blue"
          />
          <StatBox
            icon={Award}
            label="Wins"
            value={player.matches_won}
            color="emerald"
          />
          <StatBox
            icon={Target}
            label="Win Rate"
            value={`${winRate}%`}
            color="purple"
          />
          <StatBox
            icon={Flame}
            label="Goal Diff"
            value={goalDiff > 0 ? `+${goalDiff}` : goalDiff}
            color={goalDiff > 0 ? 'emerald' : 'red'}
          />
          <StatBox
            icon={TrendingUp}
            label="Best Streak"
            value={player.best_streak}
            color="orange"
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Form</h3>
          <div className="flex items-center space-x-2">
            {recentForm.map((result, index) => (
              <div
                key={index}
                className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white ${
                  result === 'W' ? 'bg-emerald-500' : 'bg-red-500'
                }`}
              >
                {result}
              </div>
            ))}
            {player.current_streak !== 0 && (
              <div className={`ml-4 px-4 py-2 rounded-lg font-semibold ${
                player.current_streak > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                Current Streak: {Math.abs(player.current_streak)} {player.current_streak > 0 ? 'Wins' : 'Losses'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Match History</h2>
        <div className="space-y-3">
          {matches.map((match) => (
            <MatchRow key={match.id} match={match} playerId={playerId} />
          ))}
          {matches.length === 0 && (
            <p className="text-center text-gray-500 py-8">No matches played yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className={`inline-flex p-2 rounded-lg mb-2 ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
    </div>
  );
}

function MatchRow({ match, playerId }: { match: Match; playerId: string }) {
  const [opponentName, setOpponentName] = useState('Unknown');
  const isWinner = match.winner_id === playerId;
  const isPlayer1 = match.player1_id === playerId;
  const playerScore = isPlayer1 ? match.score1 : match.score2;
  const opponentScore = isPlayer1 ? match.score2 : match.score1;
  const opponentId = isPlayer1 ? match.player2_id : match.player1_id;

  useEffect(() => {
    if (opponentId) {
      supabase
        .from('players')
        .select('name')
        .eq('id', opponentId)
        .single()
        .then(({ data }) => {
          if (data) setOpponentName(data.name);
        });
    }
  }, [opponentId]);

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${
      isWinner ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
    }`}>
      <div className="flex items-center space-x-4">
        <div className={`px-3 py-1 rounded font-bold text-white ${
          isWinner ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {isWinner ? 'W' : 'L'}
        </div>
        <div>
          <div className="font-semibold text-gray-900">vs {opponentName}</div>
          <div className="text-sm text-gray-600">
            {new Date(match.played_at).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-2xl font-bold text-gray-900">
          {playerScore} - {opponentScore}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">ELO Change</div>
          <div className={`font-bold ${isWinner ? 'text-emerald-600' : 'text-red-600'}`}>
            {isWinner ? '+' : '-'}{match.elo_change}
          </div>
        </div>
      </div>
    </div>
  );
}
