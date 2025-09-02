import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

// 보호할 경로 목록
const protectedRoutes = ["/"]

// API 보호 경로 목록
const protectedApiRoutes = [
  "/api/chat",
  "/api/conversations",
]

// 인증이 필요하지 않은 경로 목록
const publicRoutes = [
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/api/auth",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 공개 경로는 항상 접근 허용
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }
  
  // JWT 토큰 확인
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  
  // API 경로 보호
  if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
    // 인증되지 않은 사용자의 API 접근 차단
    if (!token) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "인증이 필요합니다." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }
    return NextResponse.next()
  }
  
  // 보호된 페이지 경로 처리
  if (protectedRoutes.includes(pathname)) {
    // 인증되지 않은 사용자를 로그인 페이지로 리다이렉트
    if (!token) {
      const url = new URL("/auth/signin", request.url)
      url.searchParams.set("callbackUrl", encodeURI(request.url))
      return NextResponse.redirect(url)
    }
  }
  
  return NextResponse.next()
}

// 미들웨어가 적용될 경로 설정
export const config = {
  matcher: [
    /*
     * 다음 경로에 미들웨어 적용:
     * - 루트 경로 (/)
     * - /api/chat으로 시작하는 모든 경로
     * - /api/conversations으로 시작하는 모든 경로
     * - /auth로 시작하는 모든 경로 (인증 관련 페이지)
     */
    "/",
    "/api/chat/:path*",
    "/api/conversations/:path*",
    "/auth/:path*",
  ],
} 