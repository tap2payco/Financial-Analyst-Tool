import { supabase, isSupabaseConfigured, Profile, ApiKey as DbApiKey } from '../lib/supabase';

// User interface matching local structure
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

// Local storage keys (fallback when Supabase not configured)
const STORAGE_KEY_USERS = 'finance_guru_users';
const STORAGE_KEY_SESSION = 'finance_guru_session';

// Initialize with a default admin if none exists (localStorage fallback)
const initLocalStorage = () => {
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

// ============= SUPABASE AUTH SERVICE =============
const supabaseAuthService = {
  register: async (data: { name: string; email: string; password: string; company: string; location: string; phone: string }): Promise<User> => {
    // Sign up with Supabase Auth - pass metadata for the trigger
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          // We pass these too, though the trigger might only catch 'name'
          // We will run an UPDATE to be sure
        }
      }
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error('Registration failed');

    // Profile is created automatically by database trigger (on_auth_user_created)
    // We just need to update it with the extra fields (company, phone, location)
    // We wait a brief moment to ensure trigger has fired (usually instant)
    
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        company: data.company,
        phone: data.phone,
        location: data.location,
        // Ensure name is synced if trigger missed it
        name: data.name 
      })
      .eq('id', authData.user.id);

    if (profileError) throw new Error(profileError.message);

    return {
      id: authData.user.id,
      name: data.name,
      email: data.email,
      company: data.company,
      location: data.location,
      phone: data.phone,
      role: 'developer',
      apiKeys: [],
      createdAt: new Date().toISOString()
    };
  },

  login: async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Login failed');

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw new Error('Profile not found');

    // Fetch API keys
    const { data: keys } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', data.user.id);

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      company: profile.company,
      location: profile.location,
      phone: profile.phone,
      role: profile.role,
      apiKeys: (keys || []).map((k: DbApiKey) => ({
        key: k.key,
        status: k.status,
        requestedAt: k.created_at
      })),
      createdAt: profile.created_at
    };
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    const { data: keys } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id);

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      company: profile.company,
      location: profile.location,
      phone: profile.phone,
      role: profile.role,
      apiKeys: (keys || []).map((k: DbApiKey) => ({
        key: k.key,
        status: k.status,
        requestedAt: k.created_at
      })),
      createdAt: profile.created_at
    };
  },

  requestApiKey: async (userId: string) => {
    const newKey = 'fg_' + crypto.randomUUID().replace(/-/g, '').slice(0, 24);
    
    const { error } = await supabase.from('api_keys').insert({
      user_id: userId,
      key: newKey,
      status: 'pending'
    });

    if (error) throw new Error(error.message);
  },

  getAllUsers: async (): Promise<User[]> => {
    const { data: profiles } = await supabase.from('profiles').select('*');
    if (!profiles) return [];

    const usersWithKeys: User[] = [];
    
    for (const profile of profiles) {
      const { data: keys } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', profile.id);

      usersWithKeys.push({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        company: profile.company,
        location: profile.location,
        phone: profile.phone,
        role: profile.role,
        apiKeys: (keys || []).map((k: DbApiKey) => ({
          key: k.key,
          status: k.status,
          requestedAt: k.created_at
        })),
        createdAt: profile.created_at
      });
    }

    return usersWithKeys;
  },

  updateApiKeyStatus: async (userId: string, key: string, status: 'active' | 'revoked') => {
    const { error } = await supabase
      .from('api_keys')
      .update({ status })
      .eq('user_id', userId)
      .eq('key', key);

    if (error) throw new Error(error.message);
  }
};

// ============= LOCALSTORAGE FALLBACK SERVICE =============
const localAuthService = {
  register: (data: Omit<User, 'id' | 'role' | 'apiKeys' | 'createdAt'>): User => {
    initLocalStorage();
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

  login: (email: string): User => {
    initLocalStorage();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const user = users.find((u: User) => u.email === email);
    
    if (!user) throw new Error('User not found. Please register.');
    
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  },

  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(STORAGE_KEY_SESSION);
    return session ? JSON.parse(session) : null;
  },

  requestApiKey: (userId: string) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const userIndex = users.findIndex((u: User) => u.id === userId);
    
    if (userIndex === -1) throw new Error('User not found');

    const newKey: ApiKey = {
      key: 'fg_' + Math.random().toString(36).substr(2, 18),
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    users[userIndex].apiKeys.push(newKey);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    
    const session = localAuthService.getCurrentUser();
    if (session && session.id === userId) {
      session.apiKeys.push(newKey);
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    }
  },

  getAllUsers: (): User[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
  },

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

// ============= UNIFIED AUTH SERVICE (Auto-switches based on config) =============
export const authService = {
  isSupabaseMode: isSupabaseConfigured(),
  
  register: async (data: { name: string; email: string; password?: string; company: string; location: string; phone: string }): Promise<User> => {
    if (isSupabaseConfigured()) {
      return supabaseAuthService.register({ ...data, password: data.password || 'temp123456' });
    }
    return localAuthService.register(data);
  },

  login: async (email: string, password?: string): Promise<User> => {
    if (isSupabaseConfigured()) {
      return supabaseAuthService.login(email, password || '');
    }
    return localAuthService.login(email);
  },

  logout: async () => {
    if (isSupabaseConfigured()) {
      await supabaseAuthService.logout();
    } else {
      localAuthService.logout();
    }
  },

  getCurrentUser: (): User | null => {
    // For sync calls, use localStorage cached version
    // Components should use async version when possible
    return localAuthService.getCurrentUser();
  },

  getCurrentUserAsync: async (): Promise<User | null> => {
    if (isSupabaseConfigured()) {
      return supabaseAuthService.getCurrentUser();
    }
    return localAuthService.getCurrentUser();
  },

  requestApiKey: async (userId: string) => {
    if (isSupabaseConfigured()) {
      await supabaseAuthService.requestApiKey(userId);
    } else {
      localAuthService.requestApiKey(userId);
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    if (isSupabaseConfigured()) {
      return supabaseAuthService.getAllUsers();
    }
    return localAuthService.getAllUsers();
  },

  updateApiKeyStatus: async (userId: string, key: string, status: 'active' | 'revoked') => {
    if (isSupabaseConfigured()) {
      await supabaseAuthService.updateApiKeyStatus(userId, key, status);
    } else {
      localAuthService.updateApiKeyStatus(userId, key, status);
    }
  }
};
