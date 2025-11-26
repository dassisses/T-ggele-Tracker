import { Trophy, Users, History, Plus } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Trophy },
    { id: 'leaderboard', label: 'Leaderboard', icon: Users },
    { id: 'history', label: 'Match History', icon: History },
    { id: 'add-match', label: 'New Match', icon: Plus },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Trophy className="w-8 h-8 text-emerald-600" />
            <span className="text-2xl font-bold text-gray-900">Tögele Tracker</span>
          </div>
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
