import { Candidate, Poll, User } from '../types';
import * as apiService from './apiService';

const VOTED_POLLS_KEY = 'kinettix-voted-polls';

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
 * Checks localStorage to see if the user has already voted in a specific poll.
 */
export const hasVotedInPoll = (pollId: string): boolean => {
  try {
    const votedPolls = JSON.parse(localStorage.getItem(VOTED_POLLS_KEY) || '[]');
    return votedPolls.includes(pollId);
  } catch (error) {
    console.error('Failed to read voted polls from localStorage', error);
    return false; // Fail safe
  }
};

/**
 * Records a user's vote for a poll in localStorage.
 */
const recordVoteInPoll = (pollId: string): void => {
  try {
    const votedPolls = JSON.parse(localStorage.getItem(VOTED_POLLS_KEY) || '[]');
    if (!votedPolls.includes(pollId)) {
      votedPolls.push(pollId);
      localStorage.setItem(VOTED_POLLS_KEY, JSON.stringify(votedPolls));
    }
  } catch (error) {
    console.error('Failed to save voted poll to localStorage', error);
  }
};

/**
 * Casts a vote by calling the API and then recording the vote locally.
 */
export const castVote = async (poll: Poll, candidateName: string, user: User): Promise<void> => {

  await apiService.logVoteToSheet(user.username,'users', poll.resultsheet, candidateName);
/*
  // First, cast the vote with the existing mechanism
  await apiService.castVote(poll.id, candidateId, user.username);

  // Then, log the vote to the new sheet API
  const candidate = poll.candidates.find(c => c.id === candidateId);
  if (candidate && poll.resultsheet) {
    try {
      await apiService.logVoteToSheet(user.username,'users', poll.resultsheet, candidateId);
    } catch (logError) {
      console.error("Failed to log vote to sheet, but vote was cast successfully.", logError);
      // Do not re-throw, so the main voting flow is not interrupted
    }
  } else {
    if (!poll.resultsheet) {
        console.warn(`Poll "${poll.title}" does not have a resultsheet configured. Skipping vote log.`);
    }
    if (!candidate) {
        console.error(`Candidate with id ${candidateId} not found in poll "${poll.title}". Skipping vote log.`);
    }
  }
*/
  // Finally, record the vote locally
  recordVoteInPoll(poll.id);
};
