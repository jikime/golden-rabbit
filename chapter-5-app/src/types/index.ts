// 대화방 타입 정의
export type Conversation = {
  id: number
  title: string
  created_at: string
}

// 메시지 타입 정의
export type Message = {
  id: number
  conversation_id: number
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
} 