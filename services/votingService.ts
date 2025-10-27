
import { Candidate, Poll } from '../types';

// In a real app, this would be your backend server URL
const API_BASE_URL = 'http://localhost:3001/api'; 

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  // Handle responses that might not have a body (like 204 No Content)
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

// --- Exported Functions ---

export const getActivePolls = async (): Promise<Poll[]> => {
  const response = await fetch(`${API_BASE_URL}/polls?status=open`);
  return handleResponse(response);
};

export const getPollById = async (pollId: string): Promise<Poll | null> => {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}`);
    if (response.status === 404) return null;
    return handleResponse(response);
};

export const getAllPolls = async (): Promise<Poll[]> => {
    const response = await fetch(`${API_BASE_URL}/polls`);
    return handleResponse(response);
};

export const createPoll = async (title: string, candidateNames: string[]): Promise<Poll> => {
    const response = await fetch(`${API_BASE_URL}/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, candidates: candidateNames }),
    });
    return handleResponse(response);
};

export const submitVote = async (pollId: string, candidateId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/polls/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId }),
  });
  // submitVote might not return a body, so we just check for success.
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
};

export const getResults = async (pollId: string): Promise<Candidate[]> => {
  const response = await fetch(`${API_BASE_URL}/polls/${pollId}/results`);
  return handleResponse(response);
};

export const togglePollStatus = async (pollId: string): Promise<Poll | null> => {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}/status`, {
        method: 'PATCH', // PATCH is suitable for partial updates like changing status
    });
    return handleResponse(response);
};

export const deletePoll = async (pollId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
};

export const deleteAllPolls = async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/polls`, {
        method: 'DELETE',
    });
     if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
};
