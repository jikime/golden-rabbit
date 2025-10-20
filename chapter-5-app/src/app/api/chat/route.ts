import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';

// 최대 30초 동안 스트리밍 응답 허용
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4.1-nano'),
    messages: convertToModelMessages(messages),
    system: '당신은 친절한 한국어 챗봇 도우미입니다. 사용자의 질문에 정확하고 도움이 되는 답변을 한국어로 제공해주세요.',
  });

  return result.toTextStreamResponse();
}
