"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

// 할 일 아이템 타입 정의
interface TodoItem {
  id: number
  content: string
  is_completed: boolean
  created_at: string
  user_id: string
}

export default function TodoPage() {
  // 새로운 할 일 입력값을 관리하는 상태
  const [newTodo, setNewTodo] = useState("")
  // 로딩 상태 관리
  const [loading, setLoading] = useState(true)
  // 에러 메시지 관리
  const [error, setError] = useState<string | null>(null)

  // 할 일 목록을 관리하는 상태
  const [todos, setTodos] = useState<TodoItem[]>([])

  // 할 일 목록 불러오기
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/todos")
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "할 일을 불러오는데 실패했습니다.")
        }
        
        const data = await response.json()
        setTodos(data.todos)
        setError(null)
      } catch (err) {
        console.error("할 일 목록 조회 실패:", err)
        setError(err instanceof Error ? err.message : "할 일을 불러오는데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }

    fetchTodos()
  }, [])

  // 새로운 할 일 추가 함수
  const addTodo = async () => {
    // 입력값 유효성 검사
    if (newTodo.trim() === "") return

    try {
      // API로 POST 요청 보내기
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newTodo,
        }),
      })

      // 요청이 성공했는지 확인 (상태 코드 201)
      if (response.ok && response.status === 201) {
        // 서버로부터 새로 생성된 할 일 데이터 받기
        const newTodoData = await response.json()
        
        // 기존 목록의 끝에 새로운 할 일 추가
        setTodos([...todos, newTodoData])
        
        // 입력 필드 초기화
        setNewTodo("")
      } else {
        // 요청 실패 시 에러 처리
        const errorData = await response.json()
        console.error("할 일 추가 실패:", errorData.error || "알 수 없는 오류")
      }
    } catch (error) {
      // 네트워크 오류 등 예외 처리
      console.error("할 일 추가 중 오류 발생:", error)
    }
  }

  // 할 일 완료 상태 토글 함수
  const toggleTodo = async (id: number, newCompletedState: boolean) => {
    try {
      // API로 PATCH 요청 보내기
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_completed: newCompletedState,
        }),
      })

      // 요청이 성공했는지 확인
      if (response.ok) {
        // 서버로부터 업데이트된 할 일 데이터 받기
        const updatedTodo = await response.json()
        
        // 로컬 todos 상태를 서버 응답으로 업데이트
        setTodos(todos.map((todo) => 
          todo.id === id ? { ...todo, is_completed: updatedTodo.is_completed } : todo
        ))
      } else {
        // 요청 실패 시 에러 처리
        const errorData = await response.json()
        console.error("할 일 상태 업데이트 실패:", errorData.error || "알 수 없는 오류")
      }
    } catch (error) {
      // 네트워크 오류 등 예외 처리
      console.error("할 일 상태 업데이트 중 오류 발생:", error)
    }
  }

  // 할 일 삭제 함수
  const deleteTodo = async (id: number) => {
    // 사용자에게 삭제 확인 대화상자 표시
    const isConfirmed = window.confirm("정말 이 작업을 삭제하시겠습니까?")
    
    // 사용자가 취소를 눌렀으면 함수 종료
    if (!isConfirmed) return
    
    try {
      // API로 DELETE 요청 보내기
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      })

      // 요청이 성공했는지 확인
      if (response.ok) {
        // 성공하면 로컬 상태에서도 해당 할 일 제거
        setTodos(todos.filter((todo) => todo.id !== id))
      } else {
        // 요청 실패 시 에러 처리
        const errorData = await response.json()
        console.error("할 일 삭제 실패:", errorData.error || "알 수 없는 오류")
      }
    } catch (error) {
      // 네트워크 오류 등 예외 처리
      console.error("할 일 삭제 중 오류 발생:", error)
    }
  }

  // 엔터 키 입력 처리 함수
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo()
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-24">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">나의 할 일 목록</h1>

        {/* 새 할 일 입력 영역 */}
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="무엇을 해야 하나요?"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={addTodo}>추가</Button>
        </div>

        {/* 로딩 및 에러 표시 */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">할 일 목록을 불러오는 중...</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* 할 일 목록 영역 */}
        {!loading && !error && (
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="flex flex-col gap-3">
              {todos.map((todo) => (
                <Card key={todo.id} className="shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`todo-${todo.id}`}
                        checked={todo.is_completed}
                        onCheckedChange={(checked) => toggleTodo(todo.id, checked as boolean)}
                      />
                      <label
                        htmlFor={`todo-${todo.id}`}
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                          todo.is_completed ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {todo.content}
                      </label>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteTodo(todo.id)}
                      className="text-xs"
                    >
                      삭제
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {todos.length === 0 && (
                <p className="text-center text-muted-foreground py-4">할 일이 없습니다. 새로운 할 일을 추가해보세요!</p>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </main>
  )
}
