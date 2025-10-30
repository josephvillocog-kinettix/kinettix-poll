import React, { useState, useEffect, useMemo } from 'react';
import { Poll, User } from '../types';
import { getAllPolls } from '../services/votingService';
import * as authService from '../services/authService';
import * as apiService from '../services/apiService';
import Snowfall from './Snowfall';
import AdminConfirmationDialog from './AdminConfirmationDialog';


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

const PollAccordionSkeleton: React.FC = () => {
    return (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden p-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div>
                    <div className="h-6 bg-gray-700 rounded w-48 mb-3"></div>
                    <div className="h-4 bg-gray-700 rounded w-32"></div>
                </div>
                <div className="h-6 w-6 bg-gray-700 rounded-md"></div>
            </div>
            <div className="space-y-4 mt-6 pt-6 border-t border-gray-700/50">
                {/* Mimic 3 candidate rows */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                        <div className="h-4 bg-gray-700 rounded w-8"></div>
                    </div>
                    <div className="h-2.5 bg-gray-700/50 rounded-full"></div>
                </div>
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-700 rounded w-6"></div>
                    </div>
                    <div className="h-2.5 bg-gray-700/50 rounded-full"></div>
                </div>
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-700 rounded w-4"></div>
                    </div>
                    <div className="h-2.5 bg-gray-700/50 rounded-full"></div>
                </div>
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
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isConfirmingDeAnonymize, setIsConfirmingDeAnonymize] = useState(false);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        // Clear the cache before fetching to ensure we get the latest data.
        apiService.clearCache();

        // Fetch both polls and users data concurrently
        const [allPolls, allUsers] = await Promise.all([
          getAllPolls(),
          authService.getUsers()
        ]);

        // Calculate vote counts from user data
        const pollsWithCalculatedVotes = allPolls.map(poll => {
          const voteCounts = new Map<string, number>();
          // Determine which user property to check based on the poll ID
          const pollFieldName = poll.id === '1' ? 'poll1' : 'poll2';

          for (const user of allUsers) {
            // Get the candidate name the user voted for in this poll
            const votedFor = user[pollFieldName as keyof User] as string;
            if (votedFor) {
              voteCounts.set(votedFor, (voteCounts.get(votedFor) || 0) + 1);
            }
          }

          // Update each candidate with the new vote count
          const updatedCandidates = poll.candidates.map(candidate => ({
            ...candidate,
            votes: voteCounts.get(candidate.name) || 0,
          }));

          return { ...poll, candidates: updatedCandidates };
        });

        // Sort polls for display (open polls first)
        const sortedPolls = [...pollsWithCalculatedVotes].sort((a, b) => (a.status === 'open' ? -1 : 1) - (b.status === 'open' ? -1 : 1) || b.id.localeCompare(a.id));
        setPolls(sortedPolls);
        setError(null); // Clear any previous error on a successful fetch.
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError('Failed to load poll data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndProcessData();
    let intervalId: number | undefined;

    if (autoRefresh) {
        intervalId = setInterval(fetchAndProcessData, 4000);
    }
    
    return () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    };
  }, [autoRefresh]);

  const handleTogglePoll = (pollId: string) => {
    setExpandedPollId(currentId => (currentId === pollId ? null : pollId));
  };
  
  const handleAnonymizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Re-anonymizing doesn't require confirmation
      setAnonymize(true);
    } else {
      // De-anonymizing requires confirmation
      setIsConfirmingDeAnonymize(true);
    }
  };

  const handleDeAnonymizeConfirm = () => {
    setAnonymize(false);
    setIsConfirmingDeAnonymize(false);
  };

  if (isLoading) {
    return (
        <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
            <Snowfall count={30} minSize={8} maxSize={20} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mb-6">
                    <div className="h-10 bg-gray-700/50 rounded-lg w-40 animate-pulse"></div>
                    <div className="h-10 bg-gray-700/50 rounded-lg w-40 animate-pulse"></div>
                </div>
                <div className="space-y-4">
                    <PollAccordionSkeleton />
                    <PollAccordionSkeleton />
                </div>
            </div>
        </div>
    );
  }

  const pageContent = error ? (
      <p className="text-red-400 text-center mt-10 text-lg">{error}</p>
  ) : (
    <>
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
              <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mb-6">
                  <label className="flex items-center space-x-3 cursor-pointer text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                      <input 
                          type="checkbox" 
                          checked={anonymize} 
                          onChange={handleAnonymizeChange} 
                          className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-600"
                      />
                      <span>Anonymize Names</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                      <input 
                          type="checkbox" 
                          checked={autoRefresh} 
                          onChange={(e) => setAutoRefresh(e.target.checked)} 
                          className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-600"
                      />
                      <span>Auto Refresh</span>
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
    </>
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <Snowfall count={30} minSize={8} maxSize={20} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
            {pageContent}
        </div>
        <AdminConfirmationDialog
          isOpen={isConfirmingDeAnonymize}
          onClose={() => setIsConfirmingDeAnonymize(false)}
          onConfirm={handleDeAnonymizeConfirm}
          title="Disable Anonymization"
          description="This will reveal all candidate names. To proceed, please enter the keyword."
        />
    </div>
  );
};

export default DashboardPage;
