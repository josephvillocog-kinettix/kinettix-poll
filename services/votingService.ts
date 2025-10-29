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
export const castVote = async (pollId: string, candidateId: string, username: string): Promise<void> => {
  await apiService.castVote(pollId, candidateId, username);
  recordVoteInPoll(pollId);
};
