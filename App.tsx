import React, { useState } from 'react';
import Header from './components/Header';
import VotingPage from './components/VotingPage';
import DashboardPage from './components/DashboardPage';
import LoginPage from './components/LoginPage';
import AdminPage from './components/AdminPage'; // Import the new AdminPage
import UserManagementPage from './components/UserManagementPage';
import { AppView } from './types';
import * as authService from './services/authService';

function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(authService.getCurrentUser());
  const [currentView, setCurrentView] = useState<AppView>('voting');

  const handleLogin = (username: string) => {
    authService.login(username);
    setCurrentUser(username);
    if (username === 'saitama') {
      setCurrentView('admin'); // Default admin to the admin page
    } else {
      setCurrentView('voting');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const handlePollCreated = () => {
    // When a poll is created, switch the admin's view to the dashboard
    setCurrentView('dashboard');
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
        {currentView === 'dashboard' && currentUser === 'saitama' && <DashboardPage />}
        {currentView === 'admin' && currentUser === 'saitama' && <AdminPage onPollCreated={handlePollCreated} />}
        {currentView === 'user-management' && currentUser === 'saitama' && <UserManagementPage />}
      </main>
    </div>
  );
}

export default App;