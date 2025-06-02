"use client"

import { PlusCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { ChatHistoryList } from "@/components/chat/chat-history-list"
import { useEffect, useState } from "react"
import { useChatWithAuth } from "@/hooks/use-chat-with-auth"
import { useAuth } from "@/hooks/use-auth"

export function ChatSidebar() {
  const { createConversation, fetchConversations, conversations, user, userId } = useChatWithAuth()
  const { logout } = useAuth()
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // userId가 있을 때만 대화 목록 불러오기
    const loadConversations = async () => {
      if (userId) {
        setIsLoading(true)
        await fetchConversations()
        setIsLoading(false)
      }
    }
    
    loadConversations()
  }, [fetchConversations, userId])

  const handleCreateConversation = async () => {
    setIsCreating(true)
    await createConversation()
    setIsCreating(false)
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <Sidebar variant="inset" className="!absolute top-16">
      <SidebarHeader className="p-4">
        <h1 className="text-xl font-bold mb-2">AI 채팅 어시스턴트</h1>
        {user && (
          <p className="text-sm text-muted-foreground mb-4">
            {user.name || user.email}
          </p>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleCreateConversation}
                disabled={isCreating}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>새 대화 시작하기</span>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-pulse text-muted-foreground">불러오는 중...</div>
          </div>
        ) : (
          <ChatHistoryList />
        )}
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground" 
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          로그아웃
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
} 