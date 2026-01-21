import { Rank } from "../types";

export const DEFAULT_RANKS: Rank[] = [
    { id: '1', name: 'Employed', min_elo: 0, color: 'gray', order: 0 },
    { id: '2', name: 'Junior Unemployed', min_elo: 1200, color: 'blue', order: 1 },
    { id: '3', name: 'Senior Unemployed', min_elo: 1400, color: 'green', order: 2 },
    { id: '4', name: 'Unemployed Grandmaster', min_elo: 1600, color: 'purple', order: 3 },
    { id: '5', name: 'Chief of Unemployment', min_elo: 1800, color: 'gold', order: 4 },
];

export function getRank(elo: number, ranks: Rank[] = DEFAULT_RANKS): Rank {
    // Sort by order/min_elo ascending just in case
    const sorted = [...ranks].sort((a, b) => a.min_elo - b.min_elo);
    // Reverse to find first matching from top
    const candidates = [...sorted].reverse();
    const rank = candidates.find(r => elo >= r.min_elo);
    return rank || sorted[0];
}

export function getRankBadgeClasses(rank: Rank): string {
    const color = rank.color.toLowerCase();

    const map: Record<string, string> = {
        'gray': 'bg-gray-100 text-gray-700 border-gray-200',
        'blue': 'bg-blue-100 text-blue-700 border-blue-200',
        'green': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'purple': 'bg-purple-100 text-purple-700 border-purple-200',
        'gold': 'bg-amber-100 text-amber-700 border-amber-200',
        'red': 'bg-red-100 text-red-700 border-red-200',
        'indigo': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        'pink': 'bg-pink-100 text-pink-700 border-pink-200',
    };

    return map[color] || 'bg-gray-100 text-gray-800 border-gray-200';
}
