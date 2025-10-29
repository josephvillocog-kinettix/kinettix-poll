import React, { useState, useEffect } from 'react';
import * as authService from '../services/authService';

const UserManagementPage: React.FC = () => {
  // Fix: Initialize userList to an empty string and fetch users asynchronously in useEffect.
  const [userList, setUserList] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
        try {
            const users = await authService.getUsers();
            // Fix: Map User objects to usernames before joining into a string.
            setUserList(users.map(u => u.username).join(', '));
        } catch (e) {
            setError('Failed to load user list.');
        }
    };
    loadUsers();
  }, []);

  // Fix: Made handleSave async to correctly handle promises when updating and refetching users.
  const handleSave = async () => {
    setError(null);
    setSaveStatus('saving');

    const users = userList
      .split(',')
      .map(user => user.trim())
      .filter(user => user.length > 0);
    
    if (users.length === 0) {
        setError('User list cannot be empty.');
        setSaveStatus('idle');
        return;
    }

    try {
        // FIX: Await the async updateUsers call to ensure it completes before fetching the updated list.
        await authService.updateUsers(users);
        // Refresh the text area to show the cleaned and sorted list (with admin added)
        // Fix: Await the async getUsers() call.
        const updatedUsers = await authService.getUsers();
        // Fix: Map User objects to usernames before joining into a string.
        setUserList(updatedUsers.map(u => u.username).join(', '));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
        setError('Failed to save users.');
        setSaveStatus('idle');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">User Management</h2>
        <p className="mt-4 text-lg text-gray-300">Manage the list of users who can log in and vote.</p>
      </div>

      <div className="bg-gray-800/50 p-8 rounded-xl shadow-2xl backdrop-blur-md">
        <div className="space-y-6">
          <div>
            <label htmlFor="user-list" className="block text-sm font-medium text-gray-200 mb-2">
              Comma-Separated Usernames
            </label>
            <textarea
              id="user-list"
              rows={6}
              value={userList}
              onChange={(e) => setUserList(e.target.value)}
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., user1, user2, user3"
            />
            <p className="mt-2 text-sm text-gray-400">
              Enter usernames separated by commas. The 'saitama' user will always be included.
            </p>
          </div>
          
          {error && <p className="text-red-400 text-center">{error}</p>}

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 text-lg flex items-center justify-center"
            >
              {saveStatus === 'saving' && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {saveStatus === 'saved' ? 'Saved!' : 'Save User List'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;