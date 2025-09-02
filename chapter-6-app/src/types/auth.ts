import { User as NextAuthUser, Session as NextAuthSession } from "next-auth"

// 사용자 기본 정보 타입
export interface UserBasic {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

// 데이터베이스 사용자 타입 (Supabase users 테이블과 일치)
export interface User extends UserBasic {
  provider?: string
  created_at?: string
  updated_at?: string
}

// NextAuth 사용자 타입 확장
export interface AuthUser extends NextAuthUser {
  id: string
}

// NextAuth 세션 타입 확장
export interface AuthSession extends NextAuthSession {
  user: AuthUser
}

// 로그인 폼 데이터 타입
export interface LoginFormData {
  email: string
  password: string
}

// 회원가입 폼 데이터 타입
export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

// 인증 상태 타입
export interface AuthState {
  user: AuthUser | null
  status: "loading" | "authenticated" | "unauthenticated"
  isLoading: boolean
  isAuthenticated: boolean
}

// 인증 관련 API 응답 타입
export interface AuthApiResponse {
  success: boolean
  message: string
  user?: UserBasic
} 