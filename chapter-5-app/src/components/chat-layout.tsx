"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { MessageCircle, Plus, Send, Bot, User, Menu, X } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
}

export function ChatLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentMessage, setCurrentMessage] = useState("")
  const [selectedConversation, setSelectedConversation] = useState<string>("1")

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

  const messages: Message[] = [
    {
      id: "1",
      content: "안녕하세요! 무엇을 도와드릴까요?",
      sender: "bot",
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "2",
      content: "React 컴포넌트 구조에 대해 질문이 있어요.",
      sender: "user",
      timestamp: new Date(Date.now() - 240000),
    },
    {
      id: "3",
      content:
        "React 컴포넌트는 크게 함수형 컴포넌트와 클래스형 컴포넌트로 나뉩니다. 현재는 함수형 컴포넌트와 Hooks를 사용하는 것이 권장됩니다. 컴포넌트는 재사용 가능한 UI 요소를 만들 수 있게 해주며, props를 통해 데이터를 전달받을 수 있습니다.",
      sender: "bot",
      timestamp: new Date(Date.now() - 180000),
    },
    {
      id: "4",
      content: "useState와 useEffect는 어떻게 사용하나요?",
      sender: "user",
      timestamp: new Date(Date.now() - 120000),
    },
    {
      id: "5",
      content:
        "useState는 컴포넌트의 상태를 관리하는 Hook입니다. const [state, setState] = useState(초기값) 형태로 사용하며, useEffect는 컴포넌트의 생명주기나 상태 변화에 따른 부수 효과를 처리할 때 사용합니다.",
      sender: "bot",
      timestamp: new Date(Date.now() - 60000),
    },
  ]

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      // 메시지 전송 로직 구현
      setCurrentMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-sidebar border-r border-sidebar-border
        transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <h1 className="text-xl font-bold text-sidebar-foreground">AI Chat</h1>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
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
                  onClick={() => setSelectedConversation(conversation.id)}
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
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
                    className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.sender === "bot" && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className={`max-w-[70%] ${message.sender === "user" ? "order-first" : ""}`}>
                      <Card
                        className={`p-3 ${
                          message.sender === "user" ? "bg-blue-500 text-white border-blue-500" : "bg-card border-border"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </Card>
                      <p
                        className={`text-xs mt-1 px-1 ${
                          message.sender === "user"
                            ? "text-right text-muted-foreground"
                            : "text-left text-muted-foreground"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {message.sender === "user" && (
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
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!currentMessage.trim()} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
