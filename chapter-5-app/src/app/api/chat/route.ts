import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4-turbo'),
    system: '당신은 친절한 한국어 챗봇 도우미입니다.',
    messages,
  });

  return result.toDataStreamResponse();
}