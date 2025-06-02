"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useChatStore } from "@/lib/store"
import { useAuth } from "./use-auth"

/**
 * 인증과 통합된 채팅 상태 관리 훅
 * NextAuth의 세션 정보를 자동으로 가져와서 채팅 스토어에 사용자 ID를 설정하고
 * 필요한 경우 로그인 페이지로 리다이렉트
 */
export function useChatWithAuth() {
  const { data: session, status } = useSession()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  
  const { 
    conversations,
    currentConversation,
    messages,
    isLoading,
    fetchConversations,
    createConversation,
    updateConversationTitle,
    fetchMessages,
    addMessage,
    setCurrentConversation,
    setIsLoading,
    setUserId,
    userId
  } = useChatStore()

  // 세션 정보가 로드되면 사용자 ID를 스토어에 설정
  useEffect(() => {
    if (isAuthenticated && session?.user?.id) {
      setUserId(session.user.id)
      // 대화 목록 초기 로드
      fetchConversations()
      // 새 로그인 시 현재 대화를 null로 설정하여 빈 화면이 나오도록 함
      setCurrentConversation(null)
    } else if (status === "unauthenticated") {
      // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
      router.push("/auth/signin")
    }
  }, [isAuthenticated, session, status, setUserId, fetchConversations, router, setCurrentConversation])

  return {
    // 상태
    userId: session?.user?.id || null,
    user: session?.user || null,
    conversations,
    currentConversation,
    messages,
    isLoading,
    isAuthenticated,
    authStatus: status,
    
    // 액션
    fetchConversations,
    createConversation: () => createConversation(session?.user?.id),
    updateConversationTitle,
    fetchMessages,
    addMessage: (message: Omit<import("@/types/chat").UIMessage, "id">) => 
      addMessage(message, session?.user?.id),
    setCurrentConversation,
    setIsLoading,
  }
} 