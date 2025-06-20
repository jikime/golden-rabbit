import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { getCurrentUser, createAuthError } from '@/lib/server-auth';

// GET: 특정 대화의 메시지 목록 가져오기
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 사용자 인증 확인
    const user = await getCurrentUser();
    
    if (!user || !user.id) {
      return createAuthError();
    }
    
    const conversationId = params.id;
    
    // 대화가 현재 사용자의 것인지 확인
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();
    
    if (convError || !conversation) {
      return NextResponse.json(
        { error: '해당 대화에 접근할 권한이 없거나 존재하지 않는 대화입니다.' },
        { status: 403 }
      );
    }
    
    // 메시지 목록 가져오기
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ messages: data });
  } catch (error) {
    console.error('메시지 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '메시지 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 새 메시지 추가
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 사용자 인증 확인
    const user = await getCurrentUser();
    
    if (!user || !user.id) {
      return createAuthError();
    }
    
    const conversationId = params.id;
    
    // 대화가 현재 사용자의 것인지 확인
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();
    
    if (convError || !conversation) {
      return NextResponse.json(
        { error: '해당 대화에 접근할 권한이 없거나 존재하지 않는 대화입니다.' },
        { status: 403 }
      );
    }
    
    // 요청 본문에서 메시지 내용 가져오기
    const { content, role = 'user' } = await req.json();
    
    if (!content) {
      return NextResponse.json(
        { error: '메시지 내용이 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 새 메시지 추가
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          content,
          role,
          user_id: user.id
        }
      ])
      .select();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ message: data[0] });
  } catch (error) {
    console.error('메시지 추가 오류:', error);
    return NextResponse.json(
      { error: '메시지를 추가하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 