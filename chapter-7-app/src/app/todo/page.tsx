'use client'

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus, Loader2, X } from 'lucide-react'
import { Todo } from "@/lib/supabase-client"

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [newTodo, setNewTodo] = useState<string>('')
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [isUpdating, setIsUpdating] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [inputError, setInputError] = useState<string | null>(null)

  // 할 일 목록을 불러오는 함수
  const fetchTodos = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/todos')
      const data = await response.json()
      
      if (data.success) {
        setTodos(data.todos)
      } else {
        setError('할 일 목록을 불러오는데 실패했습니다.')
      }
    } catch (err) {
      console.error('할 일 목록 불러오기 오류:', err)
      setError('할 일 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 새로운 할 일을 추가하는 함수
  const addTodo = async () => {
    // 입력값 유효성 검사
    if (!newTodo || newTodo.trim() === '') {
      setInputError('할 일 내용을 입력해주세요.')
      return
    }

    try {
      setIsAdding(true)
      setInputError(null)
      
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newTodo }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 새로운 할 일이 추가되면 목록을 다시 불러오기
        await fetchTodos()
        // 입력창 초기화
        setNewTodo('')
      } else {
        setInputError(data.error || '할 일 추가에 실패했습니다.')
      }
    } catch (err) {
      console.error('할 일 추가 오류:', err)
      setInputError('할 일을 추가하는 중 오류가 발생했습니다.')
    } finally {
      setIsAdding(false)
    }
  }

  // 할 일 상태를 토글하는 함수
  const toggleTodo = async (id: string, is_completed: boolean) => {
    try {
      setIsUpdating(true)
      
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_completed }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 화면에 보이는 할 일 목록 즉시 업데이트
        setTodos(todos.map(todo => 
          todo.id === id ? { ...todo, is_completed } : todo
        ))
      } else {
        console.error('할 일 상태 업데이트 실패:', data.error)
        setError('할 일 상태를 업데이트하는데 실패했습니다.')
      }
    } catch (err) {
      console.error('할 일 상태 업데이트 오류:', err)
      setError('할 일 상태를 업데이트하는 중 오류가 발생했습니다.')
    } finally {
      setIsUpdating(false)
    }
  }
  
  // 할 일을 삭제하는 함수
  const deleteTodo = async (id: string) => {
    // 사용자에게 삭제 확인 요청
    const isConfirmed = window.confirm("정말 삭제하시겠습니까?")
    
    // 사용자가 취소를 누른 경우 함수 종료
    if (!isConfirmed) {
      return
    }
    
    try {
      setIsDeleting(true)
      
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 화면에서 삭제된 할 일 제거
        setTodos(todos.filter(todo => todo.id !== id))
      } else {
        console.error('할 일 삭제 실패:', data.error)
        setError('할 일을 삭제하는데 실패했습니다.')
      }
    } catch (err) {
      console.error('할 일 삭제 오류:', err)
      setError('할 일을 삭제하는 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  // 엔터키로 할 일 추가하기
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isAdding) {
      addTodo()
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
      
      {/* 메인 컨테이너 */}
      <div className="relative max-w-lg mx-auto pt-16">
        {/* 헤더 카드 */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 mb-6 border border-white/20 shadow-2xl">
          <h1 className="text-4xl font-bold text-center text-white mb-2 tracking-tight">
            나의 할 일 목록
          </h1>
          <p className="text-center text-white/80 text-sm">
            오늘도 멋진 하루를 만들어보세요 ✨
          </p>
        </div>

        {/* 입력 카드 */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 mb-6 border border-white/20 shadow-2xl">
          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="새로운 할 일을 입력하세요..."
                className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 transition-all duration-300"
                value={newTodo}
                onChange={(e) => {
                  setNewTodo(e.target.value)
                  if (inputError) setInputError(null)
                }}
                onKeyPress={handleKeyPress}
                disabled={isAdding}
              />
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                onClick={addTodo}
                disabled={isAdding}
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    추가
                  </>
                )}
              </Button>
            </div>
            {inputError && (
              <p className="text-red-300 text-sm mt-1 px-1">{inputError}</p>
            )}
          </div>
        </div>

        {/* 할 일 목록 카드 */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-10 w-10 text-white/60 animate-spin mb-3" />
              <p className="text-white/80">로딩 중...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-red-300 text-center">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4 bg-white/10 text-white border-white/30 hover:bg-white/20"
                onClick={() => window.location.reload()}
              >
                다시 시도
              </Button>
            </div>
          ) : todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-white/80 text-center">할 일이 없습니다.</p>
              <p className="text-white/60 text-sm mt-2 text-center">새로운 할 일을 추가해보세요!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todos.map((todo) => (
                <div 
                  key={todo.id}
                  className={`group ${todo.is_completed ? 'bg-white/10' : 'bg-white/20'} backdrop-blur-sm rounded-2xl p-4 border ${todo.is_completed ? 'border-white/20' : 'border-white/30'} hover:bg-white/30 hover:scale-[1.02] transform transition-all duration-300 shadow-lg hover:shadow-xl`}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox 
                      id={`todo-${todo.id}`}
                      checked={todo.is_completed}
                      onCheckedChange={(checked) => toggleTodo(todo.id, checked === true)}
                      disabled={isUpdating}
                      className={`border-white/50 data-[state=checked]:bg-gradient-to-r ${todo.is_completed ? 'data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500' : 'data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500'} data-[state=checked]:border-0`}
                    />
                    <label 
                      htmlFor={`todo-${todo.id}`}
                      className={`flex-1 cursor-pointer font-medium ${todo.is_completed ? 'text-white/60 line-through group-hover:text-white/50' : 'text-white group-hover:text-white/90'} transition-colors duration-200`}
                    >
                      {todo.content}
                    </label>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteTodo(todo.id)}
                      disabled={isDeleting}
                      className="bg-red-500/20 hover:bg-red-500/40 text-white border-red-500/30 transition-all duration-300"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 통계 정보 */}
          {!isLoading && !error && todos.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/20">
              <div className="flex justify-between text-white/80 text-sm">
                <span>전체 할 일: {todos.length}개</span>
                <span>완료: {todos.filter(todo => todo.is_completed).length}개</span>
              </div>
            </div>
          )}
        </div>

        {/* 하단 장식 */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-sm">
            💪 오늘도 화이팅!
          </p>
        </div>
      </div>

      {/* 배경 장식 요소들 */}
      <div className="fixed top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="fixed top-1/3 right-10 w-16 h-16 bg-purple-300/20 rounded-full blur-lg animate-pulse delay-1000"></div>
      <div className="fixed bottom-20 left-1/4 w-12 h-12 bg-pink-300/20 rounded-full blur-lg animate-pulse delay-500"></div>
    </div>
  )
}
