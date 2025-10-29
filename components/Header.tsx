import React from 'react';
import { AppView, User } from '../types';

interface HeaderProps {
  currentUser: User;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, currentView, setCurrentView, onLogout }) => {
  const navItemClasses = (view: AppView) => 
    `px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 ${
      currentView === view
        ? 'bg-indigo-600 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-20 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Kinettix<span className="text-red-400">Poll</span>
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentView('voting')}
                className={navItemClasses('voting')}
              >
                Polls
              </button>
              {currentUser.username === 'saitama' && (
                <>
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={navItemClasses('dashboard')}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentView('admin')}
                    className={navItemClasses('admin')}
                  >
                    Admin
                  </button>
                   <button
                    onClick={() => setCurrentView('users')}
                    className={navItemClasses('users')}
                  >
                    Users
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
                <span className="block text-gray-300 text-sm font-medium text-white">{currentUser.name}</span>
                <span className="block text-xs text-gray-400">{currentUser.department}</span>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;