"use client"

import type React from "react"

import { useState } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function ChatbotLayout() {
  const [selectedConversation, setSelectedConversation] = useState(1)

  const handleSelectConversation = (id: number) => {
    setSelectedConversation(id)
    setIsMobileMenuOpen(false) // 모바일에서 대화 선택 시 사이드바 닫기
  }

  const handleNewChat = () => {
    console.log("새 대화 시작")
    setIsMobileMenuOpen(false) // 모바일에서 새 채팅 시 사이드바 닫기
  }

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-background">
      {/* 데스크톱 사이드바 */}
      <div className="hidden md:flex md:w-80 md:flex-col">
        <ChatSidebar
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
        />
      </div>

      {/* 모바일 사이드바 */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <ChatSidebar
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
          />
        </SheetContent>
      </Sheet>

      {/* 메인 채팅 인터페이스 */}
      <ChatInterface
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
      />
    </div>
  )
}
