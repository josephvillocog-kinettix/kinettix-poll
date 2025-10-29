import React, { useState, useEffect, useMemo } from 'react';
import { Candidate, Poll } from '../types';
import { getResults, getAllPolls } from '../services/votingService';
import ResultsChart from './ResultsChart';

const GRADIENTS = [
  'from-purple-600 to-indigo-600',
  'from-red-500 to-orange-500',
  'from-green-500 to-teal-500',
  'from-blue-500 to-cyan-500',
  'from-pink-500 to-rose-500',
  'from-yellow-400 to-amber-500',
  'from-indigo-500 to-violet-600',
  'from-lime-400 to-green-600',
];

const CLOUD_CONFIGS: { puffs: { top?: string; bottom?: string; left?: string; right?: string; width: string; height: string; }[] }[] = [
    // Config 1: A bit wide
    { puffs: [
        { top: '20%', left: '10%', width: '80%', height: '60%' }, { top: '0%', left: '20%', width: '50%', height: '50%' },
        { top: '5%', right: '5%', width: '60%', height: '60%' }, { top: '30%', right: '25%', width: '40%', height: '40%' },
    ]},
    // Config 2: Taller
    { puffs: [
        { top: '10%', left: '20%', width: '60%', height: '80%' }, { top: '-5%', left: '30%', width: '40%', height: '40%' },
        { right: '5%', top: '20%', width: '50%', height: '50%' }, { bottom: '-10%', left: '20%', width: '60%', height: '60%' },
    ]},
    // Config 3: Small and puffy
    { puffs: [
        { top: '15%', left: '15%', width: '70%', height: '70%' }, { top: '-10%', left: '10%', width: '50%', height: '50%' },
        { top: '-5%', right: '5%', width: '40%', height: '40%' }, { right: '-10%', bottom: '10%', width: '60%', height: '60%' },
    ]},
    // Config 4: Long, stretched
    { puffs: [
        { top: '30%', left: '5%', width: '90%', height: '40%' }, { top: '5%', left: '10%', width: '50%', height: '50%' },
        { top: '10%', right: '10%', width: '60%', height: '60%' },
    ]},
    // Config 5: Bottom heavy
    { puffs: [
        { top: '10%', left: '10%', width: '80%', height: '80%' }, { bottom: '-15%', left: '5%', width: '55%', height: '55%' },
        { bottom: '-10%', right: '0%', width: '60%', height: '60%' },
    ]},
    // Config 6: Leaning right
    { puffs: [
        { top: '5%', left: '25%', width: '50%', height: '90%' }, { bottom: '5%', left: '-10%', width: '60%', height: '60%' },
        { top: '-5%', right: '-5%', width: '65%', height: '65%' },
    ]},
    // Config 7: Central big puff
    { puffs: [
        { top: '10%', left: '10%', width: '80%', height: '80%' }, { top: '-15%', left: '25%', width: '50%', height: '50%' },
        { top: '30%', right: '-10%', width: '50%', height: '50%' },
    ]},
    // Config 8: Wide with small puffs
    { puffs: [
        { top: '30%', left: '10%', width: '80%', height: '50%' }, { top: '5%', left: '15%', width: '30%', height: '30%' },
        { top: '0%', left: '40%', width: '40%', height: '40%' }, { top: '10%', right: '5%', width: '35%', height: '35%' },
    ]},
];

// Component to display the results for a single poll
const PollResults: React.FC<{ poll: Poll }> = ({ poll }) => {
    const [results, setResults] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [anonymize, setAnonymize] = useState(true);
    const [activeTab, setActiveTab] = useState<'chart' | 'card' | 'bubble'>('chart');

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

    }, [poll.id]);
    
    const totalVotes = useMemo(() => results.reduce((sum, candidate) => sum + candidate.votes, 0), [results]);

    const displayData = useMemo(() => {
        if (!anonymize) return results;
        return results.map((candidate, index) => ({
            ...candidate,
            name: `Candidate ${String.fromCharCode(65 + index)}`,
        }));
    }, [results, anonymize]);

    const candidatesWithVotes = useMemo(() => {
        return displayData.filter(candidate => candidate.votes > 0);
    }, [displayData]);

    const winner = useMemo(() => {
        if (candidatesWithVotes.length === 0) return null;
        return candidatesWithVotes.reduce((prev, current) => (prev.votes > current.votes) ? prev : current);
    }, [candidatesWithVotes]);

    const orbitingCandidates = useMemo(() => {
        if (!winner) return [];
        return candidatesWithVotes.filter(c => c.id !== winner.id);
    }, [candidatesWithVotes, winner]);

    const tabButtonClasses = (tabName: 'chart' | 'card' | 'bubble') =>
    `px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 ${
      activeTab === tabName
        ? 'bg-indigo-600 text-white'
        : 'text-gray-300 hover:bg-gray-700'
    }`;

    if (isLoading) {
        return <div className="p-4 text-center text-gray-400">Loading results...</div>;
    }
    if (error) {
        return <div className="p-4 text-center text-red-400">{error}</div>;
    }

    return (
        <div className="py-4">
             <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between mb-6 gap-4">
                <div className="bg-gray-800 p-1 rounded-lg flex flex-wrap justify-center space-x-1">
                    <button onClick={() => setActiveTab('chart')} className={tabButtonClasses('chart')}>
                        Chart View
                    </button>
                    <button onClick={() => setActiveTab('card')} className={tabButtonClasses('card')}>
                        Card View
                    </button>
                    <button onClick={() => setActiveTab('bubble')} className={tabButtonClasses('bubble')}>
                        Bubble View
                    </button>
                </div>
                <label htmlFor={`anonymize-checkbox-${poll.id}`} className="flex items-center space-x-3 cursor-pointer text-gray-300 hover:text-white transition-colors">
                    <input
                        id={`anonymize-checkbox-${poll.id}`}
                        type="checkbox"
                        checked={anonymize}
                        onChange={(e) => setAnonymize(e.target.checked)}
                        className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-600"
                    />
                    <span className="font-medium">Anonymize Candidates</span>
                </label>
            </div>

            {activeTab === 'chart' && <ResultsChart data={displayData.slice(0, 5)} />}
            {activeTab === 'card' && (
                <div className="w-full">
                    {displayData.length > 0 && totalVotes > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {displayData.map((candidate, index) => {
                                const percentage = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0;
                                return (
                                    <div key={candidate.id} className="bg-gray-800 rounded-lg p-4 flex flex-col shadow-lg border border-gray-700/50 transition-transform transform hover:-translate-y-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <h3 className="text-lg font-bold text-white break-all pr-2">{candidate.name}</h3>
                                            <span className="flex-shrink-0 ml-2 bg-indigo-600 text-white text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full ring-2 ring-gray-900">
                                                {index + 1}
                                            </span>
                                        </div>
                                        
                                        <div className="flex-grow space-y-3">
                                            <div className="w-full">
                                                <div className="flex items-center gap-x-2">
                                                    <div className="w-full bg-gray-600 rounded-full h-2">
                                                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-300 w-12 text-right">{percentage.toFixed(1)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 text-right">
                                            <p className="text-3xl font-bold text-white font-mono">{candidate.votes}</p>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider">Votes</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                            <p>No votes have been cast in this poll yet.</p>
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'bubble' && (
                 <div className="w-full min-h-[600px] flex justify-center items-center p-4 relative overflow-hidden">
                    {candidatesWithVotes.length > 0 && winner ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                             {/* Render Winner in the center */}
                            <div className="z-10">
                                {(() => {
                                    const percentage = totalVotes > 0 ? (winner.votes / totalVotes) * 100 : 0;
                                    const size = Math.max(80, 60 + (percentage * 2.5));
                                    const originalIndex = displayData.findIndex(c => c.id === winner.id);
                                    const gradientClass = GRADIENTS[originalIndex % GRADIENTS.length];
                                    const cloudConfig = CLOUD_CONFIGS[originalIndex % CLOUD_CONFIGS.length];
                                    
                                    return (
                                        <div
                                            key={winner.id}
                                            className="cloud-container shadow-2xl"
                                            style={{
                                                width: `${size}px`,
                                                height: `${size}px`,
                                            }}
                                        >
                                            {cloudConfig.puffs.map((puff, i) => (
                                                <div
                                                    key={i}
                                                    className={`cloud-puff bg-gradient-to-br ${gradientClass}`}
                                                    style={{ ...puff }}
                                                />
                                            ))}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-2 z-10">
                                                <span className={`font-bold break-all ${size > 120 ? 'text-lg' : 'text-sm'}`}>{winner.name}</span>
                                                <span className={`font-mono font-bold ${size > 140 ? 'text-3xl' : 'text-xl'}`}>{winner.votes}</span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Render Other Candidates statically */}
                            {orbitingCandidates.map((candidate, index) => {
                                const percentage = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0;
                                const size = Math.max(60, 40 + (percentage * 2));
                                const originalIndex = displayData.findIndex(c => c.id === candidate.id);
                                const gradientClass = GRADIENTS[originalIndex % GRADIENTS.length];
                                const cloudConfig = CLOUD_CONFIGS[originalIndex % CLOUD_CONFIGS.length];
                                
                                const numOrbiting = orbitingCandidates.length;
                                let radius;
                                let angle;

                                // Position candidates on concentric circles
                                if (numOrbiting <= 6) {
                                    radius = 180;
                                    angle = (index / numOrbiting) * 2 * Math.PI;
                                } else if (numOrbiting <= 16) {
                                    const numInRing1 = 6;
                                    const numInRing2 = numOrbiting - numInRing1;
                                    if (index < numInRing1) {
                                        radius = 180;
                                        angle = (index / numInRing1) * 2 * Math.PI;
                                    } else {
                                        radius = 280;
                                        angle = ((index - numInRing1) / numInRing2) * 2 * Math.PI;
                                    }
                                } else {
                                    const numInRing1 = 6;
                                    const numInRing2 = 10;
                                    const numInRing3 = numOrbiting - numInRing1 - numInRing2;
                                    if (index < numInRing1) {
                                        radius = 180;
                                        angle = (index / numInRing1) * 2 * Math.PI;
                                    } else if (index < (numInRing1 + numInRing2)) {
                                        radius = 280;
                                        angle = ((index - numInRing1) / numInRing2) * 2 * Math.PI;
                                    } else {
                                        radius = 380;
                                        angle = ((index - numInRing1 - numInRing2) / numInRing3) * 2 * Math.PI;
                                    }
                                }
                                
                                const x = radius * Math.cos(angle);
                                const y = radius * Math.sin(angle);

                                return (
                                     <div
                                        key={candidate.id}
                                        className="cloud-container absolute top-1/2 left-1/2 transform transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl"
                                        style={{
                                            width: `${size}px`,
                                            height: `${size}px`,
                                            transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                                        }}
                                    >
                                        {cloudConfig.puffs.map((puff, i) => (
                                            <div
                                                key={i}
                                                className={`cloud-puff bg-gradient-to-br ${gradientClass}`}
                                                style={{ ...puff }}
                                            />
                                        ))}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-2 z-10">
                                            <span className={`font-bold break-all ${size > 100 ? 'text-base' : 'text-xs'}`}>{candidate.name}</span>
                                            <span className={`font-mono font-bold ${size > 120 ? 'text-2xl' : 'text-lg'}`}>{candidate.votes}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-400 absolute">
                            <p>No votes have been cast in this poll yet.</p>
                        </div>
                    )}
                 </div>
            )}
        </div>
    );
};

const DashboardPage: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPollId, setExpandedPollId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const allPolls = await getAllPolls();
        const sortedPolls = [...allPolls].reverse(); // newest first
        setPolls(sortedPolls);

        if (sortedPolls.length > 0) {
          const firstOpenPoll = sortedPolls.find(p => p.status === 'open');
          setExpandedPollId(firstOpenPoll ? firstOpenPoll.id : sortedPolls[0].id);
        }
        
      } catch (err) {
        setError('Failed to load poll list.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPolls();
  }, []);

  const handleToggleExpand = (pollId: string) => {
    setExpandedPollId(currentId => (currentId === pollId ? null : pollId));
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 text-center mt-10">{error}</p>
  }

  if (polls.length === 0) {
    return (
      <div className="text-center p-8 mt-10">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-24 w-24 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
        <h2 className="mt-6 text-3xl font-extrabold text-white">No Polls Found</h2>
        <p className="mt-2 text-lg text-gray-300">Data is managed via the connected Google Sheet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Kinettix Poll Dashboard</h2>
        <p className="mt-4 text-lg text-gray-300">
          A complete overview of all poll results.
        </p>
      </div>
      
      <div className="space-y-4">
        {polls.map(poll => (
            <div key={poll.id} className="bg-gray-800/50 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden border border-gray-700/50">
                <button 
                    onClick={() => handleToggleExpand(poll.id)}
                    className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-700/20 transition-colors duration-200"
                    aria-expanded={expandedPollId === poll.id}
                >
                    <div>
                        <h3 className="text-xl font-bold text-white">{poll.title}</h3>
                         <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-semibold rounded-full ${poll.status === 'open' ? 'bg-green-900/70 text-green-300' : 'bg-red-900/70 text-red-300'}`}>
                            {poll.status}
                        </span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-400 transition-transform duration-300 ${expandedPollId === poll.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {expandedPollId === poll.id && (
                    <div className="px-6 pb-6 border-t border-gray-700/50">
                        <PollResults poll={poll} />
                    </div>
                )}
            </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
