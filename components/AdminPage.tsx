
import React, { useState, useEffect } from 'react';
import { createPoll, getAllPolls, togglePollStatus, deletePoll, deleteAllPolls } from '../services/votingService';
import { Poll } from '../types';

interface AdminPageProps {
  onPollCreated: () => void;
}

const CreatePollForm: React.FC<{ onPollCreated: () => void }> = ({ onPollCreated }) => {
    const [pollTitle, setPollTitle] = useState('');
    const [candidatesString, setCandidatesString] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmedTitle = pollTitle.trim();
        if (!trimmedTitle) {
          setError('Poll title cannot be empty.');
          return;
        }

        const finalCandidates = candidatesString
          .split(',')
          .map(name => name.trim())
          .filter(name => name.length > 0);
          
        if (finalCandidates.length < 2) {
          setError('You must provide at least two valid candidate names.');
          return;
        }

        setIsSubmitting(true);
        try {
          await createPoll(trimmedTitle, finalCandidates);
          onPollCreated();
        } catch (err) {
          setError('Failed to create poll. Please try again.');
        } finally {
          setIsSubmitting(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="poll-title" className="block text-sm font-medium text-gray-300 mb-2 tracking-wider">
                Poll Title / Question
              </label>
              <input
                type="text"
                id="poll-title"
                value={pollTitle}
                onChange={(e) => setPollTitle(e.target.value)}
                className="w-full px-4 py-3 text-white bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 ease-in-out"
                placeholder="e.g., Who should be the team mascot?"
                required
              />
            </div>

            <div>
              <label htmlFor="candidates-list" className="block text-sm font-medium text-gray-300 mb-2 tracking-wider">
                Candidates (Comma-Separated)
              </label>
              <textarea
                  id="candidates-list"
                  rows={4}
                  value={candidatesString}
                  onChange={(e) => setCandidatesString(e.target.value)}
                  className="w-full px-4 py-3 text-white bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 ease-in-out"
                  placeholder="e.g., Captain Comet, Star Blazer, Galactic Guardian"
                  required
              />
              <p className="mt-2 text-sm text-gray-500">
                  Enter candidate names separated by commas.
              </p>
            </div>

            {error && <p className="text-red-400 text-center">{error}</p>}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold py-4 px-4 rounded-lg shadow-lg hover:shadow-indigo-500/30 disabled:bg-gray-500 disabled:shadow-none disabled:cursor-not-allowed transform hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center"
              >
                {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Poll...
                </>
              ) : 'Launch Poll'}
              </button>
            </div>
          </form>
    )
};


const ManagePolls: React.FC<{}> = () => {
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

    const handleToggleStatus = async (pollId: string) => {
        await togglePollStatus(pollId);
        fetchData();
    };

    const handleDeletePoll = async (pollId: string, pollTitle: string) => {
        if (window.confirm(`Are you sure you want to delete the poll "${pollTitle}"? This action is permanent.`)) {
            await deletePoll(pollId);
            fetchData();
        }
    };

    if (isLoading) {
        return <div className="text-center text-gray-400 p-8">Loading polls...</div>
    }

    if (polls.length === 0) {
        return <div className="text-center text-gray-400 p-8">No polls have been created yet. Go to the 'Create New' tab to get started.</div>
    }

    return (
        <div className="space-y-4">
            {polls.map(poll => (
                <div key={poll.id} className="bg-gray-900/50 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4 border border-gray-700 transition-all hover:border-indigo-500/50">
                    <div className="flex-grow">
                        <h3 className="text-lg font-bold text-white">{poll.title}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                            <p className="text-sm text-gray-400">{poll.candidates.length} candidates</p>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${poll.status === 'open' ? 'bg-green-900/70 text-green-300' : 'bg-red-900/70 text-red-300'}`}>
                                {poll.status}
                            </span>
                        </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center space-x-2">
                        <button
                            onClick={() => handleToggleStatus(poll.id)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${poll.status === 'open' ? 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500' : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'}`}
                        >
                            {poll.status === 'open' ? 'Close Poll' : 'Reopen Poll'}
                        </button>
                        <button
                            onClick={() => handleDeletePoll(poll.id, poll.title)}
                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-800 hover:bg-red-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const SettingsTab: React.FC = () => {
    const [isResetting, setIsResetting] = useState(false);
    
    const handleResetApp = async () => {
        if (window.confirm('DANGER: Are you sure you want to reset the entire application? All polls and results will be permanently deleted. This action cannot be undone.')) {
            setIsResetting(true);
            await deleteAllPolls();
            // Force a reload to clear all state and go back to the beginning
            window.location.reload();
        }
    };

    return (
        <div className="space-y-8">
            <div className="p-6 rounded-lg border-2 border-dashed border-red-500/50 bg-red-900/10">
                <h3 className="text-xl font-bold text-red-400">Danger Zone</h3>
                <p className="mt-2 text-gray-400">
                    This action is destructive and cannot be undone. It will delete all polls and results.
                </p>
                <div className="mt-6">
                     <button
                        onClick={handleResetApp}
                        disabled={isResetting}
                        className="w-full sm:w-auto bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-red-700 disabled:bg-red-900/50 disabled:cursor-not-allowed transition-all duration-300 text-base flex items-center justify-center"
                    >
                        {isResetting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Resetting...
                            </>
                        ) : 'Reset Application'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminPage: React.FC<AdminPageProps> = ({ onPollCreated }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'settings'>('create');

  useEffect(() => {
    // If polls exist, default to manage tab
    const checkPolls = async () => {
      const polls = await getAllPolls();
      if (polls.length > 0) {
        setActiveTab('manage');
      }
    };
    checkPolls();
  }, []);

  const tabButtonClasses = (tabName: 'create' | 'manage' | 'settings') =>
    `px-6 py-3 text-lg font-medium rounded-t-lg transition-colors duration-200 focus:outline-none border-b-4 ${
      activeTab === tabName
        ? 'border-indigo-500 text-white'
        : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
    }`;


  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-900/20 z-0"></div>

      <div className="relative max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl tracking-tight">Poll Administration</h2>
          <p className="mt-4 text-xl text-gray-400">Create and manage your polls.</p>
        </div>

        <div className="w-full">
            <div className="flex justify-center border-b border-gray-700 mb-8">
                <button onClick={() => setActiveTab('manage')} className={tabButtonClasses('manage')}>Manage Polls</button>
                <button onClick={() => setActiveTab('create')} className={tabButtonClasses('create')}>Create New</button>
                <button onClick={() => setActiveTab('settings')} className={tabButtonClasses('settings')}>Settings</button>
            </div>
        </div>

        <div className="bg-gray-800/50 p-8 rounded-2xl shadow-2xl backdrop-blur-xl border border-indigo-500/20 shadow-[0_0_35px_rgba(99,102,241,0.1)] min-h-[300px]">
            {activeTab === 'create' && <CreatePollForm onPollCreated={onPollCreated} />}
            {activeTab === 'manage' && <ManagePolls />}
            {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
