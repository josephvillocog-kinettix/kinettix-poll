
import React, { useState, useEffect, useMemo } from 'react';
import { Candidate, Poll } from '../types';
import { getActivePolls, submitVote, getPollById } from '../services/votingService';
import CandidateCard from './CandidateCard';
import Snowfall from './Snowfall';

interface VotingPageProps {
  currentUser: string;
}

const PollVoteView: React.FC<{ pollId: string; currentUser: string; onBack: () => void; showBackButton: boolean; }> = ({ pollId, currentUser, onBack, showBackButton }) => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPoll = async () => {
      setIsLoading(true);
      try {
        const data = await getPollById(pollId);
        setPoll(data);
        if (data) {
          const votedId = localStorage.getItem(`voted-candidate-id-${currentUser}-${data.id}`);
          setHasVoted(!!votedId);
        }
      } catch (err) {
        setError('Failed to load the poll. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPoll();
  }, [pollId, currentUser]);

  const handleVoteSubmit = async () => {
    if (selectedCandidateId === null) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await submitVote(pollId, selectedCandidateId);
      localStorage.setItem(`voted-candidate-id-${currentUser}-${pollId}`, selectedCandidateId);
      setHasVoted(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your vote.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCandidates = useMemo(() => {
    if (!poll) return [];
    return poll.candidates.filter(candidate =>
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [poll, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }
  
  if (poll && poll.status === 'closed') {
    return (
      <div className="relative text-center p-8 mt-10 min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center overflow-hidden">
        <Snowfall />
        <div className="z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-24 w-24 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="mt-6 text-3xl font-extrabold text-white">Poll Closed</h2>
          <p className="mt-2 text-lg text-gray-300">This poll is no longer accepting votes. Thank you for your interest.</p>
           {showBackButton && (
              <button onClick={onBack} className="mt-6 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                Back to Polls
              </button>
            )}
        </div>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="relative text-center p-8 mt-10 min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center overflow-hidden">
        <Snowfall />
        <div className="z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-24 w-24 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-6 text-3xl font-extrabold text-white">Thank You for Voting!</h2>
          <p className="mt-2 text-lg text-gray-300">Your vote has been counted. {currentUser === 'saitama' && 'Check the dashboard to see live results.'}</p>
          {showBackButton && (
            <button onClick={onBack} className="mt-6 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                Back to Polls
            </button>
          )}
        </div>
      </div>
    )
  }
  
  if (!poll) {
    return (
      <div className="relative text-center p-8 mt-10 min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center overflow-hidden">
        <Snowfall />
        <div className="z-10">
          <h2 className="mt-6 text-3xl font-extrabold text-white">Error</h2>
          <p className="mt-2 text-lg text-gray-300">Could not find the selected poll.</p>
           {showBackButton && (
              <button onClick={onBack} className="mt-6 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                Back to Polls
              </button>
            )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <Snowfall />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10 relative">
        <div className="text-center mb-12 relative">
          {showBackButton && (
            <button
                onClick={onBack}
                className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
                aria-label="Go back to poll list"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
          )}
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">{poll.title}</h2>
          <p className="mt-4 text-lg text-gray-300">Please select and submit your vote.</p>
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
              className="w-full pl-10 pr-4 py-3 text-white bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 ease-in-out"
              placeholder="Search for a candidate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        
        {filteredCandidates.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 pb-28">
            {filteredCandidates.map((candidate, index) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                isSelected={selectedCandidateId === candidate.id}
                onSelect={setSelectedCandidateId}
                disabled={isSubmitting}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No candidates match your search.</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 z-10">
        <div className="max-w-xl mx-auto">
          <button
            onClick={handleVoteSubmit}
            disabled={selectedCandidateId === null || isSubmitting}
            className="w-full bg-green-600 text-white font-bold py-4 px-4 rounded-lg shadow-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 text-lg flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : 'Submit Vote'}
          </button>
        </div>
      </div>
    </div>
  );
};


const VotingPage: React.FC<VotingPageProps> = ({ currentUser }) => {
  const [activePolls, setActivePolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolls = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getActivePolls();
            setActivePolls(data);
            if (data.length === 1) {
                // If only one poll, go directly to it
                setSelectedPollId(data[0].id);
            }
        } catch (err) {
            setError('Failed to load polls. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };
    fetchPolls();
  }, []);
  
  const handleSelectPoll = (pollId: string) => {
    setSelectedPollId(pollId);
  };
  
  const handleBackToList = () => {
    setSelectedPollId(null);
     // Re-fetch polls to update voted status on cards
    const fetchPolls = async () => {
        const data = await getActivePolls();
        setActivePolls(data);
    };
    fetchPolls();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (selectedPollId) {
    return <PollVoteView pollId={selectedPollId} currentUser={currentUser} onBack={handleBackToList} showBackButton={activePolls.length > 1} />;
  }

  if (activePolls.length === 0) {
    return (
      <div className="relative text-center p-8 mt-10 min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center overflow-hidden">
        <Snowfall />
        <div className="z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-24 w-24 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-6 text-3xl font-extrabold text-white">No Active Polls</h2>
          <p className="mt-2 text-lg text-gray-300">Please wait for an admin to open a poll.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <Snowfall />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10 relative">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Active Polls</h2>
                <p className="mt-4 text-lg text-gray-300">Please select a poll to cast your vote.</p>
            </div>
            {error && <p className="text-red-400 text-center mb-4">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activePolls.map(poll => {
                    const votedCandidateId = localStorage.getItem(`voted-candidate-id-${currentUser}-${poll.id}`);
                    const votedCandidate = votedCandidateId ? poll.candidates.find(c => c.id === votedCandidateId) : null;

                    return (
                        <div 
                            key={poll.id} 
                            onClick={() => handleSelectPoll(poll.id)}
                            className="bg-red-900/40 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-red-800/50 hover:border-red-600 cursor-pointer transition-all duration-300 transform hover:-translate-y-2 flex flex-col"
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => e.key === 'Enter' && handleSelectPoll(poll.id)}
                        >
                            <div className="flex-grow">
                                <h3 className="text-xl font-bold text-white mb-2">{poll.title}</h3>
                                <p className="text-gray-300">{poll.candidates.length} candidates</p>
                            </div>
                            {votedCandidate && (
                                <div className="mt-4 pt-4 border-t border-red-800/50 flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm text-gray-300">
                                        You voted for: <span className="font-semibold text-white">{votedCandidate.name}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default VotingPage;