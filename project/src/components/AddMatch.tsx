import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { Player, NewMatchPayload } from '../types';

interface AddMatchProps {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onAddMatch: (payload: NewMatchPayload) => { ok: boolean; error?: string };
}

export default function AddMatch({ players, onAddPlayer, onAddMatch }: AddMatchProps) {
  const [matchType, setMatchType] = useState<'singles' | 'teams'>('singles');
  const [player1Id, setPlayer1Id] = useState('');
  const [player2Id, setPlayer2Id] = useState('');
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  function handleAddPlayer(e: React.FormEvent) {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    onAddPlayer(newPlayerName.trim());
    setNewPlayerName('');
    setShowAddPlayer(false);
    setMessage('Spieler hinzugefügt.');
  }

  async function handleSubmitMatch(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!player1Id || !player2Id || !score1 || !score2) {
      setMessage('Bitte alle Felder ausfüllen.');
      return;
    }

    if (player1Id === player2Id) {
      setMessage('Spieler müssen unterschiedlich sein.');
      return;
    }

    setLoading(true);

    const s1 = parseInt(score1, 10);
    const s2 = parseInt(score2, 10);

    const result = onAddMatch({
      player1Id,
      player2Id,
      score1: s1,
      score2: s2,
    });

    if (!result.ok) {
      setMessage(result.error || 'Fehler beim Speichern.');
      setLoading(false);
      return;
    }

    setPlayer1Id('');
    setPlayer2Id('');
    setScore1('');
    setScore2('');
    setMessage('Match gespeichert.');
    setLoading(false);
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

        {message && (
          <div className="px-4 py-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
            {message}
          </div>
        )}

        {showAddPlayer && (
          <form onSubmit={handleAddPlayer} className="p-4 bg-gray-50 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-900">Add New Player</h3>
            <input
              type="text"
              placeholder="Player Name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
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
