"use client";

import Link from "next/link"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  
  // 로그아웃 처리 함수
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast.success("로그아웃되었습니다.");
      router.push("/auth/signin");
    } else {
      toast.error("로그아웃 중 오류가 발생했습니다.");
    }
  };
  
  // 사용자 이름의 첫 글자 가져오기 (아바타 폴백용)
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="p-4 h-16 border-b flex items-center justify-between">
      <div className="font-bold text-lg">나만의 AI비서</div>
      <div>
        {isLoading ? (
          // 로딩 중일 때는 아무것도 표시하지 않음
          null
        ) : isAuthenticated ? (
          // 인증된 사용자: 아바타와 드롭다운 메뉴 표시
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full p-0 h-10 w-10">
                <Avatar>
                  <AvatarImage src={user?.image || ""} alt={user?.name || "사용자"} />
                  <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // 인증되지 않은 사용자: 로그인 버튼 표시
          <Button variant="outline" asChild>
            <Link href="/auth/signin">로그인</Link>
          </Button>
        )}
      </div>
    </header>
  )
} 