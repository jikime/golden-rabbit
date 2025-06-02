import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase-client';
import { UIMessage } from '@/types/chat';

interface Conversation {
  id: number;
  title: string;
  created_at: string;
  user_id: string;
}

interface ChatStore {
  // 상태
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: UIMessage[];
  isLoading: boolean;
  userId: string | null;
  
  // 액션
  setUserId: (userId: string) => void;
  fetchConversations: () => Promise<void>;
  createConversation: (userId?: string) => Promise<number | null>;
  updateConversationTitle: (id: number, newTitle: string) => Promise<void>;
  fetchMessages: (conversationId: number) => Promise<void>;
  addMessage: (message: Omit<UIMessage, 'id'>, userId?: string) => Promise<string | null>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversation: null,
      messages: [],
      isLoading: false,
      userId: null,
      
      setUserId: (userId) => {
        set({ userId });
        // 사용자 ID가 설정되면 해당 사용자의 대화 목록 불러오기
        if (userId) {
          get().fetchConversations();
        } else {
          // 로그아웃 시 대화 목록과 현재 대화 초기화
          set({ conversations: [], currentConversation: null, messages: [] });
        }
      },

      fetchConversations: async () => {
        try {
          const userId = get().userId;
          if (!userId) return;
          
          const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) throw error;
          set({ conversations: data || [] });
        } catch (error) {
          console.error('대화 목록을 불러오는 중 오류 발생:', error);
        }
      },

      createConversation: async (userId) => {
        try {
          const currentUserId = userId || get().userId;
          if (!currentUserId) return null;
          
          const { data, error } = await supabase
            .from('conversations')
            .insert([{ 
              title: '새 대화',
              user_id: currentUserId
            }])
            .select();

          if (error) throw error;
          
          if (data && data.length > 0) {
            const newConversation = data[0];
            
            // 대화 목록 업데이트
            set((state) => ({
              conversations: [newConversation, ...state.conversations],
              currentConversation: newConversation,
              messages: [] // 새 대화를 시작할 때 메시지 목록 초기화
            }));
            
            return newConversation.id;
          }
          return null;
        } catch (error) {
          console.error('대화 생성 중 오류 발생:', error);
          return null;
        }
      },

      updateConversationTitle: async (id: number, newTitle: string) => {
        try {
          const userId = get().userId;
          if (!userId) return;
          
          const { error } = await supabase
            .from('conversations')
            .update({ title: newTitle })
            .eq('id', id)
            .eq('user_id', userId);

          if (error) throw error;
          
          // 상태 업데이트
          set((state) => ({
            conversations: state.conversations.map(conv => 
              conv.id === id ? { ...conv, title: newTitle } : conv
            ),
            currentConversation: state.currentConversation?.id === id 
              ? { ...state.currentConversation, title: newTitle }
              : state.currentConversation
          }));
        } catch (error) {
          console.error('대화 제목 수정 중 오류 발생:', error);
        }
      },

      fetchMessages: async (conversationId) => {
        try {
          const userId = get().userId;
          if (!userId) return;
          
          // 해당 대화에 대한 접근 권한 확인 (사용자 소유 대화인지)
          const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .select('id')
            .eq('id', conversationId)
            .eq('user_id', userId)
            .single();
            
          if (convError) {
            console.error('대화 접근 권한이 없습니다:', convError);
            return;
          }
          
          // 대화의 모든 메시지 가져오기 (user_id와 관계없이)
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

          if (error) throw error;

          // Supabase에서 가져온 메시지를 UI 메시지 형식으로 변환
          const uiMessages = data.map(msg => ({
            id: msg.id.toString(),
            content: msg.content,
            sender: (msg.role === 'user' ? 'user' : 'ai') as 'user' | 'ai',
            timestamp: new Date(msg.created_at),
            isError: false // 기본값 설정
          }));

          set({ messages: uiMessages });
        } catch (error) {
          console.error('메시지를 불러오는 중 오류 발생:', error);
        }
      },

      addMessage: async (message, userId) => {
        const { currentConversation } = get();
        if (!currentConversation) return null;
        
        const currentUserId = userId || get().userId;
        if (!currentUserId) return null;

        try {
          // 메시지 DB에 저장 (사용자 메시지는 user_id를 설정, AI 메시지는 user_id를 null로 설정)
          const { data, error } = await supabase
            .from('messages')
            .insert([{
              conversation_id: currentConversation.id,
              role: message.sender === 'user' ? 'user' : 'assistant',
              content: message.content,
              user_id: message.sender === 'user' ? currentUserId : null
            }])
            .select();

          if (error) throw error;

          if (data && data.length > 0) {
            // 메시지 목록 업데이트
            const newMessage: UIMessage = {
              id: data[0].id.toString(),
              content: data[0].content,
              sender: data[0].role === 'user' ? 'user' : 'ai',
              timestamp: new Date(data[0].created_at),
              isError: message.isError
            };

            set((state) => ({
              messages: [...state.messages, newMessage],
            }));
            
            // 첫 메시지인 경우 대화 제목 업데이트
            const { messages } = get();
            if (messages.length === 1 && message.sender === 'user') {
              const truncatedTitle = message.content.length > 20 
                ? `${message.content.substring(0, 20)}...` 
                : message.content;
              
              get().updateConversationTitle(currentConversation.id, truncatedTitle);
            }
            
            return data[0].id.toString();
          }
          return null;
        } catch (error) {
          console.error('메시지 추가 중 오류 발생:', error);
          return null;
        }
      },

      setCurrentConversation: (conversation) => {
        // 대화 변경 시 메시지 초기화
        set({ currentConversation: conversation, messages: [] });
        
        // 대화가 있고 사용자 ID도 있으면 메시지 가져오기
        if (conversation) {
          // 현재 사용자의 대화인지 확인
          const userId = get().userId;
          if (userId && conversation.user_id === userId) {
            get().fetchMessages(conversation.id);
          } else if (userId) {
            // 기존 대화 데이터가 있지만 user_id가 없는 경우(이전 버전 호환성)
            // 사용자 ID를 업데이트
            supabase
              .from('conversations')
              .update({ user_id: userId })
              .eq('id', conversation.id)
              .then(({ error }) => {
                if (!error) {
                  // 현재 대화 객체에도 user_id 추가
                  set(state => ({
                    currentConversation: { ...state.currentConversation!, user_id: userId }
                  }));
                  get().fetchMessages(conversation.id);
                }
              });
          }
        }
      },

      setIsLoading: (isLoading) => {
        set({ isLoading });
      },
    }),
    {
      name: 'chatbot-storage', // storage 이름
      partialize: (state) => ({ // 저장할 state만 선택
        currentConversation: state.currentConversation,
        userId: state.userId
      }),
      onRehydrateStorage: () => (state) => {
        // 저장된 상태가 복원된 후 실행
        if (state && state.userId) {
          // 사용자 ID가 있으면 대화 목록 불러오기
          setTimeout(() => {
            const store = useChatStore.getState();
            store.fetchConversations();
            // 페이지 새로고침 시 현재 대화를 초기화하여 빈 화면이 나오도록 함
            store.setCurrentConversation(null);
          }, 0);
        }
      }
    }
  )
); 