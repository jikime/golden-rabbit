"use client"

import { MessageSquare } from "lucide-react"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { useChatWithAuth } from "@/hooks/use-chat-with-auth"
import { useEffect } from "react"

interface ChatHistoryListProps {
  conversations?: Array<{
    id: number;
    title: string;
    created_at: string;
    user_id: string;
  }>;
}

export function ChatHistoryList({ conversations: propsConversations }: ChatHistoryListProps) {
  const { 
    setCurrentConversation, 
    currentConversation, 
    conversations: storeConversations,
    fetchConversations,
    userId
  } = useChatWithAuth()
  
  // 사용할 대화 목록 (props > store)
  const conversations = propsConversations || storeConversations
  
  // userId가 변경되면 대화 목록 다시 로드
  useEffect(() => {
    if (userId) {
      fetchConversations()
    }
  }, [userId, fetchConversations])

  if (conversations.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-muted-foreground">
        <p>저장된 대화가 없습니다</p>
      </div>
    )
  }

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ko
    })
  }

  return (
    <div className="px-2">
      <h2 className="text-sm font-semibold mb-2 px-2">최근 대화</h2>
      <SidebarMenu className="space-y-1">
        {conversations.map((conversation) => (
          <SidebarMenuItem key={conversation.id}>
            <SidebarMenuButton 
              className={`hover:bg-accent hover:text-accent-foreground ${
                currentConversation?.id === conversation.id ? "bg-accent text-accent-foreground" : ""
              }`}
              onClick={() => setCurrentConversation(conversation)}
            >
              <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
              <div className="flex flex-col items-start w-full overflow-hidden">
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis w-full">
                  {conversation.title || '제목 없음'}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {formatTime(conversation.created_at)}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  )
} 