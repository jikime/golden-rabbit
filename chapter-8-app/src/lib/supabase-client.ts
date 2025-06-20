import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Supabase 클라이언트 초기화를 위한 환경 변수 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 환경 변수가 설정되지 않은 경우 에러 메시지 출력
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.error(
      'Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정해주세요.'
    )
  }
}

// Supabase 클라이언트 생성
export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

// 특정 기능을 위한 편의 함수들
export const auth = supabase.auth 