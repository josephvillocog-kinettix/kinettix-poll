import React, { useState, useEffect, useMemo } from 'react';
import { Poll, User } from '../types';
import * as authService from '../services/authService';
import * as votingService from '../services/votingService';
import UserCard from './UserCard';

const UserListPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyNonVoters, setShowOnlyNonVoters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [userList, pollList] = await Promise.all([
          authService.getUsers(),
          votingService.getAllPolls(),
        ]);
        setUsers(userList);
        setPolls(pollList);
      } catch (err) {
        setError('Failed to load user and poll data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredUsers = useMemo(() => {
    let results = users;

    // Filter by search query
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      results = results.filter(user =>
        user.name.toLowerCase().includes(lowercasedQuery) ||
        user.department.toLowerCase().includes(lowercasedQuery)
      );
    }

    // Filter by voting status
    if (showOnlyNonVoters) {
      const openPolls = polls.filter(p => p.status === 'open');
      if (openPolls.length > 0) {
        results = results.filter(user => {
          const hasVotedInAllOpenPolls = openPolls.every(poll =>
            votingService.hasVotedInPoll(poll, user)
          );
          return !hasVotedInAllOpenPolls;
        });
      }
    }

    return results;
  }, [users, polls, searchQuery, showOnlyNonVoters]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 text-center mt-10">{error}</p>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">User Directory</h2>
        <p className="mt-4 text-lg text-gray-300">Browse all registered users in the system.</p>
      </div>

      <div className="mb-8 max-w-lg mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            name="search"
            id="search"
            className="w-full pl-10 pr-4 py-3 text-white bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 ease-in-out"
            placeholder="Search by name or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="mt-4 flex justify-center">
            <label className="flex items-center space-x-3 cursor-pointer text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                <input 
                    type="checkbox" 
                    checked={showOnlyNonVoters} 
                    onChange={(e) => setShowOnlyNonVoters(e.target.checked)} 
                    className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-600"
                />
                <span>Show users who have not yet voted</span>
            </label>
        </div>
      </div>
      
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredUsers.map((user, index) => (
            <UserCard key={user.username} user={user} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No users found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default UserListPage;