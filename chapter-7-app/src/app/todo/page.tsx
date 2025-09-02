'use client'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus } from 'lucide-react'

export default function TodoPage() {
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
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="새로운 할 일을 입력하세요..."
              className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 transition-all duration-300"
            />
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </div>
        </div>

        {/* 할 일 목록 카드 */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl">
          <div className="space-y-4">
            {/* 샘플 할 일 항목 1 - 미완료 */}
            <div className="group bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30 hover:bg-white/30 hover:scale-[1.02] transform transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="flex items-center gap-4">
                <Checkbox 
                  id="todo-1" 
                  className="border-white/50 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500 data-[state=checked]:border-0"
                />
                <label 
                  htmlFor="todo-1" 
                  className="flex-1 text-white cursor-pointer font-medium group-hover:text-white/90 transition-colors duration-200"
                >
                  프로젝트 기획서 작성하기
                </label>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-10 w-10 p-0 text-white/60 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 샘플 할 일 항목 2 - 완료됨 */}
            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 hover:scale-[1.02] transform transition-all duration-300 shadow-lg">
              <div className="flex items-center gap-4">
                <Checkbox 
                  id="todo-2" 
                  checked 
                  className="border-white/50 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500 data-[state=checked]:border-0"
                />
                <label 
                  htmlFor="todo-2" 
                  className="flex-1 text-white/60 cursor-pointer line-through font-medium group-hover:text-white/50 transition-colors duration-200"
                >
                  회의 자료 준비하기
                </label>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-10 w-10 p-0 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 샘플 할 일 항목 3 - 미완료 */}
            <div className="group bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30 hover:bg-white/30 hover:scale-[1.02] transform transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="flex items-center gap-4">
                <Checkbox 
                  id="todo-3" 
                  className="border-white/50 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500 data-[state=checked]:border-0"
                />
                <label 
                  htmlFor="todo-3" 
                  className="flex-1 text-white cursor-pointer font-medium group-hover:text-white/90 transition-colors duration-200"
                >
                  운동하기
                </label>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-10 w-10 p-0 text-white/60 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* 통계 정보 */}
          <div className="mt-6 pt-4 border-t border-white/20">
            <div className="flex justify-between text-white/80 text-sm">
              <span>전체 할 일: 3개</span>
              <span>완료: 1개</span>
            </div>
          </div>
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
