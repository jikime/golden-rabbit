import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

// 보호가 필요한 경로 목록
const protectedPaths = [
  '/chat',
  '/profile',
]

// 공개 API 경로 (인증 필요 없음)
const publicApiPaths = [
  '/api/auth',
]

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  
  // API 경로 중 공개 API인 경우 건너뜀
  if (path.startsWith('/api/') && publicApiPaths.some(p => path.startsWith(p))) {
    return NextResponse.next()
  }
  
  // 보호된 경로인지 확인
  const isProtectedPath = protectedPaths.some(
    (protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`)
  )
  
  // API 요청에 대한 보호
  const isApiPath = path.startsWith('/api/')
  
  if (!isProtectedPath && !isApiPath) {
    return NextResponse.next()
  }
  
  // JWT 토큰 검증
  const token = await getToken({ req })
  
  // 인증되지 않은 사용자가 보호된 경로에 접근한 경우
  if (!token) {
    // API 요청의 경우 401 반환
    if (isApiPath) {
      return new NextResponse(
        JSON.stringify({ error: '인증이 필요합니다.' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      )
    }
    
    // 일반 경로의 경우 로그인 페이지로 리다이렉트
    const url = new URL('/auth/signin', req.url)
    url.searchParams.set('callbackUrl', encodeURI(req.url))
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
}

// 미들웨어가 적용될 경로 지정
export const config = {
  matcher: [
    // 모든 API 요청
    '/api/:path*',
    // 보호된 페이지에 대한 요청
    ...protectedPaths.map(path => path),
    ...protectedPaths.map(path => `${path}/:path*`),
  ]
} 