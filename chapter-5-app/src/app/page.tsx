"use client"

import { useState } from "react"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatInterface } from "@/components/chat-interface"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<string>("1")

  return (
    <div className="flex h-screen bg-background">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <ChatSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
      />
      <ChatInterface onOpenSidebar={() => setIsSidebarOpen(true)} />
    </div>
  )
}
