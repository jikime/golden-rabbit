"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// 저장된 조합 타입 정의
type SavedCombination = {
  id: string
  numbers: number[]
  timestamp: number
}

export default function LottoGenerator() {
  const [numbers, setNumbers] = useState<number[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [savedCombinations, setSavedCombinations] = useState<SavedCombination[]>([])

  // 컴포넌트 마운트 시 로컬 스토리지에서 저장된 조합 불러오기
  useEffect(() => {
    const savedData = localStorage.getItem("lottoSavedCombinations")
    if (savedData) {
      try {
        setSavedCombinations(JSON.parse(savedData))
      } catch (e) {
        console.error("Failed to parse saved combinations", e)
      }
    }

    // 초기 번호 생성
    generateNumbers()
  }, [])

  // 저장된 조합이 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem("lottoSavedCombinations", JSON.stringify(savedCombinations))
  }, [savedCombinations])

  // 번호 생성 함수
  const generateNumbers = () => {
    setIsGenerating(true)

    // 애니메이션을 위한 짧은 지연
    setTimeout(() => {
      // 1부터 45까지의 숫자 배열 생성
      const allNumbers = Array.from({ length: 45 }, (_, i) => i + 1)

      // Fisher-Yates 알고리즘으로 배열 섞기
      for (let i = allNumbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]]
      }

      // 앞에서 6개 선택하고 정렬
      const selectedNumbers = allNumbers.slice(0, 6).sort((a, b) => a - b)
      setNumbers(selectedNumbers)
      setIsGenerating(false)
    }, 500)
  }

  // 현재 번호 저장 함수
  const saveCurrentNumbers = () => {
    if (numbers.length !== 6) return

    // 이미 동일한 조합이 저장되어 있는지 확인
    const isDuplicate = savedCombinations.some((combo) => JSON.stringify(combo.numbers) === JSON.stringify(numbers))

    if (isDuplicate) {
      alert("이미 동일한 번호 조합이 저장되어 있습니다.")
      return
    }

    const newCombination: SavedCombination = {
      id: Date.now().toString(),
      numbers: [...numbers],
      timestamp: Date.now(),
    }

    setSavedCombinations((prev) => [newCombination, ...prev])
    alert("번호 조합이 저장되었습니다!")
  }

  // 모든 저장된 조합 삭제 함수
  const deleteAllSavedCombinations = () => {
    if (savedCombinations.length === 0) {
      alert("저장된 번호 조합이 없습니다.")
      return
    }

    setSavedCombinations([])
    alert("모든 저장된 번호 조합이 삭제되었습니다.")
  }

  // 번호에 따른 배경색 결정
  const getBallColor = (num: number) => {
    if (num <= 10) return "bg-yellow-500"
    if (num <= 20) return "bg-blue-500"
    if (num <= 30) return "bg-red-500"
    if (num <= 40) return "bg-purple-500"
    return "bg-green-500"
  }

  // 날짜 포맷팅 함수
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <h1 className="text-4xl font-bold mb-10 text-center text-blue-600">로또 6/45 생성기</h1>

      <div className="flex flex-wrap justify-between gap-4 mb-8 w-full max-w-4xl">
        <Button
          onClick={generateNumbers}
          disabled={isGenerating}
          className="px-8 py-6 text-lg font-semibold rounded-xl bg-blue-500 hover:bg-blue-600 shadow-lg transition-all duration-300 disabled:opacity-70"
        >
          {isGenerating ? "생성 중..." : "번호 생성"}
        </Button>

        <div className="flex gap-4">
          <Button
            onClick={saveCurrentNumbers}
            disabled={isGenerating || numbers.length !== 6}
            className="px-8 py-6 text-lg font-semibold rounded-xl bg-green-500 hover:bg-green-600 shadow-lg transition-all duration-300 disabled:opacity-70"
          >
            번호 저장
          </Button>

          <Button
            onClick={deleteAllSavedCombinations}
            disabled={savedCombinations.length === 0}
            variant="destructive"
            className="px-8 py-6 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 disabled:opacity-70"
          >
            전체 삭제
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 w-full max-w-4xl mb-12">
        {numbers.map((number, index) => (
          <Card
            key={`current-${number}-${index}`}
            className={`${getBallColor(number)} border-none shadow-xl overflow-hidden`}
          >
            <CardContent className="flex items-center justify-center p-8 sm:p-6">
              <span className="text-white font-bold text-3xl sm:text-2xl">{number}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 저장된 번호 조합 섹션 */}
      {savedCombinations.length > 0 && (
        <div className="w-full max-w-4xl">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">저장된 번호 조합</h2>
          <div className="space-y-4">
            {savedCombinations.map((combination) => (
              <div
                key={combination.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
              >
                <div className="p-4">
                  <div className="text-sm text-gray-500 mb-2">{formatDate(combination.timestamp)}</div>
                  <div className="flex flex-wrap gap-2">
                    {combination.numbers.map((number, index) => (
                      <div
                        key={`saved-${combination.id}-${index}`}
                        className={`${getBallColor(number)} w-12 h-12 rounded-full flex items-center justify-center shadow-md border border-white/20`}
                      >
                        <span className="text-white font-bold text-lg">{number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
