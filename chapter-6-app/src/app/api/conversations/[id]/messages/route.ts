import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";
import { getCurrentUser, requireAuth } from "@/lib/server-auth";

// 메시지 역할 타입 정의
type MessageRole = 'user' | 'assistant' | 'system';

// 요청 본문 인터페이스
interface MessageRequestBody {
  role: MessageRole;
  content: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // URL params에서 대화 ID 추출
    const { id } = await params;
    const conversationId = parseInt(id);
    
    // 대화 ID가 유효한 숫자가 아닌 경우 오류 반환
    if (isNaN(conversationId)) {
      return NextResponse.json(
        { error: "유효하지 않은 대화 ID입니다." },
        { status: 400 }
      );
    }
    
    // 대화가 실제로 존재하는지 확인하고 현재 사용자의 대화인지 확인
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('id, title, created_at')
      .eq('id', conversationId)
      .eq('user_id', currentUser.id) // 현재 사용자의 대화만 조회
      .single();
      
    if (conversationError) {
      console.error("대화 조회 오류:", conversationError);
      if (conversationError.code === 'PGRST116') {
        return NextResponse.json(
          { error: "해당 ID의 대화를 찾을 수 없거나 접근 권한이 없습니다." },
          { status: 404 }
        );
      } else {
        return NextResponse.json(
          { error: "대화 정보를 가져오는 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }
    }
    
    if (!conversation) {
      return NextResponse.json(
        { error: "해당 ID의 대화를 찾을 수 없거나 접근 권한이 없습니다." },
        { status: 404 }
      );
    }
    
    // 해당 대화의 모든 메시지 가져오기
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUser.id) // 현재 사용자의 메시지만 조회
      .order('created_at', { ascending: true });
      
    if (messagesError) {
      console.error("메시지 목록 조회 오류:", messagesError);
      return NextResponse.json(
        { error: "메시지 목록을 가져오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
    
    // 응답 형식 개선
    const formattedMessages = messages?.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.created_at
    })) || [];
    
    return NextResponse.json({
      success: true,
      message: "메시지 목록을 성공적으로 가져왔습니다.",
      data: {
        conversation: {
          id: conversation.id,
          title: conversation.title,
          createdAt: conversation.created_at
        },
        messages: formattedMessages,
        messageCount: formattedMessages.length
      }
    });
  } catch (error) {
    console.error("메시지 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "메시지 목록을 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // URL params에서 대화 ID 추출
    const { id } = await params;
    const conversationId = parseInt(id);

    // 대화 ID가 유효한 숫자가 아닌 경우 오류 반환
    if (isNaN(conversationId)) {
      return NextResponse.json(
        { error: "유효하지 않은 대화 ID입니다." },
        { status: 400 }
      );
    }
    
    // 요청 본문에서 메시지 데이터 추출
    const requestData = await request.json();
    const { role, content } = requestData as MessageRequestBody;
    
    // 필수 필드 검증
    if (!role || !['user', 'assistant', 'system'].includes(role)) {
      return NextResponse.json(
        { error: "유효한 메시지 역할(role)을 입력해주세요. 'user', 'assistant', 또는 'system' 중 하나여야 합니다." },
        { status: 400 }
      );
    }
    
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: "유효한 메시지 내용을 입력해주세요." },
        { status: 400 }
      );
    }
    
    // 대화가 실제로 존재하는지 확인하고 현재 사용자의 대화인지 확인
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', currentUser.id) // 현재 사용자의 대화만 확인
      .single();
      
    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: "해당 ID의 대화를 찾을 수 없거나 접근 권한이 없습니다." },
        { status: 404 }
      );
    }
    
    // 메시지를 Supabase에 저장 (사용자 ID 포함)
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          user_id: currentUser.id, // 현재 사용자 ID 저장
          role,
          content,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
      
    if (messageError) {
      console.error("메시지 저장 오류:", messageError);
      return NextResponse.json(
        { error: "메시지를 저장하는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
    
    // 성공적으로 저장된 메시지 반환
    return NextResponse.json({ 
      success: true,
      message: "메시지가 성공적으로 저장되었습니다.",
      data: message
    });
  } catch (error) {
    console.error("메시지 저장 오류:", error);
    return NextResponse.json(
      { error: "메시지를 저장하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 