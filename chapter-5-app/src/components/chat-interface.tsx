"use client"

import { useState, useRef, useEffect } from "react"
import { Send, User, Bot, Sun, Moon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import { useChat } from '@ai-sdk/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from "sonner"

// 메시지 타입 정의
interface Message {
  id: number
  conversation_id: number
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

export default function ChatInterface() {
  const [isError, setIsError] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([])
  const searchParams = useSearchParams()
  const conversationId = searchParams.get('id')
  const router = useRouter()

  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: "/api/chat",
    body: {
      data: { conversationId }
    },
    id: conversationId || undefined,
    onResponse: async () => {
      // 응답 처리 로직
    },
    onFinish: async (message) => {
      setIsError(false)
      
      // AI 응답 메시지 저장
      if (conversationId) {
        try {
          await saveMessage({
            conversationId,
            role: 'assistant',
            content: message.content
          })
        } catch (error) {
          console.error('Error saving assistant message:', error)
          toast.error('AI 응답을 저장하는데 실패했습니다.')
        }
      }
    },
    onError: () => {
      setIsError(true)
    }
  })

  // 대화 메시지 가져오기
  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) return
      
      setIsLoadingMessages(true)
      try {
        const response = await fetch(`/api/conversations/${conversationId}/messages`)
        
        if (!response.ok) {
          throw new Error('메시지를 불러오는데 실패했습니다.')
        }
        
        const data = await response.json()
        setLoadedMessages(data.messages || [])
      } catch (error) {
        console.error('Error fetching messages:', error)
        toast.error('메시지를 불러오는데 실패했습니다.')
      } finally {
        setIsLoadingMessages(false)
      }
    }
    
    fetchMessages()
  }, [conversationId])

  const { theme, setTheme } = useTheme()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 채팅창 자동 스크롤
  useEffect(() => {
    if (conversationId) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, loadedMessages, conversationId])

  // 페이지 로드시 입력창에 포커스
  useEffect(() => {
    if (conversationId) {
      inputRef.current?.focus()
    }
  }, [conversationId])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // 새 대화 생성
  const createNewConversation = async () => {
    setIsCreating(true)
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
      router.push(`/?id=${newConversation.id}`)
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast.error('새 대화를 생성하는데 실패했습니다.')
    } finally {
      setIsCreating(false)
    }
  }

  // 메시지 저장 함수
  const saveMessage = async ({ 
    conversationId, 
    role, 
    content 
  }: { 
    conversationId: string, 
    role: 'user' | 'assistant' | 'system', 
    content: string 
  }) => {
    const response = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role, content }),
    })

    if (!response.ok) {
      throw new Error('메시지를 저장하는데 실패했습니다.')
    }

    return response.json()
  }

  // 메시지 전송 함수
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // input이 비어있거나 conversationId가 없거나 상태가 ready가 아니면 전송 안함
    if (!input.trim() || !conversationId || status !== 'ready') {
      return
    }

    try {
      // 사용자 메시지 저장
      await saveMessage({
        conversationId,
        role: 'user',
        content: input
      })
      
      // AI 응답 요청
      await handleSubmit(e)
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('메시지 전송에 실패했습니다.')
      setIsError(true)
    }
  }

  // 메시지 표시를 위한 통합 배열
  const displayMessages = [
    ...loadedMessages.map(msg => ({
      id: msg.id.toString(),
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      createdAt: new Date(msg.created_at)
    })),
    ...messages.filter(msg => 
      // loadedMessages에 이미 있는 메시지는 제외
      !loadedMessages.some(loaded => 
        loaded.content === msg.content && loaded.role === msg.role
      )
    )
  ]

  return (
    <div className="flex flex-col h-screen">
      {/* 헤더 */}
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h2 className="text-lg font-semibold">채팅</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </header>

      {!conversationId ? (
        // 대화 ID가 없을 때 보여줄 환영 화면
        <div className="flex flex-col items-center justify-center flex-1 p-4">
          <div className="flex flex-col items-center max-w-md text-center gap-6">
            <div className="p-4 rounded-full bg-primary/10">
              <Bot className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">AI 채팅에 오신 것을 환영합니다</h1>
            <p className="text-muted-foreground">
              대화를 시작하려면 아래 버튼을 클릭하거나 사이드바에서 기존 대화를 선택하세요.
            </p>
            <Button 
              className="gap-2" 
              onClick={createNewConversation}
              disabled={isCreating}
            >
              <Plus className="h-4 w-4" />
              새 대화 시작하기
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* 메시지 영역 */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {isLoadingMessages ? (
                <div className="flex justify-center p-4">
                  <p className="text-sm text-muted-foreground">메시지를 불러오는 중...</p>
                </div>
              ) : displayMessages.length === 0 ? (
                <div className="flex justify-center p-4">
                  <p className="text-sm text-muted-foreground">아직 메시지가 없습니다. 대화를 시작해보세요!</p>
                </div>
              ) : (
                displayMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.createdAt?.toLocaleTimeString()}
                      </span>
                    </div>

                    {message.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* 입력 영역 */}
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage}>
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  name="prompt"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1"
                  disabled={status !== 'ready'}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!input.trim() || status !== 'ready'}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
            {status === 'submitted' && <div className="text-sm mt-2">AI가 답변을 생성 중입니다...</div>}
            {isError && <div className="text-sm text-red-500 mt-2">메시지 전송 중 에러가 발생했습니다.</div>}
          </div>
        </>
      )}
    </div>
  )
}
