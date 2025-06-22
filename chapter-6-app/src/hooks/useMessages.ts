import { useState } from 'react'
import { Message } from '@/types'

export function useMessages(conversationId?: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 특정 대화방의 메시지 목록 가져오기
  const fetchMessages = async (id?: string | null) => {
    // id가 없으면 현재 conversationId 사용
    const targetId = id || conversationId
    
    if (!targetId) {
      setMessages([])
      return []
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/conversations/${targetId}/messages`)
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error || '메시지를 가져오는데 실패했습니다.')
      
      setMessages(data.messages)
      return data.messages
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError(err instanceof Error ? err.message : '메시지를 가져오는데 실패했습니다.')
      return []
    } finally {
      setLoading(false)
    }
  }

  return {
    messages,
    loading,
    error,
    fetchMessages,
  }
} 