"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { User, LogOut, Settings, LogIn } from 'lucide-react'

export function Header() {
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  
  return (
    <header className="border-b bg-background">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">AI 챗봇</span>
          </Link>
          <nav className="hidden md:flex gap-4">
            <Link 
              href="/" 
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              홈
            </Link>
            {isAuthenticated && (
              <Link 
                href="/chat" 
                className="text-sm font-medium hover:underline underline-offset-4"
              >
                채팅
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">로딩 중...</div>
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.name && (
                      <p className="font-medium">{user.name}</p>
                    )}
                    {user?.email && (
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>프로필</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => logout()}
                  className="text-red-500 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/auth/signin">
                <LogIn className="mr-2 h-4 w-4" />
                로그인
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
} 