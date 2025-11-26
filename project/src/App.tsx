import { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import MatchHistory from './components/MatchHistory';
import AddMatch from './components/AddMatch';
import PlayerProfile from './components/PlayerProfile';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  function handlePlayerClick(playerId: string) {
    setSelectedPlayerId(playerId);
    setCurrentView('player-profile');
  }

  function handleBackToLeaderboard() {
    setSelectedPlayerId(null);
    setCurrentView('leaderboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && <Dashboard onPlayerClick={handlePlayerClick} />}
        {currentView === 'leaderboard' && <Leaderboard onPlayerClick={handlePlayerClick} />}
        {currentView === 'history' && <MatchHistory />}
        {currentView === 'add-match' && <AddMatch />}
        {currentView === 'player-profile' && selectedPlayerId && (
          <PlayerProfile playerId={selectedPlayerId} onBack={handleBackToLeaderboard} />
        )}
      </main>
    </div>
  );
}

export default App;
