import { User, Poll, Candidate } from '../types';

const API_URL = 'https://script.google.com/macros/s/AKfycbzf7KeZbSInNcNWw2QdjNWLyG2JVoAI_HT4yQ6xS5LInDhNGSPN9ohg0yVNdYYrQ4KL/exec';

let cachedData: {
    users: User[];
    polls: Poll[];
} | null = null;

const fetchData = async (): Promise<{ users: User[]; polls: Poll[] }> => {
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const json: any = await response.json();

        // The API nests all data under a 'data' object.
        const data = json.data;
        if (!data) {
            throw new Error("API response is missing the 'data' object.");
        }

        // Get the arrays directly by their keys as specified by the user.
        const userList: any[] = data.users || [];
        const pollList: any[] = data.polls || [];
        const candidateList: any[] = data.candidates || [];

        // Map candidates to their respective polls using poll_id.
        const candidatesByPollId = new Map<string, any[]>();
        candidateList.forEach(c => {
            if (c.poll_id === undefined) return;
            const pollId = String(c.poll_id);
            if (!candidatesByPollId.has(pollId)) {
                candidatesByPollId.set(pollId, []);
            }
            candidatesByPollId.get(pollId)!.push(c);
        });

        const polls: Poll[] = (pollList || [])
            .filter(p => p && p.id && p.title && p.status)
            .map((p): Poll => {
                const pollId = String(p.id);
                const pollCandidatesData = candidatesByPollId.get(pollId) || [];
                
                return {
                    id: pollId,
                    title: p.title,
                    status: p.status === 'open' ? 'open' : 'closed',
                    resultsheet: p.resultsheet || '',
                    candidates: pollCandidatesData.map((c: any): Candidate => ({
                        id: String(c.id),
                        name: c.name,
                        votes: Number(c.votes) || 0,
                    })),
                }
            });
        
        const users: User[] = (userList || [])
            .filter(u => u && u.username && u.name && (u.department || u.depart))
            .map(u => new User(u.username, u.name, u.department || u.depart, u.poll1 || '', u.poll2 || ''));
        
        // Always ensure admin user exists
        if (!users.some(u => u.username === 'saitama')) {
            users.push(new User('saitama', 'Saitama', 'Admin', '', ''));
        }

        cachedData = { users, polls };
        return cachedData;

    } catch (error) {
        console.error("Failed to fetch or parse data from API:", error);
        // Fallback to ensure admin can always log in to debug.
        return { users: [new User('saitama', 'Saitama', 'Admin', '', '')], polls: [] };
    }
};

export const getUsers = async (): Promise<User[]> => {
    const data = await fetchData();
    return data.users;
};

export const getPolls = async (): Promise<Poll[]> => {
    const data = await fetchData();
    return data.polls;
};

export const clearCache = () => {
    cachedData = null;
};

export const updateUsers = async (usernames: string[]): Promise<void> => {
  try {
    // Using mode: 'no-cors' to prevent CORS errors with Google Apps Script.
    // This makes the response opaque, so we cannot check for success.
    // We assume success if the fetch promise resolves.
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'updateUsers',
        payload: usernames,
      }),
    });

    clearCache();
  } catch (error) {
    console.error("Failed to update users via API:", error);
    throw error;
  }
};

export const castVote = async (pollId: string, candidateId: string, username: string): Promise<void> => {
  try {
    // Using mode: 'no-cors' to prevent CORS errors with Google Apps Script.
    // This makes the response opaque, so we cannot check for success.
    // We assume success if the fetch promise resolves.
    // await fetch(API_URL, {
    //   method: 'POST',
    //   mode: 'no-cors',
    //   headers: {
    //     'Content-Type': 'text/plain;charset=utf-8',
    //   },
    //   body: JSON.stringify({
    //     action: 'castVote',
    //     payload: {
    //       pollId,
    //       candidateId,
    //       username,
    //     },
    //   }),
    // });
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        username:username,
        targetSheetName: 'users',
        destinationColumn: 'poll1',
        value: 'Trapa, Adrian Merck',
      }),
    });
    // Invalidate the cache to ensure the next data fetch includes the new vote.
    clearCache();

  } catch (error) {
    console.error("Failed to cast vote via API:", error);
    throw error;
  }
};

export const logVoteToSheet = async (
  username:string,
  targetSheetName: string,
  destinationColumn: string,
  candidateName: string
): Promise<void> => {
  try {
    const json = JSON.stringify({
        username:username,
        targetSheetName: targetSheetName,
        destinationColumn: destinationColumn,
        value: candidateName,
      });

    // Using mode: 'no-cors' to prevent CORS errors with Google Apps Script.
    // This makes the response opaque, so we cannot check for success.
    // We assume success if the fetch promise resolves.
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json', // CRITICAL: Tells the Apps Script that the body is JSON
      },
      body: json, // The JSON body passed to doPost(e)
    });
    console.debug(response);
  } catch (error) {
    console.error("Failed to log vote to sheet via API:", error);
    throw error;
  }
};