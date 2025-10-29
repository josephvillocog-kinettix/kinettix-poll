import React, { useState, useEffect, useMemo } from 'react';
import { Poll } from '../types';
import { getAllPolls } from '../services/votingService';

// --- Sub-components for the Accordion Layout ---

const CandidateRow: React.FC<{ candidate: Poll['candidates'][0]; totalVotes: number; anonymize: boolean; index: number; }> = ({ candidate, totalVotes, anonymize, index }) => {
    const percentage = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0;
    const displayName = anonymize ? `Candidate ${String.fromCharCode(65 + index)}` : candidate.name;
    return (
        <div key={candidate.id}>
            <div className="flex justify-between items-center text-sm mb-1.5">
                <span className="text-gray-200 font-medium truncate pr-2">{displayName}</span>
                <span className="text-white font-mono font-semibold flex-shrink-0">{candidate.votes.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full" style={{ width: `${percentage}%`, transition: 'width 0.5s ease-out' }}></div>
            </div>
        </div>
    );
};

const PollAccordionItem: React.FC<{ poll: Poll; isExpanded: boolean; onToggle: () => void; anonymize: boolean; }> = ({ poll, isExpanded, onToggle, anonymize }) => {
    const sortedCandidates = useMemo(() => 
        [...poll.candidates].sort((a, b) => b.votes - a.votes), 
        [poll.candidates]
    );
    const totalVotes = useMemo(() => 
        sortedCandidates.reduce((sum, c) => sum + c.votes, 0),
        [sortedCandidates]
    );
    
    const topCandidates = sortedCandidates.slice(0, 5);
    const remainingCandidates = sortedCandidates.slice(5);

    return (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
            <button 
                onClick={onToggle} 
                className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-expanded={isExpanded}
            >
                <div>
                    <h3 className="text-xl font-bold text-white">{poll.title}</h3>
                    <div className="flex items-center gap-4 mt-2">
                        <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${poll.status === 'open' ? 'bg-green-900/70 text-green-300' : 'bg-red-900/70 text-red-300'}`}>
                            {poll.status}
                        </span>
                        <span className="text-sm text-gray-400">{totalVotes.toLocaleString()} total votes</span>
                    </div>
                </div>
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-6 w-6 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className="px-6 pb-6 border-t border-gray-700/50">
                <div className="space-y-4 mt-4">
                    {topCandidates.length > 0 ? (
                        topCandidates.map((candidate, index) => (
                            <CandidateRow 
                                key={candidate.id}
                                candidate={candidate}
                                totalVotes={totalVotes}
                                anonymize={anonymize}
                                index={index}
                            />
                        ))
                    ) : (
                        <p className="text-gray-400 text-center py-4">No candidates or votes in this poll yet.</p>
                    )}
                </div>
                
                {remainingCandidates.length > 0 && (
                     <div className={`transition-all duration-500 ease-in-out grid ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                             <div className="space-y-4 mt-4 pt-4 border-t border-dashed border-gray-600">
                                {remainingCandidates.map((candidate, index) => (
                                     <CandidateRow 
                                        key={candidate.id}
                                        candidate={candidate}
                                        totalVotes={totalVotes}
                                        anonymize={anonymize}
                                        index={index + 5}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


const DashboardPage: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPollId, setExpandedPollId] = useState<string | null>(null);
  const [anonymize, setAnonymize] = useState(true);

  useEffect(() => {
    const fetchPolls = async () => {
      if(polls.length === 0) setIsLoading(true);
      setError(null);
      try {
        const allPolls = await getAllPolls();
        const sortedPolls = [...allPolls].sort((a, b) => (a.status === 'open' ? -1 : 1) - (b.status === 'open' ? -1 : 1) || b.id.localeCompare(a.id));
        setPolls(sortedPolls);
      } catch (err) {
        setError('Failed to load poll list.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolls();
    const interval = setInterval(fetchPolls, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTogglePoll = (pollId: string) => {
    setExpandedPollId(currentId => (currentId === pollId ? null : pollId));
  };
  
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
                <div className="flex justify-end mb-6">
                    <label className="flex items-center space-x-3 cursor-pointer text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={anonymize} 
                            onChange={(e) => setAnonymize(e.target.checked)} 
                            className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-600"
                        />
                        <span>Anonymize Names</span>
                    </label>
                </div>
                
                <div className="space-y-4">
                    {polls.map(poll => (
                        <PollAccordionItem 
                            key={poll.id} 
                            poll={poll} 
                            isExpanded={expandedPollId === poll.id}
                            onToggle={() => handleTogglePoll(poll.id)}
                            anonymize={anonymize}
                        />
                    ))}
                </div>
            </>
        )}
    </div>
  );
};

export default DashboardPage;