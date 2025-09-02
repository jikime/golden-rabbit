import { createClient } from "@supabase/supabase-js"

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Supabase 클라이언트 인스턴스 생성 (싱글톤 패턴)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 환경 변수 설정 확인 함수
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// 데이터베이스 연결 테스트 함수
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from("posts").select("count").limit(1)
    if (error) throw error
    return { success: true, message: "Supabase 연결 성공" }
  } catch (error) {
    return { success: false, message: `Supabase 연결 실패: ${error}` }
  }
}
