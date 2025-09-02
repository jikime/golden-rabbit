"use client"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { MessageCircle, Plus, X } from "lucide-react"

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
}

interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
  selectedConversation: string
  onSelectConversation: (id: string) => void
}

export function ChatSidebar({ isOpen, onClose, selectedConversation, onSelectConversation }: ChatSidebarProps) {
  // Mock data
  const conversations: Conversation[] = [
    {
      id: "1",
      title: "React 프로젝트 도움",
      lastMessage: "컴포넌트 구조에 대해 설명해드렸습니다.",
      timestamp: new Date(),
    },
    {
      id: "2",
      title: "여행 계획 세우기",
      lastMessage: "제주도 3박 4일 일정을 추천해드렸습니다.",
      timestamp: new Date(Date.now() - 1800000),
    },
    {
      id: "3",
      title: "요리 레시피 문의",
      lastMessage: "간단한 파스타 레시피를 알려드렸습니다.",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "4",
      title: "영어 학습 방법",
      lastMessage: "효과적인 영어 공부법을 제안해드렸습니다.",
      timestamp: new Date(Date.now() - 7200000),
    },
    {
      id: "5",
      title: "운동 루틴 추천",
      lastMessage: "홈트레이닝 프로그램을 만들어드렸습니다.",
      timestamp: new Date(Date.now() - 86400000),
    },
  ]

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
            >
              <Plus className="h-4 w-4" />새 대화 시작하기
            </Button>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={`p-3 cursor-pointer transition-colors hover:bg-sidebar-accent ${
                    selectedConversation === conversation.id
                      ? "bg-sidebar-accent border-sidebar-primary"
                      : "border-sidebar-border"
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-start gap-3">
                    <MessageCircle className="h-4 w-4 mt-1 text-sidebar-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-sidebar-foreground truncate">{conversation.title}</h3>
                      <p className="text-xs text-sidebar-foreground/70 mt-1 line-clamp-2">{conversation.lastMessage}</p>
                      <p className="text-xs text-sidebar-foreground/50 mt-1">
                        {conversation.timestamp.toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  )
}
