import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Conversation } from '@/types'

export function useConversation() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // 모든 대화방 목록 가져오기
  const fetchConversations = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/conversations')
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error || '대화방을 가져오는데 실패했습니다.')
      
      setConversations(data.conversations)
      return data.conversations
    } catch (err) {
      console.error('Error fetching conversations:', err)
      setError(err instanceof Error ? err.message : '대화방을 가져오는데 실패했습니다.')
      return []
    } finally {
      setLoading(false)
    }
  }

  // 새 대화방 생성하기
  const createConversation = async (title = '새 대화') => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      })
      
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error || '대화방 생성에 실패했습니다.')
      
      await fetchConversations()
      
      // 생성된 대화방으로 이동
      if (data.conversation && data.conversation.id) {
        router.push(`/?id=${data.conversation.id}`)
        return data.conversation
      } else {
        throw new Error('생성된 대화방 정보가 유효하지 않습니다.')
      }
    } catch (err) {
      console.error('Error creating conversation:', err)
      setError(err instanceof Error ? err.message : '대화방 생성에 실패했습니다.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    conversations,
    loading,
    error,
    fetchConversations,
    createConversation,
  }
} 