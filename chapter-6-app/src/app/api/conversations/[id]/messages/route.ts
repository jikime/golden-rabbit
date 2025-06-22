import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { requireAuth } from '@/lib/server-auth'

// GET: 특정 대화방의 메시지 목록 가져오기
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 사용자 인증 확인 및 사용자 정보 가져오기
    const user = await requireAuth();
    
    const conversationId = params.id
    
    // conversationId가 유효한 숫자인지 확인
    if (!conversationId || isNaN(Number(conversationId))) {
      return NextResponse.json(
        { error: '유효하지 않은 대화방 ID입니다.' },
        { status: 400 }
      )
    }
    
    // 대화방이 존재하는지 확인하고, 현재 사용자의 대화방인지 확인
    const { error: conversationError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id) // 현재 사용자의 대화방인지 확인
      .single()
      
    if (conversationError) {
      if (conversationError.code === 'PGRST116') {
        return NextResponse.json(
          { error: '존재하지 않는 대화방이거나 접근 권한이 없습니다.' },
          { status: 404 }
        )
      }
      
      console.error('Error checking conversation:', conversationError)
      throw new Error('대화방 확인 중 오류가 발생했습니다.')
    }
    
    // 메시지 목록 가져오기
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id) // 현재 사용자의 메시지만 가져오기
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching messages:', error)
      throw new Error('메시지 목록을 가져오는 중 데이터베이스 오류가 발생했습니다.')
    }
    
    return NextResponse.json({ messages: data })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '메시지를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 

// POST: 새 메시지 저장하기
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 사용자 인증 확인 및 사용자 정보 가져오기
    const user = await requireAuth();
    
    const conversationId = params.id
    
    // conversationId가 유효한 숫자인지 확인
    if (!conversationId || isNaN(Number(conversationId))) {
      return NextResponse.json(
        { error: '유효하지 않은 대화방 ID입니다.' },
        { status: 400 }
      )
    }
    
    // 대화방이 존재하는지 확인하고, 현재 사용자의 대화방인지 확인
    const { error: conversationError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id) // 현재 사용자의 대화방인지 확인
      .single()
      
    if (conversationError) {
      if (conversationError.code === 'PGRST116') {
        return NextResponse.json(
          { error: '존재하지 않는 대화방이거나 접근 권한이 없습니다.' },
          { status: 404 }
        )
      }
      
      console.error('Error checking conversation:', conversationError)
      throw new Error('대화방 확인 중 오류가 발생했습니다.')
    }
    
    const body = await request.json()
    const { role, content } = body
    
    // 필수 필드 검증
    if (!role || !content) {
      return NextResponse.json(
        { error: '역할(role)과 내용(content)은 필수 항목입니다.' },
        { status: 400 }
      )
    }
    
    // role 유효성 검사
    if (!['user', 'assistant', 'system'].includes(role)) {
      return NextResponse.json(
        { error: '유효하지 않은 역할입니다. role은 user, assistant, system 중 하나여야 합니다.' },
        { status: 400 }
      )
    }
    
    // 메시지 저장 (사용자 ID 포함)
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          user_id: user.id, // 현재 사용자 ID 추가
          role,
          content
        }
      ])
      .select()
    
    if (error) {
      console.error('Error saving message:', error)
      throw new Error('메시지를 저장하는 중 데이터베이스 오류가 발생했습니다.')
    }
    
    return NextResponse.json({ message: data[0] })
  } catch (error) {
    console.error('Error saving message:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '메시지를 저장하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 