"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages: Record<string, string> = {
    default: "인증 과정에서 오류가 발생했습니다.",
    accessdenied: "접근이 거부되었습니다.",
    verification: "이메일 인증이 완료되지 않았습니다.",
    signin: "로그인을 먼저 완료해주세요.",
    oauthcallback: "소셜 로그인 과정에서 오류가 발생했습니다.",
    oauthcreate: "소셜 계정을 생성하는 과정에서 오류가 발생했습니다.",
    credentialssignin: "이메일 또는 비밀번호가 일치하지 않습니다.",
  }

  const errorMessage = error ? errorMessages[error] || errorMessages.default : errorMessages.default

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>인증 오류</CardTitle>
          <CardDescription>인증 과정에서 문제가 발생했습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-destructive text-lg font-medium">{errorMessage}</div>
            <p className="text-muted-foreground">인증을 다시 시도하거나 다른 방법으로 로그인해 주세요.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button asChild variant="outline">
            <Link href="/">홈으로</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signin">로그인 페이지로</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 