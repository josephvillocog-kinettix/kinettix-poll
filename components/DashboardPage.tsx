import React, { useState, useEffect, useMemo } from 'react';
import { Candidate, Poll } from '../types';
import { getResults, getAllPolls } from '../services/votingService';
import ResultsChart from './ResultsChart';

// --- Modal for Detailed Poll Results ---
const PollDetailModal: React.FC<{ poll: Poll, onClose: () => void }> = ({ poll, onClose }) => {
    const [results, setResults] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [anonymize, setAnonymize] = useState(true);
    const [activeTab, setActiveTab] = useState<'chart' | 'card'>('chart');

    useEffect(() => {
        const fetchResults = async () => {
            setIsLoading(true);
            try {
                const data = await getResults(poll.id);
                setResults(data);
            } catch (err) {
                setError('Failed to load results for this poll.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchResults();
        // Add polling for live updates every 5 seconds
        const interval = setInterval(fetchResults, 5000);
        return () => clearInterval(interval);
    }, [poll.id]);

    const totalVotes = useMemo(() => results.reduce((sum, candidate) => sum + candidate.votes, 0), [results]);
    const displayData = useMemo(() => {
        if (!anonymize) return results;
        return results.map((candidate, index) => ({
            ...candidate,
            name: `Candidate ${String.fromCharCode(65 + index)}`,
        }));
    }, [results, anonymize]);

    const tabButtonClasses = (tabName: 'chart' | 'card') =>
        `px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 ${
        activeTab === tabName ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'
        }`;

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-gray-700" onClick={e => e.stopPropagation()} style={{ animation: 'scaleUp 0.3s ease-out' }}>
                <header className="p-6 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{poll.title}</h2>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${poll.status === 'open' ? 'bg-green-900/70 text-green-300' : 'bg-red-900/70 text-red-300'}`}>
                              {poll.status}
                          </span>
                          <span className="text-sm text-gray-400">{totalVotes.toLocaleString()} total votes</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors rounded-full p-2 hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <main className="p-6 overflow-y-auto">
                    {isLoading && !results.length ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : error ? <div className="text-red-400 text-center p-8">{error}</div> : (
                        <>
                            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                                <div className="bg-gray-900 p-1 rounded-lg flex space-x-1">
                                    <button onClick={() => setActiveTab('chart')} className={tabButtonClasses('chart')}>Chart View</button>
                                    <button onClick={() => setActiveTab('card')} className={tabButtonClasses('card')}>Card View</button>
                                </div>
                                <label className="flex items-center space-x-3 cursor-pointer text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                                    <input type="checkbox" checked={anonymize} onChange={(e) => setAnonymize(e.target.checked)} className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-600"/>
                                    <span>Anonymize Names</span>
                                </label>
                            </div>
                            {activeTab === 'chart' && <ResultsChart data={displayData.slice(0, 10)} />}
                            {activeTab === 'card' && (totalVotes > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {displayData.map((candidate, index) => (
                                    <div key={candidate.id} className="bg-gray-900/50 rounded-lg p-4 shadow-lg border border-gray-700/50 transition-transform duration-300 hover:scale-105 hover:border-indigo-500/50">
                                        <h3 className="text-lg font-bold text-white break-all truncate">{candidate.name}</h3>
                                        <p className="text-4xl font-bold text-white font-mono my-2">{candidate.votes.toLocaleString()} <span className="text-base font-normal text-gray-400">Votes</span></p>
                                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full" style={{ width: `${totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0}%`, transition: 'width 0.5s ease-in-out' }}></div>
                                        </div>
                                        <p className="text-right text-sm text-gray-300 mt-1">{totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0}%</p>
                                    </div>
                                ))}
                                </div>
                            ) : <div className="text-center py-16 text-gray-400">No votes cast yet.</div>)}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

// --- Header Metrics for Dashboard ---
const DashboardMetrics: React.FC<{ polls: Poll[] }> = ({ polls }) => {
    const totalPolls = polls.length;
    const activePolls = polls.filter(p => p.status === 'open').length;
    const totalVotes = polls.reduce((sum, poll) => sum + poll.candidates.reduce((voteSum, c) => voteSum + c.votes, 0), 0);
    
    const metrics = [
        { label: 'Total Polls', value: totalPolls, icon: 'M4 6h16M4 12h16m-7 6h7' },
        { label: 'Active Polls', value: activePolls, icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0122 12c0 3-1 7-6.343 6.657z' },
        { label: 'Total Votes Cast', value: totalVotes.toLocaleString(), icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {metrics.map(metric => (
                <div key={metric.label} className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700/50 flex items-center gap-6">
                    <div className="bg-indigo-900/50 p-4 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={metric.icon} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 uppercase tracking-wider">{metric.label}</p>
                      <p className="text-4xl font-extrabold text-white mt-1">{metric.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- Poll Card for Dashboard Grid ---
const PollCard: React.FC<{ poll: Poll, onSelect: () => void }> = ({ poll, onSelect }) => {
    const totalVotes = poll.candidates.reduce((sum, c) => sum + c.votes, 0);
    return (
        <div onClick={onSelect} className="bg-gray-800/50 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden border border-gray-700/50 cursor-pointer group hover:border-indigo-500/50 transition-all duration-300 transform hover:-translate-y-2">
            <div className="p-6">
                <div className="flex justify-between items-start gap-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{poll.title}</h3>
                    <span className={`flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-full ${poll.status === 'open' ? 'bg-green-500/20 text-green-300 ring-1 ring-inset ring-green-500/30' : 'bg-red-500/20 text-red-300 ring-1 ring-inset ring-red-500/30'}`}>
                        {poll.status}
                    </span>
                </div>
                <div className="flex items-center space-x-8 mt-6 text-gray-300">
                    <div>
                        <p className="text-3xl font-bold text-white">{poll.candidates.length}</p>
                        <p className="text-sm text-gray-400">Candidates</p>
                    </div>
                     <div>
                        <p className="text-3xl font-bold text-white">{totalVotes.toLocaleString()}</p>
                        <p className="text-sm text-gray-400">Votes</p>
                    </div>
                </div>
            </div>
            <div className="bg-gray-900/50 px-6 py-4 text-sm font-medium text-indigo-400 group-hover:bg-indigo-900/20 transition-colors flex justify-between items-center">
                <span>View Results</span>
                <span className="transform transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </div>
        </div>
    );
};

// --- Main Dashboard Page Component ---
const DashboardPage: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const allPolls = await getAllPolls();
        setPolls([...allPolls].sort((a, b) => (a.status === 'open' ? -1 : 1) - (b.status === 'open' ? -1 : 1) || b.id.localeCompare(a.id)));
      } catch (err) {
        setError('Failed to load poll list.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPolls();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 text-center mt-10 text-lg">{error}</p>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedPoll && <PollDetailModal poll={selectedPoll} onClose={() => setSelectedPoll(null)} />}
        <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl tracking-tight">Dashboard</h2>
            <p className="mt-4 text-xl text-gray-300">A complete overview of all poll results.</p>
        </div>
        {polls.length === 0 ? (
            <div className="text-center p-8 mt-10 bg-gray-800/50 rounded-2xl border border-gray-700/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-24 w-24 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="mt-6 text-3xl font-extrabold text-white">No Polls Found</h2>
                <p className="mt-2 text-lg text-gray-300">Create polls via the connected Google Sheet to see them here.</p>
            </div>
        ) : (
            <>
                <DashboardMetrics polls={polls} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {polls.map(poll => (
                        <PollCard key={poll.id} poll={poll} onSelect={() => setSelectedPoll(poll)} />
                    ))}
                </div>
            </>
        )}
        <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleUp { from { transform: scale(0.95); opacity: 0.8; } to { transform: scale(1); opacity: 1; } }
        `}</style>
    </div>
  );
};

export default DashboardPage;