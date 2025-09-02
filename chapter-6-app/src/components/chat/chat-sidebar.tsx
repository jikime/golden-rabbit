"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ApiConversation {
  id: number
  title: string
}

interface Conversation {
  id: number
  title: string
  lastMessage: string
  timestamp: string
  isToday: boolean
}

interface ChatSidebarProps {
  selectedConversation: number
  onSelectConversation: (id: number) => void
  onNewChat: () => void
}

export function ChatSidebar({
  selectedConversation,
  onSelectConversation,
  onNewChat,
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  // API에서 대화 목록 가져오기
  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/conversations')
      
      if (!response.ok) {
        throw new Error('대화 목록을 가져오는데 실패했습니다.')
      }
      
      const data = await response.json()
      
      // API에서 받은 데이터를 컴포넌트 형식에 맞게 변환
      const formattedConversations = data.conversations.map((conv: ApiConversation) => ({
        id: conv.id,
        title: conv.title,
        lastMessage: "마지막 메시지 없음",
        timestamp: "방금 전",
        isToday: true
      }))
      
      setConversations(formattedConversations)
    } catch (error) {
      console.error('대화 목록 가져오기 오류:', error)
      toast.error('대화 목록을 가져오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }
  
  // 컴포넌트 마운트 시 대화 목록 가져오기
  useEffect(() => {
    fetchConversations()
  }, [])

  // 새 대화 생성 함수
  const handleCreateNewChat = async () => {
    try {
      setCreating(true)
      
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: '새 대화' }),
      })
      
      if (!response.ok) {
        throw new Error('새 대화 생성에 실패했습니다.')
      }
      
      const data = await response.json()
      
      // 새 대화 생성 성공 메시지
      toast.success('새 대화가 생성되었습니다.')
      
      // 대화 목록 다시 가져오기
      await fetchConversations()
      
      // 새로 생성된 대화 선택
      if (data.conversation && data.conversation.id) {
        onSelectConversation(data.conversation.id)
        // 새 대화 페이지로 이동
        router.push(`?id=${data.conversation.id}`)
      }
      
      // onNewChat 콜백 호출 (필요한 경우)
      onNewChat()
    } catch (error) {
      console.error('새 대화 생성 오류:', error)
      toast.error('새 대화 생성에 실패했습니다.')
    } finally {
      setCreating(false)
    }
  }

  // 대화 선택 핸들러
  const handleSelectConversation = (id: number) => {
    onSelectConversation(id)
    router.push(`?id=${id}`)
  }

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* AI Chat 제목 */}
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground mb-4">AI Chat</h2>
        <Button
          className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={handleCreateNewChat}
          disabled={creating}
        >
          <Plus className="w-4 h-4" />
          {creating ? '생성 중...' : '새 대화 시작하기'}
        </Button>
      </div>

      {/* 대화 목록 */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">대화 목록을 불러오는 중...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">대화 내역이 없습니다.</div>
        ) : (
          <div className="p-2">
            {/* 모든 대화 목록 */}
            <div className="mb-4">
              <h3 className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">대화 목록</h3>
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-colors hover:bg-accent hover:text-accent-foreground ${
                    selectedConversation === conversation.id
                      ? "bg-accent text-accent-foreground border-l-4 border-primary"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">{conversation.title}</h4>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
} 