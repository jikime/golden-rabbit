import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { supabase } from "./supabase-client";

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
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        
        // If using Google, store the access token
        if (account?.provider === "google") {
          token.accessToken = account.access_token;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}; 