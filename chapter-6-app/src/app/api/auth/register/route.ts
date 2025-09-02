import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcrypt"
import { supabase } from "@/lib/supabase-client"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    // 필수 필드 검증
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "모든 필드를 입력해주세요." },
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "유효한 이메일 주소를 입력해주세요." },
        { status: 400 }
      )
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "비밀번호는 최소 6자 이상이어야 합니다." },
        { status: 400 }
      )
    }

    // 이메일 중복 확인
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "이미 사용 중인 이메일입니다." },
        { status: 400 }
      )
    }

    // 비밀번호 해싱
    const hashedPassword = await hash(password, 10)

    // 사용자 생성
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          provider: "credentials",
        },
      ])
      .select()

    if (error) {
      console.error("사용자 등록 오류:", error)
      return NextResponse.json(
        { success: false, message: "사용자 등록에 실패했습니다." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: "회원가입이 완료되었습니다." },
      { status: 201 }
    )
  } catch (error) {
    console.error("사용자 등록 오류:", error)
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
} 