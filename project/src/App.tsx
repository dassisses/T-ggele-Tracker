import { useEffect, useMemo, useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import MatchHistory from './components/MatchHistory';
import AddMatch from './components/AddMatch';
import PlayerProfile from './components/PlayerProfile';
import playersSeed from '../data/players.json';
import matchesSeed from '../data/matches.json';
import { calculateEloChange } from './lib/elo';
import { Match, MatchType, NewMatchPayload, Player } from './types';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>(playersSeed as Player[]);
  const [matches, setMatches] = useState<Match[]>(matchesSeed as Match[]);

  // Load from localStorage on first render
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedPlayers = localStorage.getItem('toge-tracker-players');
      const storedMatches = localStorage.getItem('toge-tracker-matches');
      if (storedPlayers) setPlayers(JSON.parse(storedPlayers));
      if (storedMatches) setMatches(JSON.parse(storedMatches));
    } catch (e) {
      console.warn('Konnte gespeicherte Daten nicht laden.', e);
    }
  }, []);

  // Persist to localStorage when state changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('toge-tracker-players', JSON.stringify(players));
    localStorage.setItem('toge-tracker-matches', JSON.stringify(matches));
  }, [players, matches]);

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
    const { matchType, team1Ids, team2Ids, score1, score2 } = payload;

    const sizeCheck: Record<MatchType, [number, number]> = {
      '1v1': [1, 1],
      '2v2': [2, 2],
      '2v1': [2, 1],
    };
    const [req1, req2] = sizeCheck[matchType];

    if (team1Ids.length !== req1 || team2Ids.length !== req2) {
      return { ok: false, error: 'Bitte alle Spielerplätze füllen.' };
    }

    const allIds = [...team1Ids, ...team2Ids];
    if (new Set(allIds).size !== allIds.length) {
      return { ok: false, error: 'Jeder Spieler darf nur einmal im Match stehen.' };
    }

    if (score1 === score2) {
      return { ok: false, error: 'Unentschieden sind nicht erlaubt.' };
    }

    const missing = allIds.filter((id) => !playersById[id]);
    if (missing.length > 0) {
      return { ok: false, error: 'Spieler nicht gefunden.' };
    }

    const winnerIds = score1 > score2 ? team1Ids : team2Ids;
    const loserIds = score1 > score2 ? team2Ids : team1Ids;

    const averageElo = (ids: string[]) =>
      ids.reduce((sum, id) => sum + playersById[id].elo_rating, 0) / ids.length;

    const winnerAvg = averageElo(winnerIds);
    const loserAvg = averageElo(loserIds);
    const baseEloChange = calculateEloChange(winnerAvg, loserAvg);
    const now = new Date().toISOString();

    const singleTeamId = team1Ids.length === 1 ? team1Ids[0] : team2Ids.length === 1 ? team2Ids[0] : null;
    const pairIds = team1Ids.length === 2 ? team1Ids : team2Ids.length === 2 ? team2Ids : [];
    const singleWins = singleTeamId ? winnerIds.includes(singleTeamId) : false;

    function multiplierForPlayer(id: string, isWinner: boolean) {
      if (matchType !== '2v1') return 1;
      const isSingle = singleTeamId === id;
      const isPairMember = pairIds.includes(id);
      if (!isSingle && !isPairMember) return 1;

      if (singleWins) {
        if (isSingle && isWinner) return 2;
        if (isPairMember && !isWinner) return 2;
      } else {
        // Pair wins, single loses half; pair gains half
        if (isPairMember && isWinner) return 0.5;
        if (isSingle && !isWinner) return 0.5;
      }
      return 1;
    }

    const updatedPlayers = players.map((p) => {
      const isTeam1 = team1Ids.includes(p.id);
      const isTeam2 = team2Ids.includes(p.id);
      if (!isTeam1 && !isTeam2) return p;

      const isWinner = winnerIds.includes(p.id);
      const goalsScored = isTeam1 ? score1 : score2;
      const goalsConceded = isTeam1 ? score2 : score1;
      const streak = isWinner ? (p.current_streak >= 0 ? p.current_streak + 1 : 1) : (p.current_streak <= 0 ? p.current_streak - 1 : -1);
      const mult = multiplierForPlayer(p.id, isWinner);
      const delta = (isWinner ? 1 : -1) * baseEloChange * mult;
      const newRating = Math.max(0, p.elo_rating + delta);

      return {
        ...p,
        elo_rating: newRating,
        matches_played: p.matches_played + 1,
        matches_won: p.matches_won + (isWinner ? 1 : 0),
        matches_lost: p.matches_lost + (!isWinner ? 1 : 0),
        goals_scored: p.goals_scored + goalsScored,
        goals_conceded: p.goals_conceded + goalsConceded,
        current_streak: streak,
        best_streak: isWinner ? Math.max(p.best_streak, streak) : p.best_streak,
        updated_at: now,
      };
    });

    const newMatch: Match = {
      id: crypto.randomUUID(),
      match_type: matchType,
      team1_ids: team1Ids,
      team2_ids: team2Ids,
      score1,
      score2,
      winner_ids: winnerIds,
      elo_change: baseEloChange,
      played_at: now,
      created_at: now,
    };

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
