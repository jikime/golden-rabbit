import { ChatInterface } from "@/components/chat/chat-interface"
import { SidebarProvider } from "@/components/ui/sidebar"
import { requireAuth } from "@/lib/server-auth"

export default async function Home() {
  // 인증된 사용자만 접근 가능
  await requireAuth()
  
  return (
    <SidebarProvider>
      <ChatInterface />
    </SidebarProvider>
  )
}
