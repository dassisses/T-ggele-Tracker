import { useEffect, useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { Player, NewMatchPayload, MatchType } from '../types';

interface AddMatchProps {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onAddMatch: (payload: NewMatchPayload) => { ok: boolean; error?: string };
}

export default function AddMatch({ players, onAddPlayer, onAddMatch }: AddMatchProps) {
  const [matchType, setMatchType] = useState<MatchType>('1v1');
  const [team1Players, setTeam1Players] = useState(['', '']);
  const [team2Players, setTeam2Players] = useState(['', '']);
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  // Ensure the team slots match the selected mode
  useEffect(() => {
    if (matchType === '1v1') {
      setTeam1Players(['']);
      setTeam2Players(['']);
    } else if (matchType === '2v2') {
      setTeam1Players((prev) => [prev[0] || '', prev[1] || '']);
      setTeam2Players((prev) => [prev[0] || '', prev[1] || '']);
    } else {
      // 2v1
      setTeam1Players((prev) => [prev[0] || '', prev[1] || '']);
      setTeam2Players(['']);
    }
  }, [matchType]);

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

    const team1Ids =
      matchType === '1v1'
        ? [team1Players[0]]
        : matchType === '2v2'
          ? team1Players
          : team1Players;

    const team2Ids =
      matchType === '1v1'
        ? [team2Players[0]]
        : matchType === '2v2'
          ? team2Players
          : [team2Players[0]];

    if (!score1 || !score2 || team1Ids.some((id) => !id) || team2Ids.some((id) => !id)) {
      setMessage('Bitte alle Felder ausfüllen.');
      return;
    }

    // Prevent duplicates across all selected players
    const allIds = [...team1Ids, ...team2Ids];
    if (new Set(allIds).size !== allIds.length) {
      setMessage('Jeder Spieler darf nur einmal pro Match gesetzt werden.');
      return;
    }

    setLoading(true);

    const s1 = parseInt(score1, 10);
    const s2 = parseInt(score2, 10);

    const result = onAddMatch({ matchType, team1Ids, team2Ids, score1: s1, score2: s2 });

    if (!result.ok) {
      setMessage(result.error || 'Fehler beim Speichern.');
      setLoading(false);
      return;
    }

    setTeam1Players(['', '']);
    setTeam2Players(['', '']);
    setScore1('');
    setScore2('');
    setMessage('Match gespeichert.');
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Record New Tögelle Match</h1>
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
            onClick={() => setMatchType('1v1')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
              matchType === '1v1'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            <Users className="w-5 h-5 mx-auto mb-1" />
            Singles
          </button>
          <button
            type="button"
            onClick={() => setMatchType('2v2')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
              matchType === '2v2'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            <Users className="w-5 h-5 mx-auto mb-1" />
            2 vs 2
          </button>
          <button
            type="button"
            onClick={() => setMatchType('2v1')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
              matchType === '2v1'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            <Users className="w-5 h-5 mx-auto mb-1" />
            2 vs 1
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {matchType === '2v1' ? 'Team (2 Spieler)' : 'Team 1'}
          </label>
          {renderTeamSelects('team1', matchType, team1Players, setTeam1Players, players)}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {matchType === '2v1' ? 'Einzelspieler' : 'Team 2'}
          </label>
          {renderTeamSelects('team2', matchType, team2Players, setTeam2Players, players, matchType === '2v1' ? 1 : 2)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Score Team 1</label>
          <input
            type="number"
            placeholder="Score"
            value={score1}
            onChange={(e) => setScore1(e.target.value)}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Score Team 2</label>
          <input
            type="number"
            placeholder="Score"
            value={score2}
            onChange={(e) => setScore2(e.target.value)}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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

function renderTeamSelects(
  teamKey: 'team1' | 'team2',
  matchType: MatchType,
  teamState: string[],
  setTeamState: (next: string[]) => void,
  players: Player[],
  slotsOverride?: number
) {
  const slots = slotsOverride ?? (matchType === '1v1' ? 1 : matchType === '2v1' && teamKey === 'team2' ? 1 : 2);

  return (
    <div className={`grid gap-3 ${slots > 1 ? 'grid-cols-1' : 'grid-cols-1'}`}>
      {Array.from({ length: slots }).map((_, idx) => (
        <select
          key={`${teamKey}-${idx}`}
          value={teamState[idx] || ''}
          onChange={(e) => {
            const next = [...teamState];
            next[idx] = e.target.value;
            setTeamState(next);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          required
        >
          <option value="">Select Player</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name} ({player.elo_rating} ELO)
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
