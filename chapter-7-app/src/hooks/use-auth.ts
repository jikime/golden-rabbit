"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { toast } from "sonner"

export function useAuth() {
  const { data: session, status, update } = useSession()
  const isAuthenticated = status === "authenticated"
  const isLoading = status === "loading"

  const login = async (credentials?: { email: string; password: string }, provider?: string) => {
    try {
      if (provider) {
        return await signIn(provider, { callbackUrl: "/" })
      }
      
      if (credentials) {
        const result = await signIn("credentials", {
          redirect: false,
          email: credentials.email,
          password: credentials.password,
        })

        if (result?.error) {
          toast.error("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.")
          return false
        }

        return true
      }
    } catch (error) {
      toast.error("로그인 중 오류가 발생했습니다.")
      return false
    }
  }

  const register = async (userData: { name: string; email: string; password: string }) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || "회원가입에 실패했습니다.")
        return false
      }

      return true
    } catch (error) {
      toast.error("회원가입 중 오류가 발생했습니다.")
      return false
    }
  }

  const logout = async () => {
    try {
      await signOut({ callbackUrl: "/" })
      return true
    } catch (error) {
      toast.error("로그아웃 중 오류가 발생했습니다.")
      return false
    }
  }

  return {
    session,
    user: session?.user,
    status,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    update,
  }
} 