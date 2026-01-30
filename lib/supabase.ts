import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase
// Add these to your .env.local file and Vercel dashboard:
// VITE_SUPABASE_URL=your_project_url
// VITE_SUPABASE_ANON_KEY=your_anon_key

// Get env vars from Vite (works in browser) or process.env (works in Node)
const getEnvVar = (key: string): string => {
  // Try Vite's import.meta.env first
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key] || '';
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Using mock auth service fallback.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for database tables
export interface Profile {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  location: string;
  role: 'developer' | 'admin';
  created_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  key: string;
  status: 'pending' | 'active' | 'revoked';
  created_at: string;
}

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  if (getEnvVar('VITE_USE_MOCK_AUTH') === 'true') return false;
  return Boolean(supabaseUrl && supabaseAnonKey);
};
