
import { Candidate, Poll } from '../types';
import { v4 as uuidv4 } from 'uuid'; // A simple UUID generator will be needed

// We will use a simple in-memory UUID function if the library is not available in the environment.
const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for environments without crypto.randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};


const POLLS_STORAGE_KEY = 'kinettix-polls';

// --- Internal Helper Functions ---

const getPollsFromStorage = (): Poll[] => {
  try {
    const storedPolls = localStorage.getItem(POLLS_STORAGE_KEY);
    if (storedPolls) {
      return JSON.parse(storedPolls);
    }
  } catch (error) {
    console.error('Error reading polls from localStorage:', error);
  }
  return []; // Return empty array if nothing is stored or an error occurs
};

const savePollsToStorage = (polls: Poll[]): void => {
  try {
    localStorage.setItem(POLLS_STORAGE_KEY, JSON.stringify(polls));
  } catch (error) {
    console.error('Error saving polls to localStorage:', error);
  }
};

// --- Exported Functions (mimicking the async API) ---

export const getActivePolls = async (): Promise<Poll[]> => {
  const polls = getPollsFromStorage();
  return polls.filter(p => p.status === 'open');
};

export const getPollById = async (pollId: string): Promise<Poll | null> => {
  const polls = getPollsFromStorage();
  const poll = polls.find(p => p.id === pollId);
  return poll || null;
};

export const getAllPolls = async (): Promise<Poll[]> => {
  return getPollsFromStorage();
};

export const createPoll = async (title: string, candidateNames: string[]): Promise<Poll> => {
  const polls = getPollsFromStorage();
  const newPoll: Poll = {
    id: generateUUID(),
    title,
    candidates: candidateNames.map(name => ({
      id: generateUUID(),
      name,
      votes: 0,
    })),
    status: 'open',
  };
  
  polls.push(newPoll);
  savePollsToStorage(polls);
  return newPoll;
};

export const submitVote = async (pollId: string, candidateId: string): Promise<void> => {
  const polls = getPollsFromStorage();
  const poll = polls.find(p => p.id === pollId);
  if (!poll) {
    throw new Error('Poll not found');
  }
  if (poll.status === 'closed') {
    throw new Error('This poll is closed');
  }

  const candidate = poll.candidates.find(c => c.id === candidateId);
  if (!candidate) {
    throw new Error('Candidate not found');
  }

  candidate.votes++;
  savePollsToStorage(polls);
};

export const getResults = async (pollId: string): Promise<Candidate[]> => {
  const poll = await getPollById(pollId);
  if (poll) {
    return [...poll.candidates].sort((a, b) => b.votes - a.votes);
  }
  return [];
};

export const togglePollStatus = async (pollId: string): Promise<Poll | null> => {
  const polls = getPollsFromStorage();
  const poll = polls.find(p => p.id === pollId);
  if (!poll) {
    return null;
  }
  
  poll.status = poll.status === 'open' ? 'closed' : 'open';
  savePollsToStorage(polls);
  return poll;
};

export const deletePoll = async (pollId: string): Promise<void> => {
  let polls = getPollsFromStorage();
  polls = polls.filter(p => p.id !== pollId);
  savePollsToStorage(polls);
};

export const deleteAllPolls = async (): Promise<void> => {
  savePollsToStorage([]);
};
