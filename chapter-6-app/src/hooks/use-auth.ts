"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"
import type { AuthState, LoginFormData, RegisterFormData } from "@/types/auth"

// 로그인 결과 타입 정의
interface LoginResult {
  success: boolean;
  message: string;
  redirected?: boolean;
}

/**
 * 인증 관련 기능을 제공하는 커스텀 훅
 * @returns 인증 상태 및 인증 관련 함수들
 */
export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 인증 상태
  const authState: AuthState = {
    user: session?.user || null,
    status,
    isLoading: status === "loading" || isLoading,
    isAuthenticated: status === "authenticated",
  }

  /**
   * 로그인 함수 - 이메일/비밀번호 또는 소셜 로그인
   * @param emailOrData 이메일 문자열 또는 로그인 폼 데이터
   * @param password 비밀번호 (이메일/비밀번호 로그인 시 필수)
   * @param provider 로그인 제공자 (credentials, google 등)
   * @param callbackUrl 로그인 후 리다이렉트할 URL (기본값: /)
   * @returns 로그인 결과 객체 { success, message, redirected? }
   */
  const login = useCallback(
    async (
      emailOrData: string | LoginFormData,
      password?: string,
      provider: string = "credentials",
      callbackUrl = "/"
    ): Promise<LoginResult> => {
      try {
        setIsLoading(true)
        setError(null)

        let result;

        if (provider === "credentials") {
          // 이메일/비밀번호 로그인
          let email: string;
          let pwd: string;

          if (typeof emailOrData === 'string') {
            // 이메일과 비밀번호를 개별 인자로 받은 경우
            email = emailOrData;
            pwd = password || '';
          } else {
            // LoginFormData 객체로 받은 경우
            email = emailOrData.email;
            pwd = emailOrData.password;
          }

          if (!email || !pwd) {
            setError("이메일과 비밀번호를 입력해주세요.");
            return {
              success: false,
              message: "이메일과 비밀번호를 입력해주세요."
            };
          }

          result = await signIn("credentials", {
            redirect: false,
            email,
            password: pwd,
          });
        } else {
          // 소셜 로그인
          await signIn(provider, {
            callbackUrl,
          });
          // 소셜 로그인은 리다이렉트되므로 여기서 함수가 종료됨
          return {
            success: true,
            message: `${provider} 로그인 페이지로 이동합니다.`,
            redirected: true
          };
        }

        // 로그인 결과 처리 (credentials 로그인의 경우)
        if (result?.error) {
          const errorMessage = result.error === "CredentialsSignin" 
            ? "이메일 또는 비밀번호가 올바르지 않습니다." 
            : result.error;
            
          setError(errorMessage);
          return {
            success: false,
            message: errorMessage
          };
        }

        if (result?.ok) {
          // 로그인 성공
          router.push(callbackUrl);
          router.refresh();
          return {
            success: true,
            message: "로그인에 성공했습니다."
          };
        }

        // 기타 예상치 못한 결과
        return {
          success: false,
          message: "로그인 처리 중 오류가 발생했습니다."
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "로그인 중 오류가 발생했습니다.";
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage
        };
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  /**
   * 구글 로그인
   * @param callbackUrl 로그인 후 리다이렉트할 URL (기본값: /)
   * @returns 로그인 결과 객체
   */
  const loginWithGoogle = useCallback(
    async (callbackUrl = "/") => {
      return login("", "", "google", callbackUrl);
    },
    [login]
  );

  /**
   * 회원가입
   * @param data 회원가입 폼 데이터
   * @returns 회원가입 및 로그인 결과
   */
  const register = useCallback(
    async (data: RegisterFormData) => {
      try {
        setIsLoading(true)
        setError(null)

        // 비밀번호 확인
        if (data.password !== data.confirmPassword) {
          setError("비밀번호가 일치하지 않습니다.")
          return {
            success: false,
            message: "비밀번호가 일치하지 않습니다."
          };
        }

        // 회원가입 API 호출
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          const errorMessage = result.message || "회원가입에 실패했습니다.";
          setError(errorMessage)
          return {
            success: false,
            message: errorMessage
          };
        }

        // 회원가입 성공 후 자동 로그인
        return await login(
          {
            email: data.email,
            password: data.password,
          },
          undefined,
          "credentials",
          "/"
        )
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "회원가입 중 오류가 발생했습니다.";
        setError(errorMessage)
        return {
          success: false,
          message: errorMessage
        };
      } finally {
        setIsLoading(false)
      }
    },
    [login]
  )

  /**
   * 로그아웃
   * @param callbackUrl 로그아웃 후 리다이렉트할 URL (기본값: /auth/signin)
   * @returns 로그아웃 결과 객체
   */
  const logout = useCallback(
    async (callbackUrl = "/auth/signin"): Promise<LoginResult> => {
      try {
        setIsLoading(true)
        await signOut({ redirect: false })
        router.push(callbackUrl)
        router.refresh()
        return {
          success: true,
          message: "로그아웃 되었습니다."
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "로그아웃 중 오류가 발생했습니다.";
        setError(errorMessage)
        return {
          success: false,
          message: errorMessage
        };
      } finally {
        setIsLoading(false)
      }
    },
    [router]
  )

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    ...authState,
    login,
    loginWithGoogle,
    register,
    logout,
    error,
    clearError,
  }
} 