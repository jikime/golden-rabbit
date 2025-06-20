"use client"

import { Bot, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChatStore } from "@/lib/store"
import { useState } from "react"

export function EmptyConversation() {
  const { createConversation } = useChatStore()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateConversation = async () => {
    setIsCreating(true)
    await createConversation()
    setIsCreating(false)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-secondary mb-6">
        <Bot className="h-8 w-8 text-secondary-foreground" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">대화를 시작해보세요</h2>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        AI 어시스턴트에게 질문하거나, 정보를 요청하거나, 도움을 구해보세요. 
        새로운 대화를 시작하려면 아래 버튼을 클릭하세요.
      </p>
      <Button 
        onClick={handleCreateConversation} 
        disabled={isCreating}
        className="flex items-center"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        새 대화 시작하기
      </Button>
    </div>
  )
} 