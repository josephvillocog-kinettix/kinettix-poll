import { Candidate, Poll, User } from '../types';
import * as apiService from './apiService';
import * as authService from './authService';

// --- Read-Only Data Access Functions ---

export const getActivePolls = async (): Promise<Poll[]> => {
  const polls = await apiService.getPolls();
  return polls.filter(p => p.status === 'open');
};

export const getPollById = async (pollId: string): Promise<Poll | null> => {
  const polls = await apiService.getPolls();
  const poll = polls.find(p => p.id === pollId);
  return poll || null;
};

export const getAllPolls = async (): Promise<Poll[]> => {
  return apiService.getPolls();
};

export const getResults = async (pollId: string): Promise<Candidate[]> => {
  const poll = await getPollById(pollId);
  if (poll) {
    return [...poll.candidates].sort((a, b) => b.votes - a.votes);
  }
  return [];
};

// --- Voting Logic Functions ---

/**
 * Checks the User object to see if they have already voted in a specific poll.
 */
export const hasVotedInPoll = (poll: Poll, user: User): boolean => {
  if (!user || !poll) {
    return false;
  }

  // The poll's `resultsheet` field is assumed to hold the name of the corresponding
  // property on the User object (e.g., 'poll1' or 'poll2').
  if (poll.id === '1' && user.poll1) {
    return true;
  }
  if (poll.id === '2' && user.poll2) {
    return true;
  }
  
  return false;
};


/**
 * Casts a vote by calling the API and then recording the vote locally.
 */
export const castVote = async (poll: Poll, candidateName: string, user: User): Promise<void> => {
  const destinationColumn = `poll${poll.id}`;
  await apiService.logVoteToSheet(user.username, 'users', destinationColumn, candidateName);

  // Update user object in memory for immediate UI feedback.
  if (poll.id === '1') {
    user.poll1 = candidateName;
  } else if (poll.id === '2') {
    user.poll2 = candidateName;
  }

  // Update session storage so the state persists across navigation and page refreshes.
  authService.updateCurrentUserInSession(user);

  // Clear the API cache to ensure fresh data is fetched on the next load.
  apiService.clearCache();
};