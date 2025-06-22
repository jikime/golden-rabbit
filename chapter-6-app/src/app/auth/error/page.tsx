"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    default: "인증 중 오류가 발생했습니다.",
    configuration: "서버 구성 오류가 발생했습니다.",
    accessdenied: "로그인이 거부되었습니다.",
    verification: "이메일 확인 링크가 만료되었거나 이미 사용되었습니다.",
    oauthcallback: "OAuth 제공자에서 오류가 반환되었습니다.",
    oauthcreateaccount: "OAuth 계정을 생성하는 동안 오류가 발생했습니다.",
    oauthsignin: "OAuth 제공자로 로그인하는 동안 오류가 발생했습니다.",
    emailcreateaccount: "이메일 계정을 생성하는 동안 오류가 발생했습니다.",
    emailsignin: "이메일 로그인 링크를 보내는 동안 오류가 발생했습니다.",
    credentialssignin: "로그인 실패. 제공한 자격 증명이 올바른지 확인하세요.",
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.default : errorMessages.default;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>인증 오류</CardTitle>
          <CardDescription>로그인 과정에서 문제가 발생했습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">{errorMessage}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/auth/signin">로그인 페이지로 돌아가기</Link>
          </Button>
          <Button asChild>
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 