import React, { useEffect, useState } from 'react';
import { Users, AlertTriangle, CheckCircle, Trophy, UserPlus } from 'lucide-react';
import { Player, NewMatchPayload, MatchType } from '../types';

interface AddMatchProps {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onAddMatch: (payload: NewMatchPayload) => Promise<{ ok: boolean; error?: string }>;
}

export default function AddMatch({ players, onAddMatch }: AddMatchProps) {
  const [matchType, setMatchType] = useState<MatchType>('1v1');
  const [team1Players, setTeam1Players] = useState(['', '']);
  const [team2Players, setTeam2Players] = useState(['', '']);
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    if (matchType === '1v1') {
      setTeam1Players(['']);
      setTeam2Players(['']);
    } else if (matchType === '2v2') {
      setTeam1Players(['', '']);
      setTeam2Players(['', '']);
    } else {
      setTeam1Players(['', '']);
      setTeam2Players(['']);
    }
  }, [matchType]);

  async function handleSubmitMatch(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const activeTeam1Players = team1Players.slice(0, matchType === '2v1' || matchType === '2v2' ? 2 : 1);
    const activeTeam2Players = team2Players.slice(0, matchType === '2v2' ? 2 : 1);

    if (!score1 || !score2 || activeTeam1Players.some((id) => !id) || activeTeam2Players.some((id) => !id)) {
      setMessage({ text: 'Bitte alle Felder ausfüllen.', type: 'error' });
      return;
    }

    const s1 = parseInt(score1, 10);
    const s2 = parseInt(score2, 10);

    if (s1 > 10 || s2 > 10) {
      setMessage({ text: 'Maximaler Score ist 10!', type: 'error' });
      return;
    }

    const allIds = [...activeTeam1Players, ...activeTeam2Players];
    if (new Set(allIds).size !== allIds.length) {
      setMessage({ text: 'Ein Spieler darf nur einmal im Match sein.', type: 'error' });
      return;
    }

    setLoading(true);

    const result = await onAddMatch({
      matchType,
      team1Ids: activeTeam1Players,
      team2Ids: activeTeam2Players,
      score1: s1,
      score2: s2
    });

    if (!result.ok) {
      setMessage({ text: result.error || 'Fehler beim Speichern.', type: 'error' });
    } else {
      setScore1('');
      setScore2('');
      setMessage({ text: 'Match erfolgreich eingetragen!', type: 'success' });
      // Reset after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl shadow-inner">
            <Trophy className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Match eintragen</h1>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Schreib Geschichte.</p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 animate-fade-in ${message.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30' :
            'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
            }`}>
            {message.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            <span className="font-bold text-sm">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmitMatch} className="space-y-10">
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 text-center">Spielmodus wählen</label>
            <div className="grid grid-cols-3 gap-4">
              <ModeButton label="1 vs 1" mode="1v1" current={matchType} set={setMatchType} />
              <ModeButton label="2 vs 2" mode="2v2" current={matchType} set={setMatchType} />
              <ModeButton label="2 vs 1" mode="2v1" current={matchType} set={setMatchType} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Team 1 / Winner 1 */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">
                  {matchType === '2v1' ? 'Team (Angreifer)' : 'Team A'}
                </label>
                <Users className="w-4 h-4 text-emerald-500" />
              </div>
              <PlayerSelects
                ids={team1Players}
                setIds={setTeam1Players}
                count={matchType === '2v1' || matchType === '2v2' ? 2 : 1}
                players={players}
              />
              <div className="relative pt-6 border-t border-gray-100 dark:border-gray-700/50">
                <label className="absolute -top-3 left-4 bg-white dark:bg-gray-800 px-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-500/20 rounded-full">Score A</label>
                <input
                  type="number"
                  value={score1}
                  onChange={(e) => setScore1(e.target.value)}
                  min="0"
                  max="10"
                  className="w-full text-4xl font-black text-center py-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-transparent focus:border-emerald-500 dark:text-white outline-none transition-all placeholder-gray-100 dark:placeholder-gray-700 shadow-inner overflow-hidden"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Team 2 / Winner 2 */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">
                  {matchType === '2v1' ? 'Einzelspieler' : 'Team B'}
                </label>
                <UserPlus className="w-4 h-4 text-emerald-500" />
              </div>
              <PlayerSelects
                ids={team2Players}
                setIds={setTeam2Players}
                count={matchType === '2v2' ? 2 : 1}
                players={players}
              />
              <div className="relative pt-6 border-t border-gray-100 dark:border-gray-700/50">
                <label className="absolute -top-3 left-4 bg-white dark:bg-gray-800 px-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-500/20 rounded-full">Score B</label>
                <input
                  type="number"
                  value={score2}
                  onChange={(e) => setScore2(e.target.value)}
                  min="0"
                  max="10"
                  className="w-full text-4xl font-black text-center py-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-transparent focus:border-emerald-500 dark:text-white outline-none transition-all placeholder-gray-100 dark:placeholder-gray-700 shadow-inner overflow-hidden"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-900 dark:bg-emerald-600 text-white rounded-xl hover:bg-black dark:hover:bg-emerald-700 transition-all font-black text-lg uppercase tracking-widest shadow-xl shadow-emerald-500/10 disabled:opacity-50 active:scale-95 group"
          >
            {loading ? 'Speichere...' : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" /> Match Bestätigen
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function ModeButton({ label, mode, current, set }: { label: string, mode: MatchType, current: MatchType, set: (m: MatchType) => void }) {
  const isActive = current === mode;
  return (
    <button
      type="button"
      onClick={() => set(mode)}
      className={`flex flex - col items - center justify - center p - 4 rounded - xl transition - all border - 2 ${isActive
        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-md scale-105'
        : 'bg-white dark:bg-gray-800 border-gray-50 dark:border-gray-700 text-gray-300 hover:border-gray-200 dark:hover:border-gray-600'
        } `}
    >
      <Users className={`w - 5 h - 5 mb - 2 ${isActive ? 'text-emerald-500' : 'text-gray-400'} `} />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function PlayerSelects({ ids, setIds, count, players }: { ids: string[], setIds: (v: string[]) => void, count: number, players: Player[] }) {
  const activeIds = ids.slice(0, count);

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <select
          key={idx}
          value={activeIds[idx] || ''}
          onChange={(e) => {
            const next = [...ids];
            next[idx] = e.target.value;
            setIds(next);
          }}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 text-base font-bold border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 dark:text-white outline-none appearance-none transition-all cursor-pointer shadow-sm"
        >
          <option value="">Spieler wählen...</option>
          {players
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((p) => {
              return (
                <option key={p.id} value={p.id}>
                  {p.name} ({Math.round(p.elo_rating)})
                </option>
              );
            })}
        </select>
      ))}
    </div>
  );
}
