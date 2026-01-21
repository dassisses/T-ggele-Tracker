import { useEffect, useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import MatchHistory from './components/MatchHistory';
import AddMatch from './components/AddMatch';
import PlayerProfile from './components/PlayerProfile';
import { Match, NewMatchPayload, Player, GameSettings } from './types';
import Admin from './components/Admin';
import { api } from './lib/api';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [settings, setSettings] = useState<GameSettings>({ kFactor: 32 });

  const loadData = async () => {
    try {
      const [p, m, s] = await Promise.all([
        api.getPlayers(),
        api.getMatches(),
        api.getSettings()
      ]);
      setPlayers(p);
      setMatches(m);
      setSettings(s);
    } catch (e) {
      console.error("Failed to load data", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  function handlePlayerClick(playerId: string) {
    setSelectedPlayerId(playerId);
    setCurrentView('player-profile');
  }

  function handleBackToLeaderboard() {
    setSelectedPlayerId(null);
    setCurrentView('leaderboard');
  }

  async function handleAddPlayer(name: string) {
    try {
      await api.createPlayer(name);
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Fehler beim Erstellen des Spielers');
    }
  }

  async function handleDeletePlayer(id: string) {
    try {
      await api.deletePlayer(id);
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Fehler beim Löschen');
    }
  }

  function handleResetData() {
    alert('Reset ist im Server-Modus deaktiviert.');
  }

  async function handleUpdateSettings(newSettings: GameSettings) {
    try {
      await api.updateSettings(newSettings);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAddMatch(payload: NewMatchPayload): Promise<{ ok: boolean; error?: string }> {
    try {
      await api.createMatch(payload);
      await loadData();
      return { ok: true };
    } catch (e: any) {
      console.error(e);
      return { ok: false, error: e.message || 'Fehler beim Speichern des Matches' };
    }
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
        {currentView === 'admin' && (
          <Admin
            players={players}
            settings={settings}
            onAddPlayer={handleAddPlayer}
            onDeletePlayer={handleDeletePlayer}
            onResetData={handleResetData}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </main>
    </div>
  );
}

export default App;
