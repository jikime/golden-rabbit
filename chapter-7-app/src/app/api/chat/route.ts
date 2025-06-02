import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { supabase } from "@/lib/supabase-client";
import { getCurrentUser, createAuthError } from "@/lib/server-auth";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // 사용자 인증 확인
    const user = await getCurrentUser();
    
    if (!user || !user.id) {
      return createAuthError();
    }
    
    // 클라이언트 요청에서 메시지와 conversationId 추출
    const { messages, data } = await req.json();
    const conversationId = data?.conversationId;
    
    // conversationId가 있는지 확인 및 사용자 소유 여부 검증
    if (conversationId) {
      // 대화가 현재 인증된 사용자의 것인지 확인
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('user_id')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();
      
      if (error || !conversation) {
        return new Response(
          JSON.stringify({
            error: "이 대화에 접근할 권한이 없거나 존재하지 않는 대화입니다.",
          }),
          { status: 403 }
        );
      }
      
      console.log(`Processing message for conversation ID: ${conversationId} (User: ${user.id})`);
    }
    
    // AI 응답 스트림 생성
    const result = streamText({
      model: openai('gpt-3.5-turbo'),
      system: "당신은 도움이 되고 친절한 AI 어시스턴트입니다. 질문에 명확하고 유용한 정보를 제공하세요.",
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("ChatGPT API 오류:", error);
    return new Response(
      JSON.stringify({
        error: "AI 응답을 생성하는 중 문제가 발생했습니다.",
      }),
      { status: 500 }
    );
  }
} 