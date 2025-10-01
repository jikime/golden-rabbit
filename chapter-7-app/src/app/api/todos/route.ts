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

/**
 * POST 요청 처리 함수
 * 새로운 할 일을 추가합니다.
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 할 일 데이터 가져오기
    const body = await request.json();
    
    // 요청 데이터 유효성 검사
    const { content } = body;
    
    // 내용물이 비어있는지 확인
    if (!content || content.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: '할 일 내용은 필수입니다.'
        },
        { status: 400 }
      );
    }
    
    // Supabase에 새로운 할 일 추가하기
    const { data, error } = await supabase
      .from('todos')
      .insert([
        { 
          content: content.trim(),
          is_completed: false
        }
      ])
      .select();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      message: '할 일이 성공적으로 추가되었습니다.',
      todo: data[0]
    }, { status: 201 });
  } catch (error) {
    console.error('할 일 추가 중 오류 발생:', error);
    return NextResponse.json(
      {
        success: false,
        error: '할 일을 추가하는 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
