import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST 요청 본문 타입 정의
interface CreateExpenseRequest {
  amount: number;
  category: string;
  memo?: string;
  spent_at: string;
  payment_method?: '현금' | '카드';
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateExpenseRequest = await request.json()

    // 필수 필드 검증
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'amount는 0보다 큰 값이어야 합니다.' },
        { status: 400 }
      )
    }

    if (!body.category) {
      return NextResponse.json(
        { error: 'category는 필수 필드입니다.' },
        { status: 400 }
      )
    }

    if (!body.spent_at) {
      return NextResponse.json(
        { error: 'spent_at은 필수 필드입니다.' },
        { status: 400 }
      )
    }

    // 날짜 형식 검증 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(body.spent_at)) {
      return NextResponse.json(
        { error: 'spent_at은 YYYY-MM-DD 형식이어야 합니다.' },
        { status: 400 }
      )
    }

    // payment_method 검증
    if (body.payment_method && !['현금', '카드'].includes(body.payment_method)) {
      return NextResponse.json(
        { error: 'payment_method는 "현금" 또는 "카드"여야 합니다.' },
        { status: 400 }
      )
    }

    // 카테고리 존재 여부 확인
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', body.category)
      .single()

    if (categoryError || !categoryData) {
      return NextResponse.json(
        { error: '존재하지 않는 카테고리입니다.' },
        { status: 400 }
      )
    }

    // expense 데이터 삽입
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        amount: body.amount,
        category_id: body.category,
        memo: body.memo || null,
        spent_at: body.spent_at,
        payment_method: body.payment_method || null
      })
      .select(`
        id,
        amount,
        memo,
        spent_at,
        payment_method,
        created_at,
        categories (
          id,
          name
        )
      `)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: '지출 내역을 저장하는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // expenses 테이블에서 categories 테이블과 조인하여 데이터 조회
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        amount,
        memo,
        spent_at,
        payment_method,
        categories (
          name
        )
      `)
      .order('spent_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: '데이터를 가져오는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 데이터를 요청된 형식으로 변환
    const expenses = data?.map(expense => ({
      amount: expense.amount,
      category: expense.categories?.name || null,
      memo: expense.memo,
      date: expense.spent_at,
      payment_method: expense.payment_method
    })) || []

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
