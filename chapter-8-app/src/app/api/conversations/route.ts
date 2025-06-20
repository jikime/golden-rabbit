import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { getCurrentUser, createAuthError } from '@/lib/server-auth';

// GET: 사용자의 모든 대화 가져오기
export async function GET() {
  try {
    // 사용자 인증 확인
    const user = await getCurrentUser();
    
    if (!user || !user.id) {
      return createAuthError();
    }
    
    // 사용자의 대화 목록 가져오기
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ conversations: data });
  } catch (error) {
    console.error('대화 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '대화 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 새 대화 생성
export async function POST(req: Request) {
  try {
    // 사용자 인증 확인
    const user = await getCurrentUser();
    
    if (!user || !user.id) {
      return createAuthError();
    }
    
    // 요청 본문에서 제목 가져오기
    const { title = '새 대화' } = await req.json();
    
    // 새 대화 생성
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        { 
          title, 
          user_id: user.id 
        }
      ])
      .select();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ conversation: data[0] });
  } catch (error) {
    console.error('대화 생성 오류:', error);
    return NextResponse.json(
      { error: '새 대화를 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 