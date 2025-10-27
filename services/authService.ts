const USERS_STORAGE_KEY = 'poll-app-users';
const CURRENT_USER_KEY = 'current-user';

const getDefaultUsers = (): string[] => [
    '0275', '0317', '0327', '0307', '0289', '0224', '0192', '0332', '0205',
    '0309', '0338', '0341', '0288', '0069', '0080', '0299', '0085', '0049',
    '0161', '0295', '0207', '0314', '0272', '0002', '0174', '0339', '0237',
    '0285', '0293', '0128', '0270', '0077', '0228', '0333', '0335', '0302',
    '0279', '0005', '0183', '0091', '0170', '0282', '0206', '0260', '0310',
    '0320', '0326', '0315', '0097', '0019', '0078', '0225', '0336', '0337',
    '0308', '0164', '0331', '0298', '0011', '0123', '0268', '0329', '0175',
    '0229', '0311', '0281', '0234', '0030', '0251', '0012', '0321', '0165',
    '0048', '0014', '0290', '0210', '0273', '0322', '0277', '0162', '0029',
    '0038', '0068', '0043', '0316', '0334', '0330', '0147', '0098', '0235',
    '0304', '0328', '0050', '0305', '0070', '0297', '0243', '0306', 'saitama'
];

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