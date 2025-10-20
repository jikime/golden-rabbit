import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const conversationId = parseInt(id)
    
    // 대화 ID 유효성 검사
    if (isNaN(conversationId)) {
      return NextResponse.json(
        { error: '유효하지 않은 대화 ID입니다.' },
        { status: 400 }
      )
    }
    
    // Supabase에서 해당 대화의 모든 메시지 조회 (created_at 오름차순 정렬)
    const { data, error } = await supabase
      .from('messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Supabase 오류:', error)
      return NextResponse.json(
        { error: '메시지 목록을 가져오는데 실패했습니다.' },
        { status: 500 }
      )
    }
    
    // 정렬된 메시지 목록을 JSON으로 반환
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('GET 요청 처리 중 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const conversationId = id
    
    const body = await request.json()
    const { role, content } = body
    
    if (!role || !content) {
      return NextResponse.json(
        { error: 'role과 content가 필요합니다.' },
        { status: 400 }
      )
    }
    
    // Supabase에 메시지 저장
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: parseInt(conversationId),
        role: role,
        content: content
      }])
      .select('id, role, content, created_at')
      .single()
    
    if (error) {
      console.error('Supabase 오류:', error)
      return NextResponse.json(
        { error: '메시지 저장에 실패했습니다.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('POST 요청 처리 중 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
