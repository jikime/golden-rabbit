import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useConversation } from "@/hooks/useConversation"

export function WelcomeScreen() {
  const { createConversation, loading, error } = useConversation()

  return (
    <div className="flex flex-col h-full items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <h2 className="text-2xl font-bold">AI 챗봇에 오신 것을 환영합니다</h2>
        <p className="text-muted-foreground">
          새로운 대화를 시작하여 AI 챗봇과 대화해보세요.
          질문, 아이디어, 도움이 필요한 모든 것에 대해 물어볼 수 있습니다.
        </p>
        <Button
          onClick={() => createConversation()}
          className="w-full flex items-center justify-center gap-2"
          disabled={loading}
        >
          <Plus className="h-4 w-4" />
          새 대화 시작하기
        </Button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </div>
  )
} 