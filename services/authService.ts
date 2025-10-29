import { User } from '../types';
import * as apiService from './apiService';

const CURRENT_USER_KEY = 'kinettix-current-user';

export const login = async (username: string): Promise<User> => {
  const users = await apiService.getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  
  if (user) {
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  } else {
    throw new Error('Invalid username');
  }
};

export const logout = (): void => {
  sessionStorage.removeItem(CURRENT_USER_KEY);
  apiService.clearCache();
};

export const getCurrentUser = (): User | null => {
  try {
    const userJson = sessionStorage.getItem(CURRENT_USER_KEY);
    if (!userJson) return null;
    const userData = JSON.parse(userJson);
    return new User(userData.username, userData.name, userData.department);
  } catch (error) {
    console.error("Failed to parse user from sessionStorage", error);
    return null;
  }
};

export const getUsers = async (): Promise<User[]> => {
  return await apiService.getUsers();
};

// FIX: Add updateUsers function to handle saving the user list.
export const updateUsers = async (usernames: string[]): Promise<void> => {
  // Per business logic, 'saitama' must always be included.
  // Using a Set handles duplicates automatically.
  const userSet = new Set(usernames);
  userSet.add('saitama');
  
  const finalUsernames = Array.from(userSet);
  
  // Delegate the actual API call to the apiService.
  await apiService.updateUsers(finalUsernames);
};
