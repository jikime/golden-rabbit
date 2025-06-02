import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"
import { redirect } from "next/navigation"

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/signin")
  }
  
  return user
}

// 인증 오류 응답 생성 유틸리티 함수
export function createAuthError(message = "Authentication required") {
  return new Response(
    JSON.stringify({
      error: message,
    }),
    { 
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  )
}

// 사용자 ID 가져오기 (API 라우트에서 사용)
export async function getUserIdFromSession() {
  const user = await getCurrentUser()
  
  if (!user || !user.id) {
    return null
  }
  
  return user.id
} 