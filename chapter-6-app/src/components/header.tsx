"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { LogOut, User, Settings, UserCircle } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export function Header() {
  const { data: session, status } = useSession()
  const { logout } = useAuth()
  const router = useRouter()
  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated"

  // 사용자 이름의 첫 글자 가져오기
  const getInitials = () => {
    if (session?.user?.name) {
      return session.user.name.charAt(0).toUpperCase();
    } else if (session?.user?.email) {
      return session.user.email.charAt(0).toUpperCase();
    }
    return "U"; // 기본값
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        {/* 왼쪽: 로고 및 타이틀 */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">나만의 AI 비서</h1>
        </div>

        {/* 오른쪽: 로그인/로그아웃 버튼 */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            <Button variant="ghost" disabled>
              로딩 중...
            </Button>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                    <Avatar className="h-8 w-8">
                      {session.user?.image ? (
                        <AvatarImage src={session.user.image} alt={session.user?.name || "사용자"} />
                      ) : null}
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{session.user?.name || session.user?.email}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>프로필</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>설정</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>로그아웃</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button asChild>
              <Link href="/auth/signin">로그인</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
} 