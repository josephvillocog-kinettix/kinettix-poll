import React, { useState, useEffect, useMemo } from 'react';
import { Candidate, Poll, User } from '../types';
import * as votingService from '../services/votingService';
import CandidateCard from './CandidateCard';
import Snowfall from './Snowfall';

interface VotingPageProps {
  currentUser: User;
}

const PollDetailView: React.FC<{ pollId: string; onBack: () => void; showBackButton: boolean; currentUser: User; }> = ({ pollId, onBack, showBackButton, currentUser }) => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const fetchPoll = async () => {
      setIsLoading(true);
      try {
        const data = await votingService.getPollById(pollId);
        setPoll(data);
      } catch (err) {
        setError('Failed to load the poll. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPoll();
  }, [pollId]);

  useEffect(() => {
    if (poll && currentUser) {
      setHasVoted(votingService.hasVotedInPoll(poll, currentUser));
    }
  }, [poll, currentUser]);
  
  const handleSelectCandidate = (candidateId: string) => {
    if (poll?.status === 'open' && !hasVoted) {
      setSelectedCandidateId(candidateId);
      setVoteError(null);
    }
  };
  
  const handleVoteSubmit = async () => {
    if (!selectedCandidateId || !currentUser || !poll) return;

    const selectedCandidate = poll.candidates.find(c => c.id === selectedCandidateId);
    if (!selectedCandidate) {
      setVoteError('An error occurred: The selected candidate could not be found.');
      return;
    }

    setIsSubmitting(true);
    setVoteError(null);
    try {
      await votingService.castVote(poll, selectedCandidate.name, currentUser);
      setHasVoted(true);
    } catch (err) {
      setVoteError('An error occurred while casting your vote. Please try again.');
      console.error(err);
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
  
  if (!poll) {
    return (
      <div className="relative text-center p-8 mt-10 min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center overflow-hidden">
        <Snowfall />
        <div className="z-10">
          <h2 className="mt-6 text-3xl font-extrabold text-white">Error</h2>
          <p className="mt-2 text-lg text-gray-300">{error || 'Could not find the selected poll.'}</p>
           {showBackButton && (
              <button onClick={onBack} className="mt-6 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                Back to Polls
              </button>
            )}
        </div>
      </div>
    )
  }

  const mainContent = (
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
        <p className="mt-4 text-lg text-gray-300">
          {poll.status === 'open' && !hasVoted ? 'Select a candidate to cast your vote.' : 'Viewing candidates for this poll.'}
        </p>
         <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-semibold rounded-full ${poll.status === 'open' ? 'bg-green-900/70 text-green-300' : 'bg-red-900/70 text-red-300'}`}>
            Status: {poll.status}
         </span>
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
      
      {filteredCandidates.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {filteredCandidates.map((candidate, index) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={candidate.id === selectedCandidateId}
              disabled={poll.status !== 'open' || hasVoted}
              onSelect={handleSelectCandidate}
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
  );
  
  const voteFooter = (
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 z-20">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
              {hasVoted ? (
                  <div className="text-center text-green-400 font-bold flex items-center justify-center gap-2 text-lg">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Your vote has been cast! Thank you.</span>
                  </div>
              ) : (
                  <>
                      <button
                          onClick={handleVoteSubmit}
                          disabled={!selectedCandidateId || isSubmitting}
                          className="w-full max-w-md bg-red-600 text-white font-bold py-4 px-4 rounded-lg shadow-lg hover:bg-red-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-xl flex items-center justify-center"
                      >
                           {isSubmitting ? (
                            <>
                               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Casting Vote...</span>
                            </>
                           ) : 'Cast Vote'}
                      </button>
                      {voteError && <p className="text-red-400 text-center mt-2">{voteError}</p>}
                  </>
              )}
          </div>
      </div>
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
      <Snowfall />
      <div className="flex-grow">
          {mainContent}
      </div>
      {poll.status === 'open' && voteFooter}
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
            const data = await votingService.getActivePolls();
            setActivePolls(data);
            if (data.length === 1) {
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
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (selectedPollId) {
    return <PollDetailView pollId={selectedPollId} onBack={handleBackToList} showBackButton={activePolls.length > 1} currentUser={currentUser} />;
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
          <p className="mt-2 text-lg text-gray-300">There are currently no polls open for voting.</p>
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
                <p className="mt-4 text-lg text-gray-300">Please select a poll to view its candidates.</p>
            </div>
            {error && <p className="text-red-400 text-center mb-4">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activePolls.map(poll => (
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
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default VotingPage;