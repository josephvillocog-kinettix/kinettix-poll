const USERS_STORAGE_KEY = 'poll-app-users';
const CURRENT_USER_KEY = 'current-user';

const getDefaultUsers = (): string[] => ['user1', 'user2', 'user3', 'user4', 'user5', 'saitama'];

const getUsersFromStorage = (): string[] => {
  try {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
    // Set default users if none are found
    const defaultUsers = getDefaultUsers();
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  } catch (error) {
    console.error('Error reading users from localStorage:', error);
    return getDefaultUsers();
  }
};

export const login = (username: string): void => {
  const users = getUsersFromStorage();
  if (users.includes(username)) {
    sessionStorage.setItem(CURRENT_USER_KEY, username);
  } else {
    throw new Error('Invalid username');
  }
};

export const logout = (): void => {
  sessionStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): string | null => {
  return sessionStorage.getItem(CURRENT_USER_KEY);
};

export const getUsers = (): string[] => {
  return getUsersFromStorage();
};

export const updateUsers = (users: string[]): void => {
    // Ensure saitama user is always present
    const userSet = new Set(users);
    userSet.add('saitama');
    const finalUsers = Array.from(userSet);

    try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(finalUsers));
    } catch (error) {
        console.error('Error saving users to localStorage:', error);
    }
};