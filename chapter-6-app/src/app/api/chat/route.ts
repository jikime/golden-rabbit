import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// 최대 30초까지의 스트리밍 응답 허용
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4.1-nano'),
    system: '당신은 친절한 한국어 챗봇 도우미입니다.',
    messages,
  });

  return result.toDataStreamResponse();
} 