import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { supabase } from "./supabase-client";
import { User } from "next-auth";
import { Session } from "next-auth";

// NextAuth User 타입 확장
interface ExtendedUser extends User {
  provider?: string;
}

// 세션 사용자 타입 확장
interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    provider?: string;
  };
  accessToken?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. email, password 받기
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // 2. supabase의 users 테이블에서 email로 사용자 조회
          const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", credentials.email)
            .single();

          // 사용자가 없는 경우
          if (error || !user) {
            console.log("User not found:", credentials.email);
            return null;
          }

          // 3. 비밀번호 검증
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password || ''
          );

          // 4. 비밀번호가 일치하지 않는 경우
          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.email);
            return null;
          }

          // 5. 모든 검증이 통과되면 사용자 정보 반환
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            provider: user.provider,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    // 1. signIn 콜백 함수: Google 로그인 처리
    async signIn({ user, account, profile }) {
      // Google Provider를 통한 로그인인 경우에만 처리
      if (account?.provider === "google" && profile) {
        try {
          // 이메일과 이름 가져오기
          const email = profile.email;
          const name = profile.name;
          // Google OAuth profile의 타입은 OAuthUserProfile이므로 타입 단언 사용
          const googleProfile = profile as { picture?: string };
          const image = googleProfile.picture || "";
          
          if (!email) {
            console.error("Google profile missing email");
            return false;
          }
          
          // supabase에서 해당 이메일을 가진 사용자 확인
          const { data: existingUser, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();
          
          if (userError && userError.code !== 'PGRST116') { // PGRST116: 결과가 없음
            console.error("Error checking existing user:", userError);
            return false;
          }
          
          // 사용자가 존재하지 않는 경우, 새로 생성
          if (!existingUser) {
            const { error: insertError } = await supabase
              .from("users")
              .insert([
                {
                  email,
                  name,
                  image,
                  provider: "google",
                }
              ]);
            
            if (insertError) {
              console.error("Error creating user:", insertError);
              return false;
            }
            
            // 새로 생성된 사용자 정보 가져오기
            const { data: newUser, error: fetchError } = await supabase
              .from("users")
              .select("*")
              .eq("email", email)
              .single();
            
            if (fetchError || !newUser) {
              console.error("Error fetching new user:", fetchError);
              return false;
            }
            
            // user 객체에 ID 할당
            (user as ExtendedUser).id = newUser.id;
          } else {
            // 사용자가 이미 존재하는 경우, 프로필 정보 업데이트
            const { error: updateError } = await supabase
              .from("users")
              .update({
                name,
                image,
                provider: "google",
              })
              .eq("email", email);
            
            if (updateError) {
              console.error("Error updating user:", updateError);
              // 업데이트 실패해도 로그인은 허용
            }
            
            // user 객체에 ID 할당
            (user as ExtendedUser).id = existingUser.id;
          }
        } catch (error) {
          console.error("Error in Google sign in:", error);
          return false;
        }
      }
      
      return true;
    },
    
    // 2. jwt 콜백 함수: 토큰에 사용자 정보 저장
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        
        // If using Google, store the access token
        if (account?.provider === "google") {
          token.accessToken = account.access_token;
          token.provider = "google";
        } else if ((user as ExtendedUser).provider) {
          token.provider = (user as ExtendedUser).provider;
        }
      }
      return token;
    },
    
    // 3. session 콜백 함수: 세션에 사용자 정보 저장
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        
        // 타입 안전하게 provider 속성 추가
        (session.user as any).provider = token.provider as string;
        (session as any).accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}; 