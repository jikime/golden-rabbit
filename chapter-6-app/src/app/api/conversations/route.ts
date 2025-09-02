import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";
import { getCurrentUser, requireAuth } from "@/lib/server-auth";

export async function GET() {
  try {
    // 인증 확인 및 현재 사용자 정보 가져오기
    await requireAuth();
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      return NextResponse.json(
        { error: "인증된 사용자를 찾을 수 없습니다." },
        { status: 401 }
      );
    }

    // 현재 사용자의 대화만 가져오기
    const { data, error } = await supabase
      .from('conversations')
      .select('id, title')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ conversations: data });
  } catch (error) {
    console.error("대화 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "대화 목록을 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 인증 확인 및 현재 사용자 정보 가져오기
    await requireAuth();
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      return NextResponse.json(
        { error: "인증된 사용자를 찾을 수 없습니다." },
        { status: 401 }
      );
    }

    // request 본문에서 title 추출
    const { title } = await request.json();
    
    // title이 제공되지 않은 경우 오류 반환
    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: "유효한 대화 제목을 입력해주세요." },
        { status: 400 }
      );
    }
    
    // 새 대화 생성 (사용자 ID 포함)
    const { data, error } = await supabase
      .from('conversations')
      .insert([{ 
        title,
        user_id: currentUser.id
      }])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ conversation: data });
  } catch (error) {
    console.error("대화 생성 오류:", error);
    return NextResponse.json(
      { error: "대화를 생성하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 