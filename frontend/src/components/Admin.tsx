import React, { useState } from 'react';
import { Player, GameSettings } from '../types';
import { Shield, Trash2, RefreshCw, Save, UserPlus, AlertTriangle } from 'lucide-react';

interface AdminProps {
    players: Player[];
    settings: GameSettings;
    onAddPlayer: (name: string) => Promise<void> | void;
    onDeletePlayer: (id: string) => Promise<void> | void;
    onUpdateSettings: (settings: GameSettings) => Promise<void> | void;
    onResetData: () => void;
}

export default function Admin({
    players,
    settings,
    onAddPlayer,
    onDeletePlayer,
    onUpdateSettings,
    onResetData,
}: AdminProps) {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [tempKFactor, setTempKFactor] = useState(settings.kFactor);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Default password is 'admin' if not set
        const correctPassword = settings.adminPassword || 'admin';
        if (password === correctPassword) {
            setIsAuthenticated(true);
        } else {
            alert('Falsches Passwort!');
        }
    };

    const handleSaveSettings = async () => {
        await onUpdateSettings({
            ...settings,
            kFactor: tempKFactor,
        });
        alert('Einstellungen gespeichert!');
    };

    const handleNewPlayerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPlayerName.trim()) {
            await onAddPlayer(newPlayerName.trim());
            setNewPlayerName('');
            alert('Spieler hinzugefügt!');
        }
    };

    const confirmReset = () => {
        if (confirm('Bist du sicher? Alle Daten (Spieler & Matches) werden unwiderruflich gelöscht!')) {
            onResetData();
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                    <div className="flex justify-center mb-6">
                        <div className="p-3 bg-red-100 rounded-full">
                            <Shield className="w-8 h-8 text-red-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Login</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors"
                        >
                            Einloggen
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
                <p className="text-gray-500">Verwalte Spieler, Einstellungen und Daten.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Settings Card */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">System Einstellungen</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Elo K-Faktor
                            </label>
                            <p className="text-xs text-gray-500 mb-2">
                                Bestimmt wie stark sich das Rating nach einem Spiel ändert. Standard ist 32.
                            </p>
                            <div className="flex gap-4">
                                <input
                                    type="number"
                                    value={tempKFactor}
                                    onChange={(e) => setTempKFactor(Number(e.target.value))}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <button
                                    onClick={handleSaveSettings}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                                >
                                    <Save className="w-4 h-4" /> Speichern
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* User Management Card */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <UserPlus className="w-5 h-5 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Spieler hinzufügen</h2>
                    </div>

                    <form onSubmit={handleNewPlayerSubmit} className="flex gap-4">
                        <input
                            type="text"
                            value={newPlayerName}
                            onChange={(e) => setNewPlayerName(e.target.value)}
                            placeholder="Spielername"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                        >
                            <UserPlus className="w-4 h-4" /> Hinzufügen
                        </button>
                    </form>
                </section>

                {/* Danger Zone */}
                <section className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-red-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <AlertTriangle className="w-32 h-32 text-red-500" />
                    </div>

                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-red-800">Danger Zone</h2>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                            <div>
                                <h3 className="font-semibold text-red-900">Daten zurücksetzen</h3>
                                <p className="text-sm text-red-700">Löscht alle Spieler, Matches und Historie unwiderruflich.</p>
                            </div>
                            <button
                                onClick={confirmReset}
                                className="px-4 py-2 bg-white border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 flex items-center gap-2 transition-colors font-semibold"
                            >
                                <RefreshCw className="w-4 h-4" /> Reset All
                            </button>
                        </div>
                    </div>
                </section>

                {/* Player List */}
                <section className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <UserPlus className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Spieler verwalten ({players.length})</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {players.map(player => (
                            <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group hover:border-blue-200 transition-colors">
                                <span className="font-medium text-gray-700">{player.name}</span>
                                <button
                                    onClick={() => {
                                        if (confirm(`Spieler "${player.name}" löschen?`)) onDeletePlayer(player.id);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                    title="Spieler löschen"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
