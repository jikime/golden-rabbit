import { createClient } from '@supabase/supabase-js';

// Check if environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single supabase client for the entire app
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// 타입 안전성을 위한 인터페이스
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string | null;
          email: string;
          image: string | null;
          username: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          email: string;
          image?: string | null;
          username?: string | null;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: number;
          title: string | null;
          created_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: number;
          title?: string | null;
          created_at?: string;
          user_id?: string | null;
        };
      };
      messages: {
        Row: {
          id: number;
          conversation_id: number;
          role: 'user' | 'assistant' | 'system';
          content: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          conversation_id: number;
          role: 'user' | 'assistant' | 'system';
          content: string;
          created_at?: string;
        };
      };
    };
  };
}; 