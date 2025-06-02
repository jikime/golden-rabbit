"use client"

import { useEffect, useState } from "react"
import { Plus, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Conversation {
  id: number
  title: string
  created_at: string
}

export function ChatSidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // 대화 목록 불러오기
  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      if (!response.ok) {
        throw new Error('대화 목록을 불러오는데 실패했습니다.')
      }
      const data = await response.json()
      setConversations(data)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      toast.error('대화 목록을 불러오는데 실패했습니다.')
    }
  }

  // 새 대화 시작하기
  const createNewConversation = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: '새 대화' }),
      })

      if (!response.ok) {
        throw new Error('새 대화를 생성하는데 실패했습니다.')
      }

      const newConversation = await response.json()
      await fetchConversations() // 대화 목록 갱신
      router.push(`/?id=${newConversation.id}`) // 새 대화로 이동
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast.error('새 대화를 생성하는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 컴포넌트 마운트 시 대화 목록 불러오기
  useEffect(() => {
    fetchConversations()
  }, [])

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-bold">AI 채팅</h1>
          <Button 
            className="w-full justify-start gap-2" 
            variant="outline" 
            onClick={createNewConversation}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />새 대화 시작하기
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {conversations.length > 0 ? (
                conversations.map((conversation) => (
                  <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton asChild>
                      <Link 
                        href={`/?id=${conversation.id}`}
                        className="flex flex-col items-start gap-1 p-3 w-full text-left hover:bg-accent rounded-md"
                      >
                        <div className="flex items-center gap-2 w-full">
                          <MessageSquare className="h-4 w-4 flex-shrink-0" />
                          <span className="font-medium text-sm truncate">{conversation.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-6">
                          {new Date(conversation.created_at).toLocaleString()}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  대화 목록이 없습니다.
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
