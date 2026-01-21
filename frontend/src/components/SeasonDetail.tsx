import React, { useEffect, useState } from 'react';
import { Player, Match, Rank } from '../types';
import { api } from '../lib/api';
import { Trophy, History, ArrowLeft, Users, Calendar, Award } from 'lucide-react';
import { getRank, getRankBadgeClasses } from '../utils/ranks';

interface SeasonDetailProps {
    seasonId: string;
    seasonName: string;
    ranks: Rank[];
    onBack: () => void;
    onPlayerClick: (playerId: string) => void;
}

export default function SeasonDetail({ seasonId, seasonName, ranks, onBack, onPlayerClick }: SeasonDetailProps) {
    const [players, setPlayers] = useState<Player[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadSeasonData() {
            try {
                const [p, m] = await Promise.all([
                    api.getSeasonPlayers(seasonId),
                    api.getSeasonMatches(seasonId)
                ]);
                setPlayers(p);
                setMatches(m);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        loadSeasonData();
    }, [seasonId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:text-white"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Zurück zum Dashboard</span>
                </button>
                <div className="text-right">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{seasonName}</h1>
                    <p className="text-gray-500 mt-1 flex items-center justify-end gap-1">
                        <History className="w-4 h-4" /> Archiviertes Ranking
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-500" /> Endgültige Tabelle
                            </h2>
                            <span className="text-sm text-gray-500">{players.length} Spieler</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rang</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Spieler</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Elo</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">W/L</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tore</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {players.sort((a, b) => b.elo_rating - a.elo_rating).map((player, idx) => {
                                        const rank = getRank(player.elo_rating, ranks);
                                        return (
                                            <tr
                                                key={player.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                                                onClick={() => onPlayerClick(player.id)}
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div>
                                                            <div className="font-bold text-gray-900 dark:text-white">{player.name}</div>
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${getRankBadgeClasses(rank)}`}>
                                                                {rank.name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{Math.round(player.elo_rating)}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                        {player.matches_won}-{player.matches_lost}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {player.goals_scored}:{player.goals_conceded}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-emerald-500" /> Saison Highlights
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                <span className="text-sm text-emerald-800 dark:text-emerald-200 font-medium">Gesamt Matches</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{matches.length}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <span className="text-sm text-amber-800 dark:text-amber-200 font-medium">Ziele Gesamt</span>
                                <span className="font-bold text-amber-600 dark:text-amber-400">
                                    {matches.reduce((acc, m) => acc + m.score1 + m.score2, 0)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <History className="w-5 h-5 text-blue-500" /> Letzte Spiele
                        </h2>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {matches.slice(0, 5).map(match => (
                                <div key={match.id} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700 border-l-4 border-l-emerald-500">
                                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        <span>{match.match_type}</span>
                                        <span>{new Date(match.played_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-900 dark:text-white uppercase truncate max-w-[80px]">Team 1</span>
                                        <span className="font-mono font-bold text-lg dark:text-white px-2 py-0.5 bg-white dark:bg-gray-800 rounded">
                                            {match.score1}:{match.score2}
                                        </span>
                                        <span className="font-bold text-gray-900 dark:text-white uppercase truncate max-w-[80px]">Team 2</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
