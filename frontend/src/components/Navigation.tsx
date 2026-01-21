import { Trophy, Users, History, Plus, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Trophy },
    { id: 'leaderboard', label: 'Leaderboard', icon: Users },
    { id: 'history', label: 'Match History', icon: History },
    { id: 'add-match', label: 'New Match', icon: Plus },
    { id: 'admin', label: 'Admin', icon: Settings },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center space-x-2 cursor-pointer shrink-0"
            onClick={() => onViewChange('dashboard')}
          >
            <Trophy className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-none">Tögelle Tracker</span>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="flex space-x-0.5 sm:space-x-1 overflow-x-auto no-scrollbar py-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all shrink-0 ${isActive
                      ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden md:inline font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
