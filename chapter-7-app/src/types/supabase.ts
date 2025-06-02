export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password: string | null
          name: string
          provider: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          password?: string | null
          name: string
          provider?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          password?: string | null
          name?: string
          provider?: string
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          expires: string
          session_token: string
        }
        Insert: {
          id?: string
          user_id: string
          expires: string
          session_token: string
        }
        Update: {
          id?: string
          user_id?: string
          expires?: string
          session_token?: string
        }
      }
      conversations: {
        Row: {
          id: number
          title: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: number
          title?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: number
          title?: string | null
          user_id?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: number
          conversation_id: number
          user_id: string | null
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at: string
        }
        Insert: {
          id?: number
          conversation_id: number
          user_id?: string | null
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at?: string
        }
        Update: {
          id?: number
          conversation_id?: number
          user_id?: string | null
          role?: 'user' | 'assistant' | 'system'
          content?: string
          created_at?: string
        }
      }
    }
    Views: {
      [viewName: string]: {
        Row: Record<string, any>
      }
    }
    Functions: {
      [functionName: string]: {
        Args: Record<string, any>
        Returns: any
      }
    }
    Enums: {
      [enumName: string]: string[]
    }
  }
} 