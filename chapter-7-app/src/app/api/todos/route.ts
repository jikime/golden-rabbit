import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

/**
 * GET 요청 처리 함수
 * 할 일 목록을 가져옵니다.
 */
export async function GET(request: NextRequest) {
  try {
    // Supabase에서 할 일 목록 가져오기
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ 
      success: true,
      todos: data,
      count: data.length
    }, { status: 200 });
  } catch (error) {
    console.error('할 일 목록을 가져오는 중 오류 발생:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '할 일 목록을 가져오는 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}

