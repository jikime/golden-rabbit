import { NextResponse } from 'next/server';
import supabase, { Todo } from '@/lib/supabase-client';

/**
 * GET 요청을 처리하는 함수
 * 모든 할 일 목록을 반환합니다.
 */
export async function GET() {
  try {
    // Supabase에서 todos 테이블의 모든 데이터를 가져옵니다.
    // created_at 기준으로 최신순(내림차순) 정렬
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '할 일 목록을 가져왔습니다.', 
      data 
    });
  } catch (error) {
    console.error('할 일 목록을 가져오는 중 오류가 발생했습니다:', error);
    return NextResponse.json(
      { success: false, message: '할 일 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
