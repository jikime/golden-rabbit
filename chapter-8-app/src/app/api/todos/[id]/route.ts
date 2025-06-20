import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // params.id에서 할 일 ID를 가져와서 숫자로 변경
    const todoId = parseInt(params.id, 10);
    
    if (isNaN(todoId)) {
      return NextResponse.json(
        { error: "유효하지 않은 할 일 ID입니다." },
        { status: 400 }
      );
    }

    // 요청 본문에서 새 is_completed 상태를 가져오기
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

    const { is_completed } = body;
    
    if (typeof is_completed !== 'boolean') {
      return NextResponse.json(
        { error: "is_completed는 boolean 값이어야 합니다." },
        { status: 400 }
      );
    }

    // Supabase 클라이언트로 'todos' 테이블에서 해당 ID를 찾아서 is_completed 값을 업데이트
    const { data, error } = await supabase
      .from("todos")
      .update({ is_completed })
      .eq("id", todoId)
      .eq("user_id", userId) // 사용자 본인의 할 일만 수정 가능
      .select()
      .single();

    if (error) {
      console.error("할 일 업데이트 오류:", error);
      
      // 데이터가 없는 경우 404 에러
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "해당 할 일을 찾을 수 없습니다." },
          { status: 404 }
        );
      }
      
      // 기타 데이터베이스 오류는 500 에러
      return NextResponse.json(
        { error: "할 일 업데이트 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 성공하면 업데이트된 데이터를 JSON으로 200 코드와 함께 반환
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("서버 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // params.id에서 할 일 ID를 가져와서 숫자로 변경
    const todoId = parseInt(params.id, 10);
    
    if (isNaN(todoId)) {
      return NextResponse.json(
        { error: "유효하지 않은 할 일 ID입니다." },
        { status: 400 }
      );
    }

    // Supabase 클라이언트로 'todos' 테이블에서 해당 ID를 찾아서 삭제
    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("id", todoId)
      .eq("user_id", userId); // 사용자 본인의 할 일만 삭제 가능

    if (error) {
      console.error("할 일 삭제 오류:", error);
      
      // 데이터가 없는 경우 404 에러
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "해당 할 일을 찾을 수 없습니다." },
          { status: 404 }
        );
      }
      
      // 기타 데이터베이스 오류는 500 에러
      return NextResponse.json(
        { error: "할 일 삭제 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 성공하면 메시지를 JSON으로 200 코드와 함께 반환
    return NextResponse.json(
      { message: "할일이 삭제되었습니다." }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("서버 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 