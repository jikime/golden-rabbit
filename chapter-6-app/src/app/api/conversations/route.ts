import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { requireAuth } from '@/lib/server-auth'

// GET: 대화 목록 조회 - 현재 로그인한 사용자의 대화만 조회
export async function GET() {
  try {
    // 1. 사용자 인증 확인 및 사용자 정보 가져오기
    const user = await requireAuth();
    
    // 2. 현재 사용자의 대화 목록만 조회
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)  // 현재 사용자의 대화만 필터링
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: '대화 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 새 대화 생성 - 현재 로그인한 사용자 ID 포함
export async function POST(request: Request) {
  try {
    // 1. 사용자 인증 확인 및 사용자 정보 가져오기
    const user = await requireAuth();
    
    const body = await request.json()
    const title = body.title || '새 대화'
    
    // 2. 사용자 ID를 포함하여 대화 생성
    const { data, error } = await supabase
      .from('conversations')
      .insert([{ 
        title, 
        user_id: user.id  // 현재 사용자 ID 추가
      }])
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: '새 대화를 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 