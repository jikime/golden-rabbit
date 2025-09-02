"use client"

import { useState, useEffect } from "react"
import { useChat } from '@ai-sdk/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Menu, Bot, User, Plus } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"

// 메시지 인터페이스 정의
interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

interface ChatInterfaceProps {
  onSelectConversation: (id: number) => void
  onNewChat: () => void
}

export function ChatInterface({
  onSelectConversation,
  onNewChat,
}: ChatInterfaceProps) {
  const [isError, setIsError] = useState(false)
  const [creating, setCreating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null)
  const [conversationMessages, setConversationMessages] = useState<Message[]>([])
  const searchParams = useSearchParams()
  const router = useRouter()
  const conversationId = searchParams.get('id')
  
  // 메시지 목록 가져오기 함수
  const fetchMessages = async (id: number) => {
    try {
      setIsLoadingMessages(true);
      const response = await fetch(`/api/conversations/${id}/messages`);
      
      if (!response.ok) {
        throw new Error('메시지 목록을 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // 대화 정보와 메시지 목록 저장
        setConversationMessages(data.data.messages);
        console.log('불러온 메시지:', data.data.messages);
        console.log('불러온 대화 정보:', data.data.conversation);
      }
    } catch (error) {
      console.error('메시지 목록 가져오기 오류:', error);
      toast.error('메시지 목록을 가져오는데 실패했습니다.');
    } finally {
      setIsLoadingMessages(false);
    }
  };
  
  // URL의 id 쿼리 파라미터가 변경될 때마다 상태 업데이트
  useEffect(() => {
    if (conversationId) {
      const parsedId = parseInt(conversationId)
      if (!isNaN(parsedId)) {
        console.log("대화 ID 변경됨!", parsedId)
        setCurrentConversationId(parsedId)
        onSelectConversation(parsedId)
        
        // 메시지 목록 가져오기
        fetchMessages(parsedId);
      }
    } else {
      setCurrentConversationId(null)
      setConversationMessages([])
    }
  }, [conversationId])

  // useChat 훅을 사용하여 AI 채팅 기능 구현
  const { input, handleInputChange, handleSubmit, status, setMessages } = useChat({
    api: "/api/chat",
    body: {
      data: {
        conversationId: currentConversationId
      }
    },
    onResponse: async () => {
      // 응답 처리
    },
    onFinish: async (message) => {
      try {
        // AI 응답이 있고, 대화 ID가 있는 경우에만 저장
        if (message.content && currentConversationId) {
          // AI 답변을 DB에 저장
          const assistantResponse = await fetch(`/api/conversations/${currentConversationId}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              role: 'assistant',
              content: message.content
            }),
          });
          
          if (!assistantResponse.ok) {
            console.error('AI 응답 저장 실패:', await assistantResponse.text());
          } else {
            // 메시지 목록 다시 가져오기
            fetchMessages(currentConversationId);
          }
        }
      } catch (error) {
        console.error('AI 응답 저장 오류:', error);
      } finally {
        setIsError(false);
        setIsSending(false);
      }
    },
    onError: () => {
      setIsError(true);
      setIsSending(false);
    }
  });

  // conversationMessages가 변경될 때 setMessages를 호출하여 메시지 상태 업데이트
  useEffect(() => {
    if (conversationMessages.length > 0) {
      // 메시지 형식을 useChat이 예상하는 형식으로 변환
      const formattedMessages = conversationMessages.map(msg => ({
        id: msg.id.toString(),
        role: msg.role,
        content: msg.content,
      }));
      setMessages(formattedMessages);
    }
  }, [conversationMessages, setMessages]);

  // 새 대화 생성 함수
  const handleCreateNewChat = async () => {
    try {
      setCreating(true)
      
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: '새 대화' }),
      })
      
      if (!response.ok) {
        throw new Error('새 대화 생성에 실패했습니다.')
      }
      
      const data = await response.json()
      
      // 새 대화 생성 성공 메시지
      toast.success('새 대화가 생성되었습니다.')
      
      // 새로 생성된 대화 선택
      if (data.conversation && data.conversation.id) {
        const newId = data.conversation.id
        setCurrentConversationId(newId)
        onSelectConversation(newId)
        // 새 대화 페이지로 이동
        router.push(`?id=${newId}`)
      }
      
      // onNewChat 콜백 호출
      onNewChat()
    } catch (error) {
      console.error('새 대화 생성 오류:', error)
      toast.error('새 대화 생성에 실패했습니다.')
    } finally {
      setCreating(false)
    }
  }

  // 메시지 전송 함수
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || !currentConversationId || isSending) {
      return;
    }
    
    try {
      setIsSending(true);
      
      // 사용자 메시지를 DB에 저장
      const messageResponse = await fetch(`/api/conversations/${currentConversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'user',
          content: input
        }),
      });
      
      if (!messageResponse.ok) {
        throw new Error('메시지 저장에 실패했습니다.');
      }
      
      // AI 응답 생성을 위해 handleSubmit 호출
      handleSubmit(e);
      
      // 메시지 목록 다시 가져오기
      // fetchMessages(currentConversationId);
      // 주석 처리: AI 응답이 완료된 후 onFinish에서 fetchMessages를 호출하므로 여기서는 필요 없음
      
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      toast.error('메시지 전송에 실패했습니다.');
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background shadow-sm">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <ChatSidebar
                selectedConversation={currentConversationId || 0}
                onSelectConversation={onSelectConversation}
                onNewChat={onNewChat}
              />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">AI 어시스턴트</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">온라인</div>
          <ThemeToggle />
        </div>
      </div>

      {/* 메인 콘텐츠 영역 - 조건부 렌더링 */}
      {currentConversationId ? (
        // 대화 ID가 있을 때 채팅 UI 표시
        <>
          {/* 메시지 패널 */}
          <div className="flex-1 flex flex-col bg-muted/30 min-h-0">
            <ScrollArea className="flex-1 px-4 py-6">
              <div className="max-w-4xl mx-auto space-y-4">
                {isLoadingMessages ? (
                  // 메시지 로딩 중 표시
                  <div className="flex flex-col items-center justify-center h-96 text-center">
                    <div className="bg-background rounded-full p-6 shadow-lg mb-6 border border-border">
                      <Bot className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">메시지를 불러오는 중입니다...</h3>
                    <p className="text-muted-foreground max-w-md">
                      대화 내용을 불러오는 동안 잠시만 기다려주세요.
                    </p>
                  </div>
                ) : conversationMessages.length === 0 ? (
                  // 빈 상태 메시지
                  <div className="flex flex-col items-center justify-center h-96 text-center">
                    <div className="bg-background rounded-full p-6 shadow-lg mb-6 border border-border">
                      <Bot className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">대화를 시작해보세요</h3>
                    <p className="text-muted-foreground max-w-md">
                      질문을 입력하면 AI가 답변해 드립니다.
                      {isError && (
                        <span className="block mt-2 text-destructive">
                          응답 생성 중 오류가 발생했습니다. 다시 시도해주세요.
                        </span>
                      )}
                    </p>
                  </div>
                ) : (
                  conversationMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"} group`}
                    >
                      {/* AI 메시지 - 왼쪽 정렬 */}
                      {message.role === "assistant" && (
                        <>
                          <Avatar className="w-9 h-9 flex-shrink-0 mt-1">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              <Bot className="w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col max-w-[80%]">
                            <div className="bg-background rounded-2xl rounded-tl-md p-4 shadow-sm border border-border">
                              <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                                {message.content}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 ml-3">
                              AI • {new Date(message.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </>
                      )}

                      {/* 사용자 메시지 - 오른쪽 정렬 */}
                      {message.role === "user" && (
                        <>
                          <div className="flex flex-col max-w-[80%] items-end">
                            <div className="bg-primary rounded-2xl rounded-tr-md p-4 shadow-sm">
                              <div className="whitespace-pre-wrap text-sm leading-relaxed text-primary-foreground">
                                {message.content}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 mr-3">
                              나 • {new Date(message.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                          <Avatar className="w-9 h-9 flex-shrink-0 mt-1">
                            <AvatarFallback className="bg-muted text-muted-foreground">
                              <User className="w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                        </>
                      )}
                    </div>
                  ))
                )}

                {/* AI 응답 상태 표시 */}
                {status === 'submitted' && (
                  <div className="flex gap-3 justify-start group">
                    <Avatar className="w-9 h-9 flex-shrink-0 mt-1">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col max-w-[80%]">
                      <div className="bg-background rounded-2xl rounded-tl-md p-4 shadow-sm border border-border">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                          AI가 답변을 생성 중입니다...
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 에러 메시지 */}
                {isError && (
                  <div className="flex justify-center">
                    <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
                      메시지 전송 중 에러가 발생했습니다.
                    </div>
                  </div>
                )}

                {/* 스크롤 하단 여백 */}
                <div className="h-4" />
              </div>
            </ScrollArea>
          </div>

          {/* 입력 패널 */}
          <div className="bg-background border-t border-border shadow-lg flex-shrink-0">
            <div className="p-4">
              <div className="max-w-4xl mx-auto">
                {/* 입력 영역 */}
                <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                  <div className="flex-1 relative">
                    <Input
                      name="prompt"
                      value={input}
                      onChange={handleInputChange}
                      placeholder="메시지를 입력하세요..."
                      className="min-h-[48px] pr-12 resize-none border-input focus:border-ring focus:ring-ring rounded-xl"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage(e as React.FormEvent)
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || status === 'submitted' || isSending}
                    className="h-[48px] w-[48px] bg-primary hover:bg-primary/90 disabled:bg-muted rounded-xl shadow-sm"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </form>

                {/* 하단 안내 텍스트 */}
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <p>AI는 실수할 수 있습니다. 중요한 정보는 확인해 주세요.</p>
                  <p className="hidden sm:block">Enter로 전송 • Shift+Enter로 줄바꿈</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        // 대화 ID가 없을 때 초기 화면 표시
        <div className="flex-1 flex items-center justify-center bg-muted/30">
          <div className="text-center p-8 max-w-md">
            <Bot className="w-20 h-20 text-primary mx-auto mb-8" />
            <h2 className="text-2xl font-bold mb-4">AI 어시스턴트와 대화하기</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              새로운 대화를 시작하거나 왼쪽에서 기존 대화를 선택해주세요.
            </p>
            <Button 
              size="lg" 
              className="gap-2 px-6 py-6 text-lg h-auto"
              onClick={handleCreateNewChat}
              disabled={creating}
            >
              <Plus className="w-5 h-5" />
              {creating ? '생성 중...' : '새 대화 시작하기'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 