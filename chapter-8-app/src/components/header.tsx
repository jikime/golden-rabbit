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
import { User, LogOut, Settings, LogIn, Rocket } from 'lucide-react'

export function Header() {
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  
  return (
    <header className="border-b bg-background">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            <span className="text-xl font-bold">나만의 비서</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">AI 채팅</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/todo">할 일 목록</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/instagram">인스타그램</Link>
            </Button>
          </nav>
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