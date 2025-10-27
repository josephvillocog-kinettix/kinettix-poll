
import { Candidate, Poll } from '../types';

const POLLS_STORAGE_key = 'poll-app-polls';

let allPolls: Poll[] = [];
let pollsPromise: Promise<void> | null = null;

const toProperCase = (str: string): string => {
  return str
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const loadPollsFromStorage = (): Poll[] => {
  try {
    const storedData = sessionStorage.getItem(POLLS_STORAGE_key);
    return storedData ? (JSON.parse(storedData) as Poll[]) : [];
  } catch (error) {
    console.error('Error loading polls from sessionStorage:', error);
    return [];
  }
};

const savePollsToStorage = (polls: Poll[]): void => {
  try {
    sessionStorage.setItem(POLLS_STORAGE_key, JSON.stringify(polls));
  } catch (error) {
    console.error('Error saving polls to sessionStorage:', error);
  }
};

const initialize = (): Promise<void> => {
  if (!pollsPromise) {
    pollsPromise = new Promise((resolve) => {
      allPolls = loadPollsFromStorage();
      resolve();
    });
  }
  return pollsPromise;
};

// Initialize on module load
initialize();


// --- Exported Functions ---

export const getActivePolls = async (): Promise<Poll[]> => {
  await initialize();
  // Return open polls, newest first
  return allPolls.filter(p => p.status === 'open').reverse();
};

export const getPollById = async (pollId: string): Promise<Poll | null> => {
    await initialize();
    return allPolls.find(p => p.id === pollId) || null;
};

export const getAllPolls = async (): Promise<Poll[]> => {
    await initialize();
    return [...allPolls];
};

export const createPoll = async (title: string, candidateNames: string[]): Promise<Poll> => {
    await initialize();
    const newPoll: Poll = {
        id: `${Date.now()}`,
        title,
        status: 'open',
        candidates: candidateNames.map((name, index) => {
            const properName = toProperCase(name);
            return {
                id: `${Date.now()}-${index}`,
                name: properName,
                votes: 0,
            };
        }),
    };
    
    allPolls.push(newPoll);
    savePollsToStorage(allPolls);

    // Reset the promise to force re-initialization on next data request
    pollsPromise = null;

    return new Promise(resolve => setTimeout(() => resolve(newPoll), 100));
};

export const submitVote = async (pollId: string, candidateId: string): Promise<void> => {
  await initialize();
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const pollIndex = allPolls.findIndex(p => p.id === pollId);
      if (pollIndex === -1) {
        return reject(new Error('Poll not found.'));
      }
      
      const poll = allPolls[pollIndex];

      if (poll.status === 'closed') {
        return reject(new Error('This poll is closed.'));
      }

      const candidateIndex = poll.candidates.findIndex((c) => c.id === candidateId);

      if (candidateIndex > -1) {
        const updatedCandidates = poll.candidates.map((candidate, index) => {
            if (index === candidateIndex) {
                return { ...candidate, votes: candidate.votes + 1 };
            }
            return candidate;
        });

        allPolls[pollIndex] = { ...poll, candidates: updatedCandidates };
        savePollsToStorage(allPolls);
        resolve();
      } else {
        reject(new Error('Candidate not found'));
      }
    }, 300);
  });
};

export const getResults = async (pollId: string): Promise<Candidate[]> => {
  await initialize();
  const poll = allPolls.find(p => p.id === pollId);
  if (!poll) {
      return [];
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      const sortedCandidates = [...poll.candidates].sort((a, b) => b.votes - a.votes);
      resolve(sortedCandidates);
    }, 100);
  });
};

export const togglePollStatus = async (pollId: string): Promise<Poll | null> => {
    await initialize();
    const pollIndex = allPolls.findIndex(p => p.id === pollId);
    if (pollIndex > -1) {
        const poll = allPolls[pollIndex];
        const newStatus: 'open' | 'closed' = poll.status === 'open' ? 'closed' : 'open';
        const updatedPoll = { ...poll, status: newStatus };
        
        allPolls[pollIndex] = updatedPoll;
        
        savePollsToStorage(allPolls);
        pollsPromise = null;
        return updatedPoll;
    }
    return null;
};

export const deletePoll = async (pollId: string): Promise<void> => {
    await initialize();
    const pollIndex = allPolls.findIndex(p => p.id === pollId);
    if (pollIndex > -1) {
        allPolls.splice(pollIndex, 1);
        savePollsToStorage(allPolls);
        // Reset the promise to force re-initialization on next data request
        pollsPromise = null;
    }
};

export const deleteAllPolls = async (): Promise<void> => {
    await initialize();
    allPolls = [];
    savePollsToStorage(allPolls);
    // Reset the promise to force re-initialization on next data request
    pollsPromise = null;
};
