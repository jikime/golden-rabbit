import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"
import { supabase } from "./supabase-client"

/**
 * 서버 컴포넌트에서 현재 세션 정보를 가져오는 함수
 * @returns 현재 세션 정보 또는 null
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * 서버 컴포넌트에서 현재 로그인된 사용자 정보를 가져오는 함수
 * @returns 현재 로그인된 사용자 정보 또는 null
 */
export async function getCurrentUser() {
  try {
    const session = await getSession()
    
    // 세션이 없으면 null 반환
    if (!session?.user?.email) {
      return null
    }
    
    // Supabase에서 사용자 정보 가져오기
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", session.user.email)
      .single()
    
    if (error || !data) {
      console.error("사용자 정보 조회 오류:", error)
      return null
    }
    
    return {
      ...data,
      // 민감한 정보 제거
      password: undefined
    }
  } catch (error) {
    console.error("getCurrentUser 오류:", error)
    return null
  }
}

/**
 * 사용자가 인증되었는지 확인하는 함수
 * @returns 인증 여부
 */
export async function isAuthenticated() {
  const session = await getSession()
  return !!session?.user
}

/**
 * 서버 액션에서 인증 여부를 확인하고, 인증되지 않은 경우 에러를 발생시키는 함수
 * @throws {Error} 인증되지 않은 경우 에러 발생
 */
export async function requireAuth() {
  const isAuthed = await isAuthenticated()
  
  if (!isAuthed) {
    throw new Error("인증이 필요합니다.")
  }
}

/**
 * 사용자 ID로 사용자 정보를 가져오는 함수
 * @param userId 사용자 ID
 * @returns 사용자 정보 또는 null
 */
export async function getUserById(userId: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()
    
    if (error || !data) {
      console.error("사용자 정보 조회 오류:", error)
      return null
    }
    
    return {
      ...data,
      // 민감한 정보 제거
      password: undefined
    }
  } catch (error) {
    console.error("getUserById 오류:", error)
    return null
  }
} 