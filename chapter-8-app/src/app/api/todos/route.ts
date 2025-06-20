import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch todos from Supabase
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase 조회 오류:", error);
      return NextResponse.json(
        { error: "할 일 목록을 가져오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ todos: data }, { status: 200 });
  } catch (error) {
    console.error("서버 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // a. 요청 본문에서 새 할 일 데이터를 읽어온다
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("JSON 파싱 오류:", error);
      return NextResponse.json(
        { error: "잘못된 JSON 형식입니다." },
        { status: 400 }
      );
    }

    // b. content가 제공되었고 비어 있지 않은 문자열인지 확인
    const { content } = body;
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: "할 일 내용은 필수입니다." },
        { status: 400 }
      );
    }

    // c. 새 할 일을 Supabase의 'todos' 테이블에 추가
    const { data, error } = await supabase
      .from("todos")
      .insert({
        content: content.trim(),
        user_id: userId,
        is_completed: false
      })
      .select()
      .single();

    // d. 데이터 추가 중 오류가 발생하면 오류 처리
    if (error) {
      console.error("할 일 생성 오류:", error);
      return NextResponse.json(
        { error: "할 일 생성 실패" },
        { status: 500 }
      );
    }

    // e. 성공하면 새로 생성된 할 일을 201 상태 코드와 함께 반환
    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error("서버 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 