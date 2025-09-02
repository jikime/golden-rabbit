import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, UIMessage } from 'ai';

// 최대 30초까지 스트리밍 응답 허용
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: openai('gpt-4.1-nano'),
      system: '당신은 친절한 한국어 챗봇 도우미입니다. 항상 한국어로 응답하고, 사용자의 질문에 정확하고 도움이 되는 답변을 제공하세요.',
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('오류 발생:', error);
    return new Response(JSON.stringify({ error: '요청 처리 중 오류가 발생했습니다.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
