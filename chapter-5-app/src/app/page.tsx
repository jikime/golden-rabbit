import { ChatSidebar } from "@/components/chat-sidebar"
import ChatInterface from "@/components/chat-interface"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function ChatPage() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <ChatSidebar />
        <SidebarInset className="flex-1">
          <ChatInterface />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
