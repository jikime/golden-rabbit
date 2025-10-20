"use client"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { MessageCircle, Plus, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Conversation {
  id: number
  title: string
}

interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
  selectedConversation: string
  onSelectConversation: (id: string) => void
}

export function ChatSidebar({ isOpen, onClose, selectedConversation, onSelectConversation }: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/conversations')
        if (response.ok) {
          const data = await response.json()
          setConversations(data)
        } else {
          console.error('대화 목록을 가져오는데 실패했습니다.')
        }
      } catch (error) {
        console.error('API 호출 중 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [])

  const handleNewConversation = async () => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: '새 대화' }),
      })

      if (response.ok) {
        const newConversation = await response.json()
        // 대화 목록을 다시 불러와서 화면 갱신
        const listResponse = await fetch('/api/conversations')
        if (listResponse.ok) {
          const updatedConversations = await listResponse.json()
          setConversations(updatedConversations)
          // 새로 생성된 대화를 선택
          onSelectConversation(newConversation.id.toString())
        }
      } else {
        toast.error('대화 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('API 호출 중 오류:', error)
      toast.error('대화 생성에 실패했습니다.')
    }
  }

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-sidebar border-r border-sidebar-border
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <h1 className="text-xl font-bold text-sidebar-foreground">AI Chat</h1>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <Button
              className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              variant="outline"
              onClick={handleNewConversation}
            >
              <Plus className="h-4 w-4" />새 대화 시작하기
            </Button>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-4 text-sidebar-foreground/70">
                  대화 목록을 불러오는 중...
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-4 text-sidebar-foreground/70">
                  아직 대화가 없습니다.
                </div>
              ) : (
                conversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    className={`p-3 cursor-pointer transition-colors hover:bg-sidebar-accent ${
                      selectedConversation === conversation.id.toString()
                        ? "bg-sidebar-accent border-sidebar-primary"
                        : "border-sidebar-border"
                    }`}
                    onClick={() => {
                      router.push(`/?id=${conversation.id}`)
                      onSelectConversation(conversation.id.toString())
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <MessageCircle className="h-4 w-4 mt-1 text-sidebar-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-sidebar-foreground truncate">{conversation.title}</h3>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  )
}
