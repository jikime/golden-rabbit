import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

// 회원가입 요청 타입 정의
interface RegisterParams {
  name: string;
  email: string;
  password?: string;
  provider: 'credential' | 'google';
}

// 회원가입 응답 타입 정의
interface RegisterResponse {
  success: boolean;
  message: string;
}

// 로그인 요청 타입 정의
interface LoginParams {
  email?: string;
  password?: string;
  provider: 'credentials' | 'google';
}

// 로그인 응답 타입 정의
interface LoginResponse {
  success: boolean;
  message: string;
}

// 로그아웃 응답 타입 정의
interface LogoutResponse {
  success: boolean;
}

export const useAuth = () => {
  const { data: session, status, update } = useSession();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // 회원가입 함수
  const register = async (params: RegisterParams): Promise<RegisterResponse> => {
    setRegisterLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: data.error || '회원가입에 실패했습니다.',
        };
      }

      return {
        success: true,
        message: data.message || '회원 가입이 완료되었습니다.',
      };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: '서버 오류가 발생했습니다.',
      };
    } finally {
      setRegisterLoading(false);
    }
  };

  // 로그인 함수
  const login = async (params: LoginParams): Promise<LoginResponse> => {
    setLoginLoading(true);
    try {
      // next-auth의 signIn 함수 호출
      const result = await signIn(params.provider, {
        // credential일 경우 email, password 전달
        ...(params.provider === 'credentials' && {
          email: params.email,
          password: params.password,
        }),
        // 리다이렉트 방지 (직접 처리하기 위함)
        redirect: false,
        // 로그인 성공 후 리다이렉트할 URL
        callbackUrl: '/',
      });

      // 로그인 결과 처리
      if (result?.error) {
        return {
          success: false,
          message: result.error === 'CredentialsSignin' 
            ? '이메일 또는 비밀번호가 올바르지 않습니다.' 
            : '로그인 중 오류가 발생했습니다.',
        };
      }

      if (result?.url) {
        return {
          success: true,
          message: '로그인이 완료되었습니다.',
        };
      }

      return {
        success: false,
        message: '알 수 없는 오류가 발생했습니다.',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: '로그인 중 오류가 발생했습니다.',
      };
    } finally {
      setLoginLoading(false);
    }
  };
  
  // 로그아웃 함수
  const logout = async (): Promise<LogoutResponse> => {
    setLogoutLoading(true);
    try {
      // next-auth의 signOut 함수 호출
      await signOut({ 
        redirect: false,
        callbackUrl: '/auth/signin'
      });
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false
      };
    } finally {
      setLogoutLoading(false);
    }
  };

  return {
    session,
    user: session?.user,
    isLoading,
    isAuthenticated,
    signIn,
    signOut,
    update,
    register,
    registerLoading,
    login,
    loginLoading,
    logout,
    logoutLoading,
  };
}; 