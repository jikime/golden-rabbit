"use client"

import { useState, useEffect, useRef } from "react"
import { Send, User, Bot, SunMoon, AlertCircle, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from "@ai-sdk/react"
import { EmptyConversation } from "@/components/chat/empty-conversation"
import { useChatWithAuth } from "@/hooks/use-chat-with-auth"
import { UIMessage } from "@/types/chat"

export function ChatMain() {
  const [isError, setIsError] = useState(false)
  const { setTheme, theme } = useTheme()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  // 인증과 통합된 Zustand 스토어 연동
  const { 
    userId,
    user,
    currentConversation, 
    createConversation, 
    addMessage, 
    messages: storeMessages, 
    isLoading: storeIsLoading,
    setIsLoading,
    fetchMessages,
    isAuthenticated,
    authStatus
  } = useChatWithAuth();

  console.log("currentConversation", currentConversation)
  // AI SDK의 useChat 훅 사용 - 항상 호출되도록 최상위에 위치
  const { 
    messages: aiMessages, 
    input, 
    handleInputChange,
    handleSubmit: handleAiSubmit,
    isLoading: aiIsLoading,
    stop
  } = useChat({
    api: "/api/chat",
    body: {
      // 현재 대화 ID를 API에 전달
      data: { conversationId: currentConversation?.id }
    },
    onResponse: async (response) => {
      // 응답이 시작되면 로딩 상태 설정
      setIsLoading(true);
    },
    onFinish: async (message) => {
      // 응답이 완료되면 메시지 저장 및 로딩 상태 해제
      if (currentConversation) {
        // AI 응답 메시지를 Supabase에 저장
        await addMessage({
          content: message.content,
          sender: "ai",
          timestamp: new Date()
        });
      }
      setIsLoading(false);
      setIsError(false);
    },
    onError: (error) => {
      console.error("AI 응답 오류:", error);
      setIsError(true);
      setIsLoading(false);
      
      // 오류 메시지도 저장 (선택적)
      if (currentConversation) {
        addMessage({
          content: "죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.",
          sender: "ai",
          timestamp: new Date(),
          isError: true
        });
      }
    }
  });

  // 현재 대화 ID가 변경될 때 메시지 로드
  useEffect(() => {
    if (currentConversation?.id) {
      fetchMessages(currentConversation.id);
    }
  }, [currentConversation?.id, fetchMessages]);

  // 메시지가 추가될 때마다 스크롤 맨 아래로 이동
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [storeMessages, aiIsLoading, storeIsLoading]);

  // 사용자 인증 확인
  const isAuthLoading = authStatus === "loading"

  // 인증되지 않은 상태이고 로딩 중이 아니면 return null 또는 로딩 상태 UI
  if (!isAuthenticated && !isAuthLoading) {
    // useChatWithAuth 내부에서 리다이렉트 처리함
    return <div className="flex items-center justify-center h-screen">인증이 필요합니다...</div>
  }

  // 인증 로딩 중이면 로딩 UI
  if (isAuthLoading) {
    return <div className="flex items-center justify-center h-screen">로딩 중...</div>
  }

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // 현재 대화가 없으면 새 대화 생성
    if (!currentConversation) {
      await createConversation();
    }
    
    // 사용자 메시지 먼저 UI에 표시하고 Supabase에 저장
    const userMessage = {
      content: input,
      sender: "user" as const,
      timestamp: new Date()
    };
    
    // Supabase에 메시지 저장 후 UI 업데이트
    await addMessage(userMessage);
    
    // AI 응답 요청
    handleAiSubmit(e);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // 현재 대화가 없는 경우 빈 상태 UI 표시
  if (!currentConversation) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)]">
        <header className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center">
            <SidebarTrigger className="mr-2" />
            <h2 className="text-lg font-semibold">채팅</h2>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <div className="text-sm mr-2">
                {user.name || user.email}
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <SunMoon className="h-5 w-5" />
              <span className="sr-only">테마 변경</span>
            </Button>
          </div>
        </header>
        <EmptyConversation />
      </div>
    );
  }

  const isLoadingAny = aiIsLoading || storeIsLoading;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* 헤더 */}
      <header className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center">
          <SidebarTrigger className="mr-2" />
          <h2 className="text-lg font-semibold">
            {currentConversation?.title || "채팅"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <div className="text-sm mr-2">
              {user.name || user.email}
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => createConversation()}
            disabled={isLoadingAny}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            새 대화
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <SunMoon className="h-5 w-5" />
            <span className="sr-only">테마 변경</span>
          </Button>
        </div>
      </header>

      {/* 메시지 영역 */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="flex flex-col space-y-4">
          {storeMessages.length === 0 && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] flex-row">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary mr-2">
                  <Bot className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div className="p-3 rounded-lg bg-secondary text-secondary-foreground">
                  <p>안녕하세요, {user?.name || '사용자'}님! 무엇을 도와드릴까요?</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 대화 목록 */}
          {storeMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex max-w-[80%] ${
                  message.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`flex items-center justify-center h-8 w-8 rounded-full ${
                    message.sender === "user"
                      ? "bg-primary ml-2"
                      : "bg-secondary mr-2"
                  }`}
                >
                  {message.sender === "user" ? (
                    <User className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <Bot className="h-4 w-4 text-secondary-foreground" />
                  )}
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : message.isError
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* 로딩 표시기 */}
          {isLoadingAny && (
            <div className="flex justify-start animate-pulse">
              <div className="flex max-w-[80%] flex-row">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary mr-2">
                  <Bot className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div className="p-3 rounded-lg bg-secondary text-secondary-foreground">
                  <p>생각 중...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 에러 표시 */}
      {isError && (
        <div className="bg-destructive/10 p-2 flex items-center justify-center text-sm">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>오류가 발생했습니다. 다시 시도해 주세요.</span>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="메시지를 입력하세요..."
            value={input}
            onChange={handleInputChange}
            disabled={isLoadingAny}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || isLoadingAny}>
            <Send className="h-4 w-4" />
            <span className="sr-only">전송</span>
          </Button>
        </form>
      </div>
    </div>
  );
} 