import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"
import { supabase } from "./supabase-client"

export const authOptions: NextAuthOptions = {
  // 세션 관리 방식 설정 (JWT 사용)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  
  // 페이지 경로 설정
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  
  // 인증 제공자 설정
  providers: [
    // Google 로그인
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    }),
    
    // 이메일/비밀번호 로그인
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        // 이메일과 비밀번호가 제공되었는지 확인
        if (!credentials?.email || !credentials?.password) {
          throw new Error("이메일과 비밀번호를 입력해주세요.")
        }

        try {
          // Supabase에서 사용자 조회
          const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", credentials.email)
            .single()

          // 사용자를 찾지 못한 경우
          if (error || !user) {
            console.log("사용자를 찾을 수 없음:", credentials.email)
            return null
          }

          // 비밀번호 검증
          const isPasswordValid = await compare(credentials.password, user.password)

          // 비밀번호가 일치하지 않는 경우
          if (!isPasswordValid) {
            console.log("비밀번호 불일치:", credentials.email)
            return null
          }

          // 인증 성공: 사용자 정보 반환
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          }
        } catch (error) {
          console.error("로그인 인증 중 오류 발생:", error)
          return null
        }
      },
    }),
  ],
  
  // 콜백 함수 설정
  callbacks: {
    // signIn 콜백: 로그인 과정에서 추가 검증이나 처리를 수행
    async signIn({ account, profile }) {
      // Google 로그인인 경우에만 처리
      if (account?.provider === "google" && profile) {
        try {
          const email = profile.email
          const name = profile.name
          const image = profile.image
          
          console.log("Google 로그인 시도:", { email, name })
          
          // 이메일이 없는 경우 로그인 거부
          if (!email) {
            console.error("Google 로그인 실패: 이메일 정보가 없습니다.")
            return false
          }
          
          // Supabase에서 사용자 조회
          const { data: existingUser, error: findError } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single()
            
          // 사용자가 없는 경우 새로 생성
          if (findError && findError.code === "PGRST116") {
            console.log("새 사용자 등록:", email)
            
            const { data: newUser, error: createError } = await supabase
              .from("users")
              .insert([
                {
                  email,
                  name,
                  image,
                  provider: "google",
                },
              ])
              .select()
              .single()
              
            if (createError) {
              console.error("Google 사용자 등록 실패:", createError)
              return false
            }
            
            console.log("Google 사용자 등록 성공:", newUser?.email)
          } else if (findError) {
            console.error("Google 사용자 조회 중 오류:", findError)
            return false
          } else {
            console.log("기존 사용자 로그인:", existingUser?.email)
          }
          
          return true // 로그인 허용
        } catch (error) {
          console.error("Google 로그인 처리 중 오류:", error)
          return false
        }
      }
      
      // 다른 provider는 기본적으로 허용
      return true
    },
    
    // JWT 콜백: 토큰 생성/업데이트 시 호출
    async jwt({ token, user, account }) {
      try {
        // 사용자 정보가 있는 경우 (최초 로그인 또는 세션 갱신)
        if (user) {
          // 기본 사용자 정보를 토큰에 추가
          token.id = user.id
          token.email = user.email
          
          // Google 로그인인 경우
          if (account?.provider === "google") {
            // Supabase에서 사용자 정보 조회
            const { data: dbUser, error } = await supabase
              .from("users")
              .select("id, email, name, image, provider")
              .eq("email", user.email)
              .single()
              
            if (error) {
              console.error("JWT 생성 중 사용자 조회 오류:", error)
              // 오류가 발생해도 기본 토큰은 유지
              return token
            }
            
            if (dbUser) {
              // Supabase의 사용자 ID를 토큰에 저장
              token.id = dbUser.id
              token.dbEmail = dbUser.email // 데이터베이스에 저장된 이메일
              token.dbName = dbUser.name // 데이터베이스에 저장된 이름
              token.provider = dbUser.provider // 인증 제공자 정보
            }
          }
          // Credentials 로그인인 경우 (이미 authorize에서 ID가 설정됨)
          else if (account?.provider === "credentials") {
            // 추가 정보가 필요한 경우 여기에 코드 추가
            token.provider = "credentials"
          }
        }
        
        return token
      } catch (error) {
        console.error("JWT 콜백 처리 중 오류:", error)
        return token
      }
    },
    
    // 세션 콜백: 클라이언트에 전달될 세션 객체 생성
    async session({ session, token }) {
      try {
        // 토큰에서 세션으로 정보 복사
        if (token && session.user) {
          // 사용자 ID는 항상 포함
          session.user.id = token.id as string
          
          // 데이터베이스에서 가져온 정보 우선 사용
          if (token.dbEmail) {
            session.user.email = token.dbEmail as string
          }
          
          if (token.dbName) {
            session.user.name = token.dbName as string
          }
          
          // 인증 제공자 정보 추가
          session.user.provider = token.provider as string
          
          // 디버깅용 로그
          console.log("세션 생성:", {
            id: session.user.id,
            email: session.user.email,
            provider: session.user.provider
          })
        }
        
        return session
      } catch (error) {
        console.error("세션 콜백 처리 중 오류:", error)
        return session
      }
    },
  },
  
  // 디버그 모드 (개발 환경에서만 활성화)
  debug: process.env.NODE_ENV === "development",
}

// NextAuth 타입 확장
declare module "next-auth" {
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    provider?: string
  }
  
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      provider?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    dbEmail?: string
    dbName?: string
    provider?: string
  }
} 