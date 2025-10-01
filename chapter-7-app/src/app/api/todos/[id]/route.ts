import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

/**
 * PATCH 요청 처리 함수
 * 특정 할 일의 정보를 업데이트합니다.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // URL에서 id 파라미터 가져오기
    const id = params.id;
    
    // 요청 본문에서 업데이트할 데이터 가져오기
    const { is_completed } = await request.json();
    
    // 데이터 유효성 검사
    if (is_completed === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: '업데이트할 상태 값(is_completed)이 필요합니다.' 
        },
        { status: 400 }
      );
    }
    
    // Supabase에서 해당 할 일 업데이트
    const { data, error } = await supabase
      .from('todos')
      .update({ is_completed })
      .eq('id', id)
      .select();
    
    if (error) {
      throw error;
    }
    
    if (data.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '해당 ID의 할 일을 찾을 수 없습니다.' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '할 일 상태가 성공적으로 업데이트되었습니다.',
      todo: data[0]
    }, { status: 200 });
  } catch (error) {
    console.error('할 일 상태 업데이트 중 오류 발생:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '할 일 상태를 업데이트하는 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE 요청 처리 함수
 * 특정 할 일을 삭제합니다.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // URL에서 id 파라미터 가져오기
    const id = params.id;
    
    // Supabase에서 해당 할 일 삭제
    const { data, error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .select();
    
    if (error) {
      throw error;
    }
    
    // 삭제할 항목이 없는 경우
    if (data.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '해당 ID의 할 일을 찾을 수 없습니다.' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '할 일이 성공적으로 삭제되었습니다.',
      todo: data[0]
    }, { status: 200 });
  } catch (error) {
    console.error('할 일 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '할 일을 삭제하는 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}
