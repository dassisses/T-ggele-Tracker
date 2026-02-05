import React, { useState, useEffect } from 'react';
import { Player, GameSettings, Rank, SeasonArchive, EloConfig } from '../types';
import { Settings, Shield, Trash2, Save, UserPlus, RefreshCw, Trophy, Plus, History, Sliders, Zap, Users } from 'lucide-react';
import { api } from '../lib/api';

interface AdminProps {
    players: Player[];
    settings: GameSettings;
    ranks: Rank[];
    onAddPlayer: (name: string) => Promise<void>;
    onDeletePlayer: (id: string) => Promise<void>;
    onResetData: () => void;
    onUpdateSettings: (newSettings: GameSettings) => Promise<void>;
    onRefresh: () => Promise<void>;
    onViewSeason: (id: string, name: string) => void;
}

const DEFAULT_ELO_CONFIG: EloConfig = {
    goal_diff_bonus_percent: 0,
    underdog_bonus_percent: 0,
    underdog_loss_divider: 1.0,
    match_type_1v1_mult: 1.0,
    match_type_2v2_mult: 1.0,
    match_type_2v1_mult: 1.0,
};

// Color mapping for ranks - Tailwind JIT can't parse dynamic class names
const RANK_COLORS: Record<string, string> = {
    gray: '#9ca3af',   // Lighter gray for better dark mode visibility
    blue: '#3b82f6',
    green: '#22c55e',
    gold: '#eab308',
    purple: '#a855f7',
    red: '#ef4444',
};

export default function Admin({
    players,
    settings,
    ranks: initialRanks,
    onAddPlayer,
    onDeletePlayer,
    onUpdateSettings,
    onRefresh,
    onViewSeason,
}: AdminProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [newPlayerName, setNewPlayerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [seasons, setSeasons] = useState<SeasonArchive[]>([]);

    // Rank Management State
    const [ranks, setRanks] = useState<Rank[]>(initialRanks);
    const [newRankName, setNewRankName] = useState('');
    const [newRankElo, setNewRankElo] = useState('');
    const [newRankColor, setNewRankColor] = useState('gray');

    // Season Management State
    const [newSeasonName, setNewSeasonName] = useState('');

    // Elo Config State
    const [kFactor, setKFactor] = useState(32);
    const [eloConfig, setEloConfig] = useState<EloConfig>(DEFAULT_ELO_CONFIG);

    useEffect(() => {
        setRanks(initialRanks);
    }, [initialRanks]);

    useEffect(() => {
        setKFactor(settings.kFactor);
        if (settings.eloConfig) {
            setEloConfig(settings.eloConfig);
        }
    }, [settings]);

    useEffect(() => {
        if (isAuthenticated) {
            loadSeasons();
        }
    }, [isAuthenticated]);

    const loadSeasons = async () => {
        try {
            const s = await api.getSeasons();
            setSeasons(s);
        } catch (e) {
            console.error(e);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const correctPassword = settings.adminPassword || 'unemployed';
        if (password === correctPassword) {
            setIsAuthenticated(true);
        } else {
            alert('Falsches Passwort!');
        }
    };

    const handleSaveSettings = async () => {
        await onUpdateSettings({
            ...settings,
            kFactor,
            eloConfig
        });
        alert('Einstellungen erfolgreich gespeichert.');
    };

    const handleAddRank = async () => {
        if (!newRankName || !newRankElo) return;
        try {
            await api.createRank({
                name: newRankName,
                min_elo: parseInt(newRankElo),
                color: newRankColor,
            });
            setNewRankName('');
            setNewRankElo('');
            await onRefresh();
        } catch (e) {
            alert('Fehler beim Erstellen des Rangs');
        }
    };

    const handleDeleteRank = async (id: string) => {
        if (!confirm('Rang wirklich löschen?')) return;
        try {
            await api.deleteRank(id);
            await onRefresh();
        } catch (e) {
            alert('Fehler beim Löschen');
        }
    };

    const handleArchiveSeason = async () => {
        if (!newSeasonName.trim()) {
            alert('Bitte Namen für die neue Saison/Archiv eingeben');
            return;
        }
        if (!confirm(`Saison "${newSeasonName}" archivieren und NEUE Saison starten? Alle aktuellen Stats werden zurückgesetzt!`)) return;

        setLoading(true);
        try {
            await api.archiveSeason(newSeasonName);
            setNewSeasonName('');
            await onRefresh();
            await loadSeasons();
            alert('Saison erfolgreich archiviert und Reset durchgeführt.');
        } catch (e) {
            alert('Fehler beim Archivieren');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-2xl w-full max-w-md border dark:border-gray-700">
                    <div className="flex justify-center mb-8">
                        <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <Shield className="w-10 h-10 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-8">Admin Login</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-2">Passwort</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white dark:bg-gray-700 dark:text-white outline-none transition-all text-lg"
                                placeholder="Passwort eingeben"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-4 bg-gray-900 dark:bg-emerald-600 text-white rounded-xl hover:bg-black dark:hover:bg-emerald-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl active:scale-[0.98]"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 animate-fade-in pb-20 px-6">
            <div className="flex items-center justify-between pb-6 border-b-2 border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Admin Dashboard</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 font-medium">Verwalte hier alle Aspekte der App.</p>
                </div>
                <button
                    onClick={() => setIsAuthenticated(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    Ausloggen
                </button>
            </div>

            <div className="flex flex-col gap-12">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-10 space-y-8 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-6">
                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                            <Settings className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">System Einstellungen</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Basis-Konfiguration</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-base font-bold text-gray-700 dark:text-gray-300">K-Faktor (Basis Geschwindigkeit)</label>
                                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{kFactor}</span>
                                </div>
                                <input
                                    type="range" min="10" max="100" step="1"
                                    value={kFactor}
                                    onChange={(e) => setKFactor(parseInt(e.target.value))}
                                    className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-emerald-600"
                                />
                                <p className="text-xs text-gray-500 mt-2 font-medium font-mono">HÖHERER WERT = SCHNELLERE RANG-ÄNDERUNGEN (STANDARD: 32)</p>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 block">Admin Passwort ändern</label>
                                <div className="flex gap-2">
                                    <input id="new-admin-password" type="password" placeholder="Neues Passwort" className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-400 bg-white dark:bg-gray-700 dark:text-white outline-none text-sm" />
                                    <button
                                        onClick={async () => {
                                            const i = document.getElementById('new-admin-password') as HTMLInputElement;
                                            if (i.value) { await onUpdateSettings({ ...settings, adminPassword: i.value }); i.value = ''; alert('Passwort geändert'); }
                                        }}
                                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium dark:text-white transition-colors"
                                    >
                                        Speichern
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-10 space-y-8 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-6">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                            <RefreshCw className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Saison & Reset</h2>
                    </div>

                    <div className="p-8 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-800">
                        <h3 className="text-lg font-black text-purple-900 dark:text-purple-300 mb-3 uppercase tracking-wider">Neue Saison starten</h3>
                        <p className="text-base text-purple-700 dark:text-purple-400 mb-6 leading-relaxed font-medium">
                            Archiviert alle aktuellen Rankings und Matches in die Historie und setzt die Saison auf Null.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Name (z.B. Q1 2026)"
                                value={newSeasonName}
                                onChange={e => setNewSeasonName(e.target.value)}
                                className="flex-1 px-5 py-3 border-2 border-purple-200 dark:border-purple-700 rounded-xl focus:ring-4 focus:ring-purple-500/20 outline-none bg-white dark:bg-gray-700 dark:text-white font-bold text-lg"
                            />
                            <button onClick={handleArchiveSeason} disabled={loading} className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold whitespace-nowrap shadow-lg transition-all active:scale-95">
                                Archivieren & Reset
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-10 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-8 mb-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                                <Sliders className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Erweiterte Punkte-Logik</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Definiere genau, wie Punkte vergeben werden</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSaveSettings}
                            className="px-8 py-3 bg-gray-900 dark:bg-emerald-600 text-white rounded-xl hover:bg-black dark:hover:bg-emerald-700 font-extrabold flex items-center gap-3 shadow-xl transition-all active:scale-95"
                        >
                            <Save className="w-5 h-5" /> Einstellungen Speichern
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <h3 className="text-lg font-black text-gray-800 dark:text-gray-200 flex items-center gap-2 uppercase tracking-wide">
                                <Zap className="w-5 h-5 text-amber-500" /> Leistungs-Anreize
                            </h3>

                            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-6 border border-amber-100 dark:border-amber-800">
                                <div className="flex justify-between mb-3">
                                    <label className="text-base font-bold text-gray-800 dark:text-gray-300">Tor-Differenz Bonus</label>
                                    <span className="text-lg font-black text-amber-600">+{eloConfig.goal_diff_bonus_percent}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="100" step="5"
                                    value={eloConfig.goal_diff_bonus_percent}
                                    onChange={(e) => setEloConfig({ ...eloConfig, goal_diff_bonus_percent: parseInt(e.target.value) })}
                                    className="w-full h-3 bg-amber-200 dark:bg-amber-800 rounded-full appearance-none cursor-pointer accent-amber-600 mb-3"
                                />
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium italic">Pro Tor Differenz gibt es X% mehr Punkte. (Bei 10:0 statt 10:9 mehr Punkte gewinnen)</p>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-800 dark:text-gray-300">Underdog Bonus (Sieg)</label>
                                    <span className="text-sm font-bold text-blue-600">+{eloConfig.underdog_bonus_percent}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="100" step="5"
                                    value={eloConfig.underdog_bonus_percent}
                                    onChange={(e) => setEloConfig({ ...eloConfig, underdog_bonus_percent: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-blue-200 dark:bg-blue-800 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-2"
                                />
                                <p className="text-xs text-gray-600 dark:text-gray-400">Zusatzpunkte, wenn ein schwächeres Team (weniger Elo) gewinnt.</p>
                            </div>

                            <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-4 border border-green-100 dark:border-green-800">
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-800 dark:text-gray-300">Underdog Schutz (Niederlage)</label>
                                    <span className="text-sm font-bold text-green-600">÷ {eloConfig.underdog_loss_divider || 1.0}</span>
                                </div>
                                <input
                                    type="range" min="1.0" max="5.0" step="0.1"
                                    value={eloConfig.underdog_loss_divider || 1.0}
                                    onChange={(e) => setEloConfig({ ...eloConfig, underdog_loss_divider: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-green-200 dark:bg-green-800 rounded-lg appearance-none cursor-pointer accent-green-600 mb-2"
                                />
                                <p className="text-xs text-gray-600 dark:text-gray-400">Teilt die Minuspunkte durch Faktor X, wenn der Underdog verliert.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-500" /> Modus-Gewichtung
                            </h3>

                            <div className="grid gap-4">
                                {['1v1', '2v2', '2v1'].map((type) => (
                                    <div key={type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <span className="text-sm font-medium dark:text-gray-300 uppercase">{type.replace('match_type_', '').replace('_mult', '')} Faktor</span>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number" step="0.1" min="0.1" max="5.0"
                                                value={(eloConfig as any)[`match_type_${type}_mult`]}
                                                onChange={(e) => setEloConfig({ ...eloConfig, [`match_type_${type}_mult`]: parseFloat(e.target.value) })}
                                                className="w-20 px-2 py-1 border dark:border-gray-600 rounded text-center font-bold dark:bg-gray-700 dark:text-white"
                                            />
                                            <span className="text-xs text-gray-400">x</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-12">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-10 space-y-8 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-5 border-b-2 border-gray-50 dark:border-gray-700 pb-8">
                            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl shadow-inner">
                                <UserPlus className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Spieler verwalten</h2>
                        </div>

                        <div className="max-w-4xl">
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Neuer Spieler Name"
                                    value={newPlayerName}
                                    onChange={(e) => setNewPlayerName(e.target.value)}
                                    className="flex-1 px-6 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white dark:bg-gray-700 dark:text-white outline-none font-bold text-xl transition-all shadow-sm"
                                />
                                <button
                                    onClick={async () => {
                                        if (newPlayerName) {
                                            setLoading(true);
                                            await onAddPlayer(newPlayerName);
                                            setNewPlayerName('');
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                    className="px-6 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95 flex items-center gap-2 group h-[60px]"
                                >
                                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                                    <span className="font-bold text-lg uppercase tracking-wider">Hinzufügen</span>
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {players.concat().sort((a, b) => a.name.localeCompare(b.name)).map(player => (
                                <div key={player.id} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl group transition-all border-2 border-transparent hover:border-emerald-500/20 shadow-sm">
                                    <span className="text-lg font-bold text-gray-800 dark:text-gray-200 tracking-tight">{player.name}</span>
                                    <button
                                        onClick={() => confirm(`Spieler "${player.name}" löschen?`) && onDeletePlayer(player.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-6 h-6" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl p-10 space-y-10 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-5 border-b-2 border-gray-50 dark:border-gray-700 pb-8">
                            <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl shadow-inner">
                                <Trophy className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-whiteTracking-tight">Ränge definieren</h2>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                                <div className="space-y-3 lg:col-span-4">
                                    <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-2">Rang Name</label>
                                    <input value={newRankName} onChange={e => setNewRankName(e.target.value)} className="w-full px-6 py-4 border-2 border-amber-100 dark:border-amber-700 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-bold text-xl dark:bg-gray-700 dark:text-white transition-all shadow-sm" placeholder="z.B. Legend" />
                                </div>
                                <div className="space-y-3 lg:col-span-3">
                                    <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-2">Min ELO</label>
                                    <input type="number" value={newRankElo} onChange={e => setNewRankElo(e.target.value)} className="w-full px-6 py-4 border-2 border-amber-100 dark:border-amber-700 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-bold text-xl dark:bg-gray-700 dark:text-white text-center transition-all shadow-sm" placeholder="0" />
                                </div>
                                <div className="space-y-3 lg:col-span-3">
                                    <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-2">Farbe</label>
                                    <div className="relative">
                                        <select value={newRankColor} onChange={e => setNewRankColor(e.target.value)} className="w-full px-6 py-4 border-2 border-amber-100 dark:border-amber-700 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 bg-white dark:bg-gray-700 dark:text-white font-bold text-xl outline-none cursor-pointer transition-all shadow-sm appearance-none">
                                            <option value="gray">Gray</option>
                                            <option value="blue">Blue</option>
                                            <option value="green">Green</option>
                                            <option value="gold">Gold</option>
                                            <option value="purple">Purple</option>
                                            <option value="red">Red</option>
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <div className="w-6 h-6 rounded-full shadow-md" style={{ backgroundColor: RANK_COLORS[newRankColor as keyof typeof RANK_COLORS] || '#6b7280' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-2">
                                    <button onClick={handleAddRank} className="w-full p-4 bg-amber-600 text-white rounded-2xl hover:bg-amber-700 shadow-xl transition-all active:scale-95 group flex items-center justify-center h-[60px]">
                                        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
                                        <span className="ml-2 font-bold text-lg uppercase tracking-wider">Erstellen</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {ranks.sort((a, b) => a.min_elo - b.min_elo).map(rank => (
                                    <div key={rank.id} className="flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-amber-500/30 transition-all shadow-sm group">
                                        <div className="flex items-center gap-5">
                                            <div
                                                className="w-8 h-8 rounded-full shadow-lg ring-4 ring-white/10 flex-shrink-0"
                                                style={{ backgroundColor: RANK_COLORS[rank.color] || '#6b7280' }}
                                            ></div>
                                            <div>
                                                <span className="font-black text-gray-900 dark:text-white block text-lg tracking-tight leading-none mb-1">{rank.name}</span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-bold font-mono">AB {rank.min_elo} ELO</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteRank(rank.id)} className="text-gray-300 hover:text-red-500 transition-all p-2 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg opacity-0 group-hover:opacity-100">
                                            <Trash2 className="w-6 h-6" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {seasons.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saison Archiv</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {seasons.map(season => (
                            <div key={season.id} className="group p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer transition-all relative overflow-hidden"
                                onClick={() => onViewSeason(season.id, season.name)}
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <History className="w-12 h-12 text-blue-200 dark:text-blue-800 transform rotate-12" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{season.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-white dark:bg-gray-700 inline-block px-2 py-1 rounded-md border border-gray-100 dark:border-gray-600">
                                        {new Date(season.archived_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
