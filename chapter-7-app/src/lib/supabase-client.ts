import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 설정
// 환경 변수에서 URL과 anon key를 가져옵니다
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 타입 정의
export type Todo = {
  id: string;
  content: string;
  is_completed: boolean;
  user_id: number | null;
  created_at: string;
  updated_at: string;
};

export default supabase;
