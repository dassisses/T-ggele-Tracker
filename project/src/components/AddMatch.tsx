import { useEffect, useState } from 'react';
import { supabase, Player } from '../lib/supabase';
import { calculateEloChange } from '../lib/elo';
import { Plus, Users } from 'lucide-react';

export default function AddMatch() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matchType, setMatchType] = useState<'singles' | 'teams'>('singles');
  const [player1Id, setPlayer1Id] = useState('');
  const [player2Id, setPlayer2Id] = useState('');
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerEmail, setNewPlayerEmail] = useState('');

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    const { data } = await supabase
      .from('players')
      .select('*')
      .order('name');
    if (data) setPlayers(data);
  }

  async function handleAddPlayer(e: React.FormEvent) {
    e.preventDefault();
    if (!newPlayerName || !newPlayerEmail) return;

    try {
      const { data, error } = await supabase
        .from('players')
        .insert([{ name: newPlayerName, email: newPlayerEmail }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setPlayers([...players, data]);
        setNewPlayerName('');
        setNewPlayerEmail('');
        setShowAddPlayer(false);
      }
    } catch (error) {
      console.error('Error adding player:', error);
      alert('Error adding player. Email might already exist.');
    }
  }

  async function handleSubmitMatch(e: React.FormEvent) {
    e.preventDefault();
    if (!player1Id || !player2Id || !score1 || !score2) {
      alert('Please fill in all fields');
      return;
    }

    if (player1Id === player2Id) {
      alert('Players must be different');
      return;
    }

    setLoading(true);

    try {
      const s1 = parseInt(score1);
      const s2 = parseInt(score2);

      if (s1 === s2) {
        alert('Scores cannot be tied');
        setLoading(false);
        return;
      }

      const player1 = players.find(p => p.id === player1Id);
      const player2 = players.find(p => p.id === player2Id);

      if (!player1 || !player2) {
        throw new Error('Players not found');
      }

      const winnerId = s1 > s2 ? player1Id : player2Id;
      const loserId = s1 > s2 ? player2Id : player1Id;
      const winnerRating = s1 > s2 ? player1.elo_rating : player2.elo_rating;
      const loserRating = s1 > s2 ? player2.elo_rating : player1.elo_rating;

      const eloChange = calculateEloChange(winnerRating, loserRating);

      const { error: matchError } = await supabase
        .from('matches')
        .insert([{
          match_type: matchType,
          player1_id: player1Id,
          player2_id: player2Id,
          score1: s1,
          score2: s2,
          winner_id: winnerId,
          elo_change: eloChange,
          played_at: new Date().toISOString(),
        }]);

      if (matchError) throw matchError;

      const winner = s1 > s2 ? player1 : player2;
      const loser = s1 > s2 ? player2 : player1;

      const winnerStreak = winner.current_streak >= 0 ? winner.current_streak + 1 : 1;
      const loserStreak = loser.current_streak <= 0 ? loser.current_streak - 1 : -1;

      await Promise.all([
        supabase
          .from('players')
          .update({
            elo_rating: winnerRating + eloChange,
            matches_played: winner.matches_played + 1,
            matches_won: winner.matches_won + 1,
            goals_scored: winner.goals_scored + (s1 > s2 ? s1 : s2),
            goals_conceded: winner.goals_conceded + (s1 > s2 ? s2 : s1),
            current_streak: winnerStreak,
            best_streak: Math.max(winner.best_streak, winnerStreak),
            updated_at: new Date().toISOString(),
          })
          .eq('id', winnerId),
        supabase
          .from('players')
          .update({
            elo_rating: Math.max(0, loserRating - eloChange),
            matches_played: loser.matches_played + 1,
            matches_lost: loser.matches_lost + 1,
            goals_scored: loser.goals_scored + (s1 > s2 ? s2 : s1),
            goals_conceded: loser.goals_conceded + (s1 > s2 ? s1 : s2),
            current_streak: loserStreak,
            updated_at: new Date().toISOString(),
          })
          .eq('id', loserId),
      ]);

      setPlayer1Id('');
      setPlayer2Id('');
      setScore1('');
      setScore2('');
      loadPlayers();
      alert('Match recorded successfully!');
    } catch (error) {
      console.error('Error recording match:', error);
      alert('Error recording match. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Record New Tögele Match</h1>
          <button
            onClick={() => setShowAddPlayer(!showAddPlayer)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Player</span>
          </button>
        </div>

        {showAddPlayer && (
          <form onSubmit={handleAddPlayer} className="p-4 bg-gray-50 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-900">Add New Player</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Player Name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newPlayerEmail}
                onChange={(e) => setNewPlayerEmail(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Add Player
            </button>
          </form>
        )}

        <form onSubmit={handleSubmitMatch} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Match Type</label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setMatchType('singles')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                  matchType === 'singles'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                <Users className="w-5 h-5 mx-auto mb-1" />
                Singles
              </button>
              <button
                type="button"
                onClick={() => setMatchType('teams')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                  matchType === 'teams'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
                disabled
              >
                <Users className="w-5 h-5 mx-auto mb-1" />
                Teams (Coming Soon)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Player 1</label>
              <select
                value={player1Id}
                onChange={(e) => setPlayer1Id(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              >
                <option value="">Select Player</option>
                {players.map(player => (
                  <option key={player.id} value={player.id}>
                    {player.name} ({player.elo_rating} ELO)
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Score"
                value={score1}
                onChange={(e) => setScore1(e.target.value)}
                min="0"
                className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Player 2</label>
              <select
                value={player2Id}
                onChange={(e) => setPlayer2Id(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              >
                <option value="">Select Player</option>
                {players.map(player => (
                  <option key={player.id} value={player.id}>
                    {player.name} ({player.elo_rating} ELO)
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Score"
                value={score2}
                onChange={(e) => setScore2(e.target.value)}
                min="0"
                className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-50"
          >
            {loading ? 'Recording Match...' : 'Record Match'}
          </button>
        </form>
      </div>
    </div>
  );
}
