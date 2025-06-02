"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { GoogleIcon } from "../signin/google-icon"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { signupSchema } from "@/lib/schemas"

// Form type definition
type SignupFormValues = z.infer<typeof signupSchema> & { name: string }

export default function SignUp() {
  const router = useRouter()
  const { register: registerUser, login } = useAuth()
  
  // Initialize react-hook-form with zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    }, 
  })

  const onSubmit = async (data: SignupFormValues) => {
    console.log(data)
    try {
      const success = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      })
      
      if (success) {
        toast.success("회원가입이 완료되었습니다. 로그인해주세요.")
        router.push("/auth/signin")
      }
    } catch (error) {
      setError("root", {
        message: "회원가입 중 오류가 발생했습니다.",
      })
      toast.error("회원가입 중 오류가 발생했습니다.")
    }
  }

  const handleGoogleSignup = async () => {
    try {
      await login(undefined, "google")
    } catch (error) {
      toast.error("Google 로그인 중 오류가 발생했습니다.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 pb-2">
          <h1 className="text-2xl font-bold tracking-tight">회원 가입</h1>
          <p className="text-sm text-muted-foreground">아래 정보를 입력하여 계정을 만드세요</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                이름
              </label>
              <Input 
                id="name" 
                {...register("name", { required: "이름을 입력해주세요" })}
                type="text" 
                placeholder="홍길동" 
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                이메일
              </label>
              <Input 
                id="email" 
                {...register("email")}
                type="email" 
                placeholder="m@example.com" 
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                비밀번호
              </label>
              <Input 
                id="password" 
                {...register("password")}
                type="password" 
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                비밀번호 확인
              </label>
              <Input 
                id="confirmPassword" 
                {...register("confirmPassword")}
                type="password" 
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
            {errors.root && (
              <p className="text-sm text-red-500">{errors.root.message}</p>
            )}
            <Button 
              type="submit" 
              className="w-full bg-black text-white hover:bg-black/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "처리 중..." : "가입하기"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">또는</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleGoogleSignup}
            disabled={isSubmitting}
          >
            <GoogleIcon className="mr-2 h-4 w-4" />
            구글 계정으로 가입
          </Button>

          <div className="text-center text-sm">
            이미 계정이 있으신가요?{" "}
            <Link href="/auth/signin" className="font-medium underline">
              로그인
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
