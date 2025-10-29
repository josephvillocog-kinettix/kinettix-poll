import { Candidate, Poll } from '../types';
import * as apiService from './apiService';

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
