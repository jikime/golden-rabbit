import { OpenAI } from 'openai';

// OpenAI 클라이언트 인스턴스 생성
// 환경 변수 OPENAI_API_KEY가 설정되어 있어야 합니다
export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// API 키가 없는 경우를 위한 헬퍼 함수
export function checkOpenAIApiKey(): boolean {
  return !!process.env.OPENAI_API_KEY;
} 