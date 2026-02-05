import { useEffect, useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import MatchHistory from './components/MatchHistory';
import AddMatch from './components/AddMatch';
import PlayerProfile from './components/PlayerProfile';
import SeasonDetail from './components/SeasonDetail';
import { Match, NewMatchPayload, Player, GameSettings, Rank } from './types';
import Admin from './components/Admin';
import { api } from './lib/api';
import { DEFAULT_RANKS } from './utils/ranks';
import { ThemeProvider } from './context/ThemeContext';

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<{ id: string, name: string } | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [ranks, setRanks] = useState<Rank[]>(DEFAULT_RANKS);
  const [settings, setSettings] = useState<GameSettings>({ kFactor: 32 });

  const loadData = async () => {
    try {
      const [p, m, s, r] = await Promise.all([
        api.getPlayers(),
        api.getMatches(),
        api.getSettings(),
        api.getRanks()
      ]);
      setPlayers(p);
      setMatches(m);
      setSettings(s);
      if (r && r.length > 0) setRanks(r);
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

  function handleViewSeason(id: string, name: string) {
    setSelectedSeason({ id, name });
    setCurrentView('season-detail');
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

  const handleRefresh = async () => {
    await loadData();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
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
          <Leaderboard players={players} onPlayerClick={handlePlayerClick} ranks={ranks} />
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
        {currentView === 'season-detail' && selectedSeason && (
          <SeasonDetail
            seasonId={selectedSeason.id}
            seasonName={selectedSeason.name}
            ranks={ranks}
            onBack={() => setCurrentView('admin')}
            onPlayerClick={handlePlayerClick}
          />
        )}
        {currentView === 'admin' && (
          <Admin
            players={players}
            settings={settings}
            ranks={ranks}
            onAddPlayer={handleAddPlayer}
            onDeletePlayer={handleDeletePlayer}
            onResetData={() => { }}
            onUpdateSettings={handleUpdateSettings}
            onRefresh={handleRefresh}
            onViewSeason={handleViewSeason}
          />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
