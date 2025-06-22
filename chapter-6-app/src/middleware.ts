import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path requires authentication
  const isApiAuthRoute = pathname.startsWith("/api/auth");
  const isAuthRoute = pathname.startsWith("/auth");
  const isApiRoute = pathname.startsWith("/api");
  
  // Skip authentication check for auth routes
  if (isApiAuthRoute || isAuthRoute) {
    return NextResponse.next();
  }
  
  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Redirect to sign in if accessing the home page without authentication
  if (pathname === "/" && !token) {
    const url = new URL("/auth/signin", request.url);
    return NextResponse.redirect(url);
  }
  
  // Return 401 for API routes that require authentication
  if (isApiRoute && !token) {
    if (pathname.startsWith("/api/chat") || pathname.startsWith("/api/conversations")) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}; 