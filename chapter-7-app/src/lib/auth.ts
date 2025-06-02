import bcrypt from 'bcrypt'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { supabase } from '@/lib/supabase-client'
import { ExtendedJWT, ExtendedUser } from '@/types/auth'

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      provider: string
    }
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          provider: 'google',
        }
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Supabase에서 사용자 정보 가져오기
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single()

        if (error || !user || !user.password) {
          return null
        }

        // 비밀번호 확인
        const passwordMatch = await bcrypt.compare(credentials.password, user.password)

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          provider: 'credential',
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Google Provider를 통한 로그인일 경우에만 실행
      if (account?.provider === 'google' && profile) {
        const email = profile.email as string;
        const name = profile.name as string;
        // Get image from profile - Google OAuth may include it in various properties
        const googleProfile = profile as { image?: string; picture?: string };
        const image = googleProfile.image || googleProfile.picture || null;
        
        // Supabase에서 해당 이메일을 가진 사용자 확인
        const { data: existingUser, error: findError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();
          
        if (findError || !existingUser) {
          // 사용자가 없으면 새로 생성
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([
              {
                email,
                name,
                image,
                provider: 'google',
              }
            ])
            .select()
            .single();
            
          if (createError) {
            console.error('Failed to create user:', createError);
            return false;
          }
          
          // 생성된 사용자의 ID를 user 객체에 할당
          if (newUser) {
            user.id = newUser.id;
          }
        } else {
          // 기존 사용자 정보 업데이트 (선택적)
          const { error: updateError } = await supabase
            .from('users')
            .update({
              name,
              image,
              provider: 'google'
            })
            .eq('email', email);
            
          if (updateError) {
            console.error('Failed to update user:', updateError);
          }
          
          // 기존 사용자의 ID를 user 객체에 할당
          user.id = existingUser.id;
        }
      }
      
      return true;
    },
    
    async jwt({ token, user, account }) {
      // 로그인시 사용자 정보를 토큰에 추가
      if (user) {
        const extendedUser = user as ExtendedUser;
        
        token.id = extendedUser.id;
        token.email = extendedUser.email;
        token.provider = extendedUser.provider || account?.provider || 'credential';
      }
      
      return token as ExtendedJWT;
    },
    
    async session({ session, token }) {
      // 세션에 확장된 사용자 정보 추가
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.provider = token.provider as string;
      }
      
      return session;
    }
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
} 