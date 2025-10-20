"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useChat } from '@ai-sdk/react'
import { TextStreamChatTransport } from 'ai'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Send, Bot, User, Menu, Plus } from "lucide-react"
import { toast } from "sonner"

interface ChatInterfaceProps {
  onOpenSidebar: () => void
}

export function ChatInterface({ onOpenSidebar }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const conversationIdRef = useRef<string | null>(null)
  const searchParams = useSearchParams()
  
  // 메시지 목록을 가져오는 함수
  const fetchMessages = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}/messages`)
      if (response.ok) {
        const data = await response.json()
        console.log('메시지 목록:', data)
        
        // API 응답을 UIMessage 타입에 맞게 변환
        const uiMessages = data.map((msg: any) => ({
          id: msg.id.toString(),
          role: msg.role as 'user' | 'assistant',
          parts: [{
            type: 'text' as const,
            text: msg.content
          }]
        }))
        
        // useChat의 setMessages에 할당
        setMessages(uiMessages)
      } else {
        console.error('메시지 목록을 가져오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('메시지 목록 가져오기 중 오류:', error)
    }
  }
  
  // URL 쿼리 파라미터에서 id 값을 가져와 상태로 저장
  useEffect(() => {
    const id = searchParams.get('id')
    
    // 대화 ID가 변경되었을 때만 로그 출력 및 메시지 가져오기
    if (conversationId !== id) {
      console.log("대화 ID 변경됨!")
      if (id) {
        fetchMessages(id)
      }
    }
    
    setConversationId(id)
    conversationIdRef.current = id
  }, [searchParams, conversationId])
  
  const { messages, sendMessage, setMessages } = useChat({
    transport: new TextStreamChatTransport({ api: '/api/chat' }),
    onFinish: async (message) => {
      // AI 응답이 끝나면 데이터베이스에 저장
      if (conversationIdRef.current && message.message.role === 'assistant') {
        try {
          const textContent = message.message.parts
            .filter(part => part.type === 'text')
            .map(part => part.text)
            .join('')

          if (textContent) {
            const response = await fetch(`/api/conversations/${conversationIdRef.current}/messages`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                role: message.message.role,
                content: textContent
              }),
            })

            if (!response.ok) {
              console.error('AI 응답 저장에 실패했습니다.')
            }
          }
        } catch (error) {
          console.error('AI 응답 저장 중 오류:', error)
        }
      }
    }
  })

  const handleSendMessage = async () => {
    if (!input.trim() || !conversationId) return

    try {
      // 먼저 사용자 메시지를 데이터베이스에 저장
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'user',
          content: input.trim()
        }),
      })

      if (response.ok) {
        // 데이터베이스 저장 성공 후 AI에게 메시지 전송
        sendMessage({ text: input.trim() })
        setInput('')
      } else {
        toast.error('메시지 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('메시지 전송 중 오류:', error)
      toast.error('메시지 전송에 실패했습니다.')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

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
        // 새로 생성된 대화로 페이지 이동
        window.location.href = `/?id=${newConversation.id}`
      } else {
        toast.error('대화 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('API 호출 중 오류:', error)
      toast.error('대화 생성에 실패했습니다.')
    }
  }

  // id가 없으면 초기 화면 표시
  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-foreground">AI 어시스턴트</h2>
              <p className="text-xs text-muted-foreground">온라인</p>
            </div>
          </div>
        </div>

        {/* Initial Screen */}
        <div className="flex-1 flex items-center justify-center bg-muted/30">
          <div className="text-center space-y-6 max-w-md mx-auto px-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">AI Chat에 오신 것을 환영합니다</h3>
              <p className="text-muted-foreground">
                새로운 대화를 시작하거나 왼쪽에서 기존 대화를 선택해주세요.
              </p>
            </div>
            <Button 
              className="w-full justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
              onClick={handleNewConversation}
            >
              <Plus className="h-4 w-4" />
              새 대화 시작하기
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-foreground">AI 어시스턴트</h2>
            <p className="text-xs text-muted-foreground">온라인</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages Panel */}
        <div className="flex-1 flex flex-col min-h-0 bg-muted/30">
          <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
            <h3 className="text-sm font-medium text-muted-foreground">메시지 패널</h3>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`max-w-[70%] ${message.role === "user" ? "order-first" : ""}`}>
                    <Card
                      className={`p-3 ${
                        message.role === "user" ? "bg-blue-500 text-white border-blue-500" : "bg-card border-border"
                      }`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.parts.map((part, i) => {
                          switch (part.type) {
                            case 'text':
                              return <div key={`${message.id}-${i}`}>{part.text}</div>;
                            default:
                              return null;
                          }
                        })}
                      </div>
                    </Card>
                    <p
                      className={`text-xs mt-1 px-1 ${
                        message.role === "user"
                          ? "text-right text-muted-foreground"
                          : "text-left text-muted-foreground"
                      }`}
                    >
                      {new Date().toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-green-500 text-white">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Input Panel */}
        <div className="bg-card border-t border-border flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <h3 className="text-sm font-medium text-muted-foreground">입력 패널</h3>
          </div>
          <div className="p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-2">
                <Input
                  placeholder="메시지를 입력하세요..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!input.trim()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}




