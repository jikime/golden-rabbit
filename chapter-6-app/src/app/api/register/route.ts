import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { supabase } from '@/lib/supabase-client';

// 회원가입 요청 데이터 검증을 위한 zod 스키마
const registerSchema = z.object({
  name: z.string().min(1, '이름은 필수 입력 항목입니다.'),
  email: z.string().email('유효한 이메일 주소를 입력해주세요.').min(1, '이메일은 필수 입력 항목입니다.'),
  password: z.string().optional(),
  provider: z.enum(['credential', 'google'], {
    required_error: '유효한 인증 제공자를 선택해주세요.',
  }),
}).refine(
  (data) => {
    // provider가 credential인 경우 비밀번호 필수
    if (data.provider === 'credential') {
      return !!data.password && data.password.length >= 6;
    }
    return true;
  },
  {
    message: '비밀번호는 최소 6자 이상이어야 합니다.',
    path: ['password'],
  }
);

export async function POST(request: Request) {
  try {
    // 1. Request의 json 데이터 파싱
    const body = await request.json();
    
    // 2. zod를 이용한 데이터 검증
    const result = registerSchema.safeParse(body);
    
    if (!result.success) {
      // 유효성 검증 실패
      const errorMessage = result.error.errors[0]?.message || '입력 데이터가 유효하지 않습니다.';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    
    const { name, email, password, provider } = result.data;
    
    // 3. 비밀번호 해싱 (provider가 credential인 경우)
    let hashedPassword = null;
    if (provider === 'credential' && password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    
    // 4. 이메일 중복 검증
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116는 결과가 없을 때 발생하는 에러 코드
      return NextResponse.json(
        { error: '사용자 확인 중 오류가 발생하였습니다.' },
        { status: 500 }
      );
    }
    
    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 409 }
      );
    }
    
    // 5. 사용자 정보 저장
    const { error: insertError } = await supabase.from('users').insert({
      name,
      email,
      password: hashedPassword,
      provider,
      // image 필드는 기본값 null
    });
    
    // 6. 응답 처리
    if (insertError) {
      console.error('User registration error:', insertError);
      return NextResponse.json(
        { error: '사용자 등록 중 오류가 발생하였습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: '회원 가입이 완료되었습니다.' },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생하였습니다.' },
      { status: 500 }
    );
  }
} 