export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  location: string;
  phone: string;
  role: 'developer' | 'admin';
  apiKeys: ApiKey[];
  createdAt: string;
}

export interface ApiKey {
  key: string;
  status: 'pending' | 'active' | 'revoked';
  requestedAt: string;
}

const STORAGE_KEY_USERS = 'finance_guru_users';
const STORAGE_KEY_SESSION = 'finance_guru_session';

// Initialize with a default admin if none exists
const initStorage = () => {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
  if (!users.find((u: User) => u.email === 'admin@financeguru.com')) {
    const admin: User = {
      id: 'admin-1',
      name: 'Super Admin',
      email: 'admin@financeguru.com',
      company: 'Finance Guru HQ',
      location: 'New York, USA',
      phone: '+1 555 0199',
      role: 'admin',
      apiKeys: [],
      createdAt: new Date().toISOString()
    };
    users.push(admin);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }
};

export const authService = {
  // Register
  register: (data: Omit<User, 'id' | 'role' | 'apiKeys' | 'createdAt'>) => {
    initStorage();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    
    if (users.find((u: User) => u.email === data.email)) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      role: 'developer',
      apiKeys: [],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    return newUser;
  },

  // Login
  login: (email: string) => {
    initStorage();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const user = users.find((u: User) => u.email === email);
    
    // Simulating password check (in real app, user would have password)
    if (!user) throw new Error('User not found. Please register.');
    
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
    return user;
  },

  // Logout
  logout: () => {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  },

  // Get Current User
  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(STORAGE_KEY_SESSION);
    return session ? JSON.parse(session) : null;
  },

  // Request API Key
  requestApiKey: (userId: string) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const userIndex = users.findIndex((u: User) => u.id === userId);
    
    if (userIndex === -1) throw new Error('User not found');

    const newKey: ApiKey = {
      key: 'fg_' + Math.random().toString(36).substr(2, 18),
      status: 'pending', // Pending admin approval
      requestedAt: new Date().toISOString()
    };

    users[userIndex].apiKeys.push(newKey);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    
    // Update session if it's the current user
    const session = authService.getCurrentUser();
    if (session && session.id === userId) {
      session.apiKeys.push(newKey);
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    }
  },

  // ADMIN: Get All Users
  getAllUsers: (): User[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
  },

  // ADMIN: Approve/Reject Key
  updateApiKeyStatus: (userId: string, key: string, status: 'active' | 'revoked') => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const userIndex = users.findIndex((u: User) => u.id === userId);
    
    if (userIndex === -1) return;

    const keyIndex = users[userIndex].apiKeys.findIndex((k: ApiKey) => k.key === key);
    if (keyIndex !== -1) {
      users[userIndex].apiKeys[keyIndex].status = status;
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    }
  }
};
