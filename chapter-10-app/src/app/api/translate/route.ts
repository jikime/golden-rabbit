import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, sourceLang, targetLang } = body

    const { text: translationResponse } = await generateText({
      model: openai("gpt-4.1-nano"),
      prompt: `당신은 세계 최고의 번역가입니다. 다음 텍스트를 ${sourceLang}에서 ${targetLang}으로 번역해주세요. 그리고 최적의 번역 1개와 대체 번역안 1~3개를 JSON 형식으로 반환해주세요.

텍스트: "${text}"

응답 형식:
{
  "mainTranslation": "최적의 번역",
  "alternatives": ["대체 번역안1", "대체 번역안2", "대체 번역안3"]
}`,
      system:
        "You are a professional translator. Always respond with valid JSON format only, without any additional text or explanations.",
    })

    const translationData = JSON.parse(translationResponse)

    return NextResponse.json({
      ...translationData,
      originalText: text,
      sourceLang,
      targetLang,
    })
  } catch (error) {
    return NextResponse.json({ error: "번역 중 오류가 발생했습니다." }, { status: 500 })
  }
}
