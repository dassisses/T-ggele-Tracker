import { useMemo, useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import MatchHistory from './components/MatchHistory';
import AddMatch from './components/AddMatch';
import PlayerProfile from './components/PlayerProfile';
import playersSeed from '../data/players.json';
import matchesSeed from '../data/matches.json';
import { calculateEloChange } from './lib/elo';
import { Match, NewMatchPayload, Player } from './types';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>(playersSeed as Player[]);
  const [matches, setMatches] = useState<Match[]>(matchesSeed as Match[]);

  const playersById = useMemo(() => {
    const map: Record<string, Player> = {};
    players.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [players]);

  function handlePlayerClick(playerId: string) {
    setSelectedPlayerId(playerId);
    setCurrentView('player-profile');
  }

  function handleBackToLeaderboard() {
    setSelectedPlayerId(null);
    setCurrentView('leaderboard');
  }

  function handleAddPlayer(name: string) {
    const now = new Date().toISOString();
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name,
      avatar_url: '',
      elo_rating: 1500,
      matches_played: 0,
      matches_won: 0,
      matches_lost: 0,
      goals_scored: 0,
      goals_conceded: 0,
      current_streak: 0,
      best_streak: 0,
      created_at: now,
      updated_at: now,
    };
    setPlayers((prev) => [...prev, newPlayer]);
  }

  function handleAddMatch(payload: NewMatchPayload): { ok: boolean; error?: string } {
    const { player1Id, player2Id, score1, score2 } = payload;

    if (player1Id === player2Id) {
      return { ok: false, error: 'Spieler müssen unterschiedlich sein.' };
    }

    const player1 = playersById[player1Id];
    const player2 = playersById[player2Id];

    if (!player1 || !player2) {
      return { ok: false, error: 'Spieler nicht gefunden.' };
    }

    if (score1 === score2) {
      return { ok: false, error: 'Unentschieden sind nicht erlaubt.' };
    }

    const winnerId = score1 > score2 ? player1Id : player2Id;
    const loserId = score1 > score2 ? player2Id : player1Id;
    const winnerRating = score1 > score2 ? player1.elo_rating : player2.elo_rating;
    const loserRating = score1 > score2 ? player2.elo_rating : player1.elo_rating;
    const eloChange = calculateEloChange(winnerRating, loserRating);
    const now = new Date().toISOString();

    const newMatch: Match = {
      id: crypto.randomUUID(),
      match_type: 'singles',
      player1_id: player1Id,
      player2_id: player2Id,
      score1,
      score2,
      winner_id: winnerId,
      elo_change: eloChange,
      played_at: now,
      created_at: now,
    };

    const updatedPlayers = players.map((p) => {
      if (p.id === winnerId) {
        const winnerStreak = p.current_streak >= 0 ? p.current_streak + 1 : 1;
        return {
          ...p,
          elo_rating: winnerRating + eloChange,
          matches_played: p.matches_played + 1,
          matches_won: p.matches_won + 1,
          goals_scored: p.goals_scored + (winnerId === player1Id ? score1 : score2),
          goals_conceded: p.goals_conceded + (winnerId === player1Id ? score2 : score1),
          current_streak: winnerStreak,
          best_streak: Math.max(p.best_streak, winnerStreak),
          updated_at: now,
        };
      }
      if (p.id === loserId) {
        const loserStreak = p.current_streak <= 0 ? p.current_streak - 1 : -1;
        return {
          ...p,
          elo_rating: Math.max(0, loserRating - eloChange),
          matches_played: p.matches_played + 1,
          matches_lost: p.matches_lost + 1,
          goals_scored: p.goals_scored + (loserId === player1Id ? score1 : score2),
          goals_conceded: p.goals_conceded + (loserId === player1Id ? score2 : score1),
          current_streak: loserStreak,
          updated_at: now,
        };
      }
      return p;
    });

    setPlayers(updatedPlayers);
    setMatches((prev) => [newMatch, ...prev]);

    return { ok: true };
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <Dashboard
            players={players}
            matches={matches}
            onPlayerClick={handlePlayerClick}
          />
        )}
        {currentView === 'leaderboard' && (
          <Leaderboard players={players} onPlayerClick={handlePlayerClick} />
        )}
        {currentView === 'history' && (
          <MatchHistory players={players} matches={matches} />
        )}
        {currentView === 'add-match' && (
          <AddMatch
            players={players}
            onAddPlayer={handleAddPlayer}
            onAddMatch={handleAddMatch}
          />
        )}
        {currentView === 'player-profile' && selectedPlayerId && (
          <PlayerProfile
            playerId={selectedPlayerId}
            players={players}
            matches={matches}
            onBack={handleBackToLeaderboard}
          />
        )}
      </main>
    </div>
  );
}

export default App;
