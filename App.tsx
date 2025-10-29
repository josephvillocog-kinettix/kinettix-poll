import React, { useState } from 'react';
import Header from './components/Header';
import VotingPage from './components/VotingPage';
import DashboardPage from './components/DashboardPage';
import LoginPage from './components/LoginPage';
import AdminPage from './components/AdminPage';
import UserListPage from './components/UserListPage';
import { AppView, User } from './types';
import * as authService from './services/authService';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  const [currentView, setCurrentView] = useState<AppView>('voting');

  const handleLogin = async (username: string) => {
    const user = await authService.login(username);
    setCurrentUser(user);
    if (user.username === 'saitama') {
      setCurrentView('dashboard'); // Default admin to the dashboard page
    } else {
      setCurrentView('voting');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header 
        currentUser={currentUser} 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        onLogout={handleLogout} 
      />
      <main>
        {currentView === 'voting' && <VotingPage currentUser={currentUser} />}
        {currentView === 'dashboard' && currentUser.username === 'saitama' && <DashboardPage />}
        {currentView === 'admin' && currentUser.username === 'saitama' && <AdminPage />}
        {currentView === 'users' && currentUser.username === 'saitama' && <UserListPage />}
      </main>
    </div>
  );
}

export default App;