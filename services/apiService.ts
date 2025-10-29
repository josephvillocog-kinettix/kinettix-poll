import { User, Poll, Candidate } from '../types';

const API_URL = 'https://script.google.com/macros/s/AKfycbyoIV6jfTE_ZG_PIaXoqAjh0gu-xJEFui40F-IfSCynERTZAaNBg9xGHIkudiB6IIC0/exec';

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

        // Prioritize the 'data' property if it exists, otherwise use the root object.
        // This directly addresses the API structure where user/poll data is nested.
        const sourceData = json.data || json;

        let userList: any[] = [];
        let pollList: any[] = [];
        let candidateList: any[] = []; 

        const processArray = (arr: any[]) => {
            if (!Array.isArray(arr) || arr.length === 0) return;
            const firstItem = arr[0];
            if (firstItem.hasOwnProperty('username') && firstItem.hasOwnProperty('name') && userList.length === 0) {
                userList = arr;
            } else if (firstItem.hasOwnProperty('title') && firstItem.hasOwnProperty('status') && pollList.length === 0) {
                pollList = arr;
            } else if (firstItem.hasOwnProperty('poll_id') && firstItem.hasOwnProperty('name') && candidateList.length === 0) {
                candidateList = arr;
            }
        };

        if (Array.isArray(sourceData)) {
            processArray(sourceData);
        } else if (typeof sourceData === 'object' && sourceData !== null) {
            for (const key in sourceData) {
                if (Object.prototype.hasOwnProperty.call(sourceData, key) && Array.isArray(sourceData[key])) {
                    processArray(sourceData[key]);
                }
            }
        }

        if (pollList.length > 0 && candidateList.length > 0) {
            const candidatesByPollId = new Map<string, any[]>();
            candidateList.forEach(c => {
                const pollId = String(c.poll_id);
                if (!candidatesByPollId.has(pollId)) {
                    candidatesByPollId.set(pollId, []);
                }
                candidatesByPollId.get(pollId)!.push(c);
            });

            pollList.forEach(p => {
                const pollId = String(p.id);
                p.candidates = candidatesByPollId.get(pollId) || [];
            });
        }

        const users: User[] = (userList || [])
            .filter(u => u && u.username && u.name && (u.department || u.depart))
            .map(u => new User(u.username, u.name, u.department || u.depart));
        
        if (!users.some(u => u.username === 'saitama')) {
            users.push(new User('saitama', 'Saitama', 'Admin'));
        }

        const polls: Poll[] = (pollList || [])
            .filter(p => p && p.id && p.title && p.status && Array.isArray(p.candidates))
            .map((p): Poll => ({
                id: String(p.id),
                title: p.title,
                status: p.status === 'open' ? 'open' : 'closed',
                candidates: (p.candidates || []).map((c: any): Candidate => ({
                    id: String(c.id),
                    name: c.name,
                    votes: Number(c.votes) || 0,
                })),
            }));

        cachedData = { users, polls };
        return cachedData;

    } catch (error) {
        console.error("Failed to fetch or parse data from API:", error);
        return { users: [new User('saitama', 'Saitama', 'Admin')], polls: [] };
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
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateUsers',
        payload: usernames,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed to update users with status ${response.status}: ${errorText}`);
    }

    clearCache();
  } catch (error) {
    console.error("Failed to update users via API:", error);
    throw error;
  }
};
