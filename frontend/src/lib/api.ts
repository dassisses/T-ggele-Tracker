import { Player, Match, NewMatchPayload, GameSettings } from '../types';

const API_Base = '/api';

export const api = {
    getPlayers: async (): Promise<Player[]> => {
        const res = await fetch(`${API_Base}/players`);
        if (!res.ok) throw new Error('Failed to fetch players');
        return res.json();
    },
    createPlayer: async (name: string): Promise<Player> => {
        const res = await fetch(`${API_Base}/players`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        if (!res.ok) throw new Error('Failed to create player');
        return res.json();
    },
    deletePlayer: async (id: string): Promise<void> => {
        const res = await fetch(`${API_Base}/players/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete player');
    },
    getMatches: async (): Promise<Match[]> => {
        const res = await fetch(`${API_Base}/matches`);
        if (!res.ok) throw new Error('Failed to fetch matches');
        return res.json();
    },
    createMatch: async (payload: NewMatchPayload): Promise<void> => {
        const res = await fetch(`${API_Base}/matches`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Failed to create match');
        }
    },
    getSettings: async (): Promise<GameSettings> => {
        const res = await fetch(`${API_Base}/settings`);
        if (!res.ok) return { kFactor: 32 };
        return res.json();
    },
    updateSettings: async (settings: GameSettings): Promise<void> => {
        const res = await fetch(`${API_Base}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        if (!res.ok) throw new Error('Failed to update settings');
    }
};
