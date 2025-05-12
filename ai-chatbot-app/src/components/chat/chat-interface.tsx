"use client"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { ChatMain } from "@/components/chat/chat-main"
import { SidebarInset } from "@/components/ui/sidebar"

export function ChatInterface() {
  return (
    <div className="h-[calc(100vh-64px)] flex w-full">
      <ChatSidebar />
      <SidebarInset>
        <ChatMain />
      </SidebarInset>
    </div>
  )
} 