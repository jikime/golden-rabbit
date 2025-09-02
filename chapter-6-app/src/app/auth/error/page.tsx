"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string>("")
  
  useEffect(() => {
    // URL에서 에러 코드 및 메시지 가져오기
    const error = searchParams.get("error")
    
    // 에러 코드에 따른 메시지 설정
    if (error) {
      switch (error) {
        case "Configuration":
          setErrorMessage("서버 설정에 문제가 있습니다. 관리자에게 문의해주세요.")
          break
        case "AccessDenied":
          setErrorMessage("접근이 거부되었습니다. 권한이 없습니다.")
          break
        case "Verification":
          setErrorMessage("이메일 인증에 실패했습니다. 다시 시도해주세요.")
          break
        case "OAuthSignin":
        case "OAuthCallback":
        case "OAuthCreateAccount":
        case "OAuthAccountNotLinked":
          setErrorMessage("소셜 로그인 과정에서 문제가 발생했습니다. 다른 방법으로 로그인해주세요.")
          break
        case "EmailCreateAccount":
        case "EmailSignin":
          setErrorMessage("이메일 로그인 과정에서 문제가 발생했습니다. 다시 시도해주세요.")
          break
        case "CredentialsSignin":
          setErrorMessage("이메일 또는 비밀번호가 올바르지 않습니다.")
          break
        case "SessionRequired":
          setErrorMessage("이 페이지에 접근하려면 로그인이 필요합니다.")
          break
        default:
          setErrorMessage("인증 과정에서 문제가 발생했습니다. 다시 시도해주세요.")
      }
    } else {
      setErrorMessage("알 수 없는 오류가 발생했습니다. 다시 시도해주세요.")
    }
  }, [searchParams])

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-background border border-border rounded-lg shadow-lg">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-destructive/10 rounded-full">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">인증 오류</h1>
          <p className="text-muted-foreground">{errorMessage}</p>
        </div>
        
        <div className="space-y-4 pt-4">
          <Button asChild className="w-full">
            <Link href="/auth/signin">로그인 페이지로 돌아가기</Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 