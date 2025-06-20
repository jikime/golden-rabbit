import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

// GET: 대화 목록 조회
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
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

// POST: 새 대화 생성
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const title = body.title || '새 대화'
    
    const { data, error } = await supabase
      .from('conversations')
      .insert([{ title }])
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