"use client"

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Send, Bot, User, Menu } from "lucide-react"

interface ChatInterfaceProps {
  onOpenSidebar: () => void
}

export function ChatInterface({ onOpenSidebar }: ChatInterfaceProps) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  })
  
  const [input, setInput] = useState('')

  const handleSendMessage = () => {
    if (input.trim()) {
      sendMessage({ text: input })
      setInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
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
            <p className="text-xs text-muted-foreground">{status === 'ready' ? '온라인' : '응답 중...'}</p>
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
              {messages.map(message => (
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
                      <p className="text-sm leading-relaxed">
                        {message.parts.map((part, index) =>
                          part.type === 'text' ? <span key={index}>{part.text}</span> : null
                        )}
                      </p>
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
                  disabled={status !== 'ready'}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!input.trim() || status !== 'ready'} 
                  size="icon"
                >
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
