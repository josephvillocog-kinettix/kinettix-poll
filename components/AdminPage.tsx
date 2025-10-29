

import React, { useState, useEffect } from 'react';
import { getAllPolls } from '../services/votingService';
import { Poll } from '../types';
import UserManagementPage from './UserManagementPage';

const PollsOverview: React.FC = () => {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        const allPollsData = await getAllPolls();
        setPolls([...allPollsData].reverse()); // Show newest first
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) {
        return <div className="text-center text-gray-400 p-8">Loading polls...</div>
    }

    if (polls.length === 0) {
        return <div className="text-center text-gray-400 p-8">No polls have been created yet.</div>
    }

    return (
        <div className="space-y-4">
            {polls.map(poll => (
                <div key={poll.id} className="bg-gray-900/50 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4 border border-gray-700">
                    <div className="flex-grow">
                        <h3 className="text-lg font-bold text-white">{poll.title}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                            <p className="text-sm text-gray-400">{poll.candidates.length} candidates</p>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${poll.status === 'open' ? 'bg-green-900/70 text-green-300' : 'bg-red-900/70 text-red-300'}`}>
                                {poll.status}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};


const AdminPage: React.FC = () => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-900/20 z-0"></div>

      <div className="relative max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 z-10 space-y-16">
        <div>
            <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl tracking-tight">Polls Overview</h2>
            <p className="mt-4 text-xl text-gray-400">A read-only view of all poll data.</p>
            </div>

            <div className="bg-gray-800/50 p-8 rounded-2xl shadow-2xl backdrop-blur-xl border border-indigo-500/20 shadow-[0_0_35px_rgba(99,102,241,0.1)] min-h-[300px]">
                <PollsOverview />
            </div>
        </div>
        
        <UserManagementPage />

      </div>
    </div>
  );
};

export default AdminPage;