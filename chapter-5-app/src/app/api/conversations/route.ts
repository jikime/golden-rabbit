import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, title')

    if (error) {
      console.error('Supabase 오류:', error)
      return NextResponse.json(
        { error: '데이터베이스에서 대화 목록을 가져오는데 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('GET 요청 처리 중 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title } = body

    if (!title) {
      return NextResponse.json(
        { error: '제목(title)이 필요합니다.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert([{ title }])
      .select('id, title')
      .single()

    if (error) {
      console.error('Supabase 오류:', error)
      return NextResponse.json(
        { error: '새 대화를 생성하는데 실패했습니다.' },
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
