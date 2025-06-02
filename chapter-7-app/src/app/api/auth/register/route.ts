import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { supabase } from "@/lib/supabase-client"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    // 필수 필드 검증
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "이름, 이메일, 비밀번호는 필수 항목입니다." },
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "유효한 이메일 형식이 아닙니다." },
        { status: 400 }
      )
    }

    // 비밀번호 강도 검증 (최소 6자 이상)
    if (password.length < 6) {
      return NextResponse.json(
        { message: "비밀번호는 최소 8자 이상이어야 합니다." },
        { status: 400 }
      )
    }

    // 이메일 중복 확인
    const { data: existingUser } = await supabase
      .from("users")
      .select()
      .eq("email", email)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { message: "이미 사용 중인 이메일입니다." },
        { status: 409 }
      )
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12)

    // 사용자 생성
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        name,
        email,
        password: hashedPassword,
        provider: "credential"
      })
      .select()
      .single()

    if (error) {
      console.error("사용자 생성 오류:", error)
      return NextResponse.json(
        { message: "사용자 등록 중 오류가 발생했습니다." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "회원가입이 완료되었습니다." },
      { status: 201 }
    )
  } catch (error) {
    console.error("회원가입 API 오류:", error)
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
} 