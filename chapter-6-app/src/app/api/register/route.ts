import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { hash } from "bcrypt"
import { supabase } from "@/lib/supabase-client"

// 회원가입 요청 데이터 유효성 검사 스키마
const registerSchema = z.object({
  name: z
    .string()
    .min(2, { message: "이름은 최소 2자 이상이어야 합니다." })
    .max(50, { message: "이름은 최대 50자까지 가능합니다." }),
  email: z
    .string()
    .min(1, { message: "이메일을 입력해주세요." })
    .email({ message: "유효한 이메일 주소를 입력해주세요." }),
  password: z
    .string()
    .min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." })
    .max(100, { message: "비밀번호는 최대 100자까지 가능합니다." }),
  provider: z
    .enum(["credentials", "google"])
    .optional()
    .default("credentials")
})
  .refine(
    (data) => {
      // credentials 제공자인 경우에만 비밀번호 검증
      if (data.provider === "credentials") {
        return data.password.length >= 6;
      }
      // 다른 제공자는 비밀번호 검증 생략
      return true;
    },
    {
      message: "이메일 로그인 시 비밀번호는 최소 6자 이상이어야 합니다.",
      path: ["password"],
    }
  );

// 회원가입 요청 데이터 타입
type RegisterRequest = z.infer<typeof registerSchema>

/**
 * 회원가입 요청을 처리하는 API 라우트
 * @param req 요청 객체
 * @returns 응답 객체
 */
export async function POST(req: NextRequest) {
  try {
    // 요청 본문에서 데이터 추출
    const body = await req.json()
    
    // 데이터 유효성 검사
    const result = registerSchema.safeParse(body)
    
    // 유효성 검사 실패 시
    if (!result.success) {
      const errorMessages = result.error.issues.map(error => {
        return {
          path: error.path.join('.'),
          message: error.message
        }
      })
      
      return NextResponse.json(
        { 
          success: false, 
          message: "입력 데이터가 유효하지 않습니다.", 
          errors: errorMessages 
        },
        { status: 400 }
      )
    }
    
    // 유효성 검사 통과 시 - 검증된 데이터
    const { name, email, password, provider } = result.data
    
    // 비밀번호 해싱 처리
    let hashedPassword: string | null = null;
    
    // credentials 제공자인 경우에만 비밀번호 해싱
    if (provider === "credentials") {
      // 추가 비밀번호 강도 검사 (선택적)
      if (password.length < 6) {
        return NextResponse.json(
          { 
            success: false, 
            message: "비밀번호는 최소 6자 이상이어야 합니다." 
          },
          { status: 400 }
        )
      }
      
      // 비밀번호 해싱 (bcrypt의 기본 salt rounds는 10)
      hashedPassword = await hash(password, 10)
    }
    
    // 이메일 중복 확인
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .single()
    
    // 이메일이 이미 존재하는 경우
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: "이미 사용 중인 이메일입니다." 
        },
        { status: 409 } // 409 Conflict
      )
    }
    
    // 에러가 있지만 PGRST116(데이터 없음) 에러가 아닌 경우 - 다른 DB 오류
    if (findError && findError.code !== "PGRST116") {
      console.error("이메일 중복 확인 중 오류 발생:", findError)
      return NextResponse.json(
        { 
          success: false, 
          message: "회원가입 처리 중 오류가 발생했습니다." 
        },
        { status: 500 }
      )
    }
    
    // 사용자 생성 로직 구현
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          provider,
          // image 필드는 선택적으로 추가 가능
        }
      ])
      .select("id, name, email, provider, created_at")
      .single()
    
    // 사용자 생성 중 오류 발생
    if (createError) {
      console.error("사용자 생성 중 오류 발생:", createError)
      return NextResponse.json(
        { 
          success: false, 
          message: "오류가 발생했습니다." 
        },
        { status: 500 }
      )
    }
    
    // 사용자 생성 성공
    return NextResponse.json(
      { 
        success: true, 
        message: "회원가입이 완료되었습니다.",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          provider: newUser.provider,
          created_at: newUser.created_at
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("회원가입 처리 중 오류 발생:", error)
    
    return NextResponse.json(
      { success: false, message: "오류가 발생했습니다." },
      { status: 500 }
    )
  }
} 