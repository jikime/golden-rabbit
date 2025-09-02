import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { sentence, word, targetLang } = await request.json()

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `당신은 언어 전문가입니다. 다음 문맥에서 "${word}"라는 단어를 대체할 수 있는 적절한 단어 3개를 ${targetLang}로 추천해주세요.

문맥: "${sentence}"

다음 JSON 배열 형식으로만 응답해주세요:
["대체어1", "대체어2", "대체어3"]`,
    })

    const alternatives = JSON.parse(result.text)

    return Response.json({
      success: true,
      alternatives,
      originalWord: word,
      sentence,
      targetLang,
    })
  } catch (error) {
    console.error("Alternatives API 오류:", error)
    return Response.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
