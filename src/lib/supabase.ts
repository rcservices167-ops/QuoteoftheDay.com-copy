import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Quote {
  id: string;
  quote_text: string;
  author: string;
  topic: string;
  created_at: string;
  view_count?: number;
  reaction_count?: number;
}

export interface Visitor {
  id: string;
  ip_address: string | null;
  location: string | null;
  user_agent: string | null;
  visited_at: string;
  selected_topic: string;
  quote_viewed_id: string | null;
  user_identifier?: string | null;
}

export interface QuoteReaction {
  id: string;
  quote_id: string;
  visitor_id: string;
  user_identifier: string;
  reaction_type: 'love' | 'like' | 'dislike' | 'share';
  created_at: string;
}

export interface UserStreak {
  id: string;
  user_identifier: string;
  current_streak: number;
  longest_streak: number;
  last_visit_date: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  last_login: string | null;
}

export function getUserIdentifier(): string {
  let identifier = localStorage.getItem('user_identifier');
  if (!identifier) {
    identifier = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user_identifier', identifier);
  }
  return identifier;
}
