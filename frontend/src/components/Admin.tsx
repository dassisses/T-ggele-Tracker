import React, { useState, useEffect } from 'react';
import { Player, GameSettings, Rank, SeasonArchive, EloConfig } from '../types';
import { Settings, Shield, Trash2, Save, UserPlus, RefreshCw, Trophy, Archive, Plus, History, Sliders, Zap, Users } from 'lucide-react';
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
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border dark:border-gray-700">
                    <div className="flex justify-center mb-6">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Admin Login</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passwort</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 dark:text-white outline-none"
                                placeholder="Passwort eingeben"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-gray-900 dark:bg-emerald-600 text-white rounded-lg hover:bg-black dark:hover:bg-emerald-700 transition-colors font-semibold"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Verwalte hier alle Aspekte der App.</p>
                </div>
                <button
                    onClick={() => setIsAuthenticated(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    Ausloggen
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">System Einstellungen</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Basis-Konfiguration</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">K-Faktor (Basis Geschwindigkeit)</label>
                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{kFactor}</span>
                                </div>
                                <input
                                    type="range" min="10" max="100" step="1"
                                    value={kFactor}
                                    onChange={(e) => setKFactor(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                />
                                <p className="text-xs text-gray-500 mt-1">Höherer Wert = Schnellere Rangaufstiege/abstiege (Standard: 32)</p>
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

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saison & Reset</h2>
                    </div>

                    <div className="p-5 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800">
                        <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-2">Neue Saison starten</h3>
                        <p className="text-sm text-purple-700 dark:text-purple-400 mb-4 leading-relaxed">
                            Archiviert alle aktuellen Rankings und Matches in die Historie und setzt die Saison auf Null.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Name (z.B. Q1 2026)"
                                value={newSeasonName}
                                onChange={e => setNewSeasonName(e.target.value)}
                                className="flex-1 px-4 py-2 border border-purple-200 dark:border-purple-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                            />
                            <button onClick={handleArchiveSeason} disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium whitespace-nowrap">
                                Archivieren & Reset
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <Sliders className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Erweiterte Punkte-Logik</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Definiere genau, wie Punkte vergeben werden</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSaveSettings}
                            className="px-6 py-2 bg-gray-900 dark:bg-emerald-600 text-white rounded-lg hover:bg-black dark:hover:bg-emerald-700 font-bold flex items-center gap-2 shadow-lg transition-colors"
                        >
                            <Save className="w-4 h-4" /> Einstellungen Speichern
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" /> Leistungs-Anreize
                            </h3>

                            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-800">
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-800 dark:text-gray-300">Tor-Differenz Bonus</label>
                                    <span className="text-sm font-bold text-amber-600">+{eloConfig.goal_diff_bonus_percent}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="100" step="5"
                                    value={eloConfig.goal_diff_bonus_percent}
                                    onChange={(e) => setEloConfig({ ...eloConfig, goal_diff_bonus_percent: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-amber-200 dark:bg-amber-800 rounded-lg appearance-none cursor-pointer accent-amber-600 mb-2"
                                />
                                <p className="text-xs text-gray-600 dark:text-gray-400">Pro Tor Differenz gibt es X% mehr Punkte. (Bei 10:0 statt 10:9 mehr Punkte gewinnen)</p>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Spieler verwalten</h2>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="Neuer Spieler Name"
                                value={newPlayerName}
                                onChange={(e) => setNewPlayerName(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 dark:text-white outline-none"
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
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                            {players.concat().sort((a, b) => a.name.localeCompare(b.name)).map(player => (
                                <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg group transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{player.name}</span>
                                    <button
                                        onClick={() => confirm(`Spieler "${player.name}" löschen?`) && onDeletePlayer(player.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ränge definieren</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-2 items-end p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800">
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs font-semibold text-amber-800 dark:text-amber-400 uppercase">Name</label>
                                    <input value={newRankName} onChange={e => setNewRankName(e.target.value)} className="w-full px-3 py-2 border border-amber-200 dark:border-amber-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm dark:bg-gray-700 dark:text-white" placeholder="z.B. Legend" />
                                </div>
                                <div className="w-24 space-y-1">
                                    <label className="text-xs font-semibold text-amber-800 dark:text-amber-400 uppercase">Min ELO</label>
                                    <input type="number" value={newRankElo} onChange={e => setNewRankElo(e.target.value)} className="w-full px-3 py-2 border border-amber-200 dark:border-amber-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm dark:bg-gray-700 dark:text-white" placeholder="0" />
                                </div>
                                <div className="w-32 space-y-1">
                                    <label className="text-xs font-semibold text-amber-800 dark:text-amber-400 uppercase">Farbe</label>
                                    <select value={newRankColor} onChange={e => setNewRankColor(e.target.value)} className="w-full px-3 py-2 border border-amber-200 dark:border-amber-700 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 dark:text-white text-sm">
                                        <option value="gray">Gray</option>
                                        <option value="blue">Blue</option>
                                        <option value="green">Green</option>
                                        <option value="gold">Gold</option>
                                        <option value="purple">Purple</option>
                                        <option value="red">Red</option>
                                    </select>
                                </div>
                                <button onClick={handleAddRank} className="mb-0.5 px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 shadow-sm transition-transform active:scale-95">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {ranks.sort((a, b) => a.min_elo - b.min_elo).map(rank => (
                                    <div key={rank.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-800 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full bg-${rank.color}-500 shadow-sm ring-2 ring-${rank.color}-100 dark:ring-${rank.color}-900`}></div>
                                            <div>
                                                <span className="font-bold text-gray-900 dark:text-white block text-sm">{rank.name}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">ab {rank.min_elo} ELO</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteRank(rank.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
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
