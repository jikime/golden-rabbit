"use client"

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { UploadCloud, XCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ImageUploadModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

// 파일 유효성 검사를 위한 상수
const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3MB
const VALID_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"]

export default function ImageUploadModal({ isOpen, onOpenChange }: ImageUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetModalState = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setCaption("")
    setIsDragging(false)
    setError(null)
    setUploadProgress(0)
    setIsUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // 파일 입력 값 초기화
    }
  }

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      // Dialog 닫힘 애니메이션 시간을 고려하여 약간의 딜레이 후 초기화
      const timer = setTimeout(() => {
        resetModalState()
      }, 300) // Dialog의 기본 애니메이션 시간과 유사하게 설정
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // 파일 유효성 검사 함수
  const validateFile = (file: File): boolean => {
    // 파일 형식 검사
    if (!VALID_FILE_TYPES.includes(file.type)) {
      setError("지원되지 않는 파일 형식입니다. JPG, PNG, GIF 형식만 업로드 가능합니다.")
      return false
    }

    // 파일 크기 검사
    if (file.size > MAX_FILE_SIZE) {
      setError(`파일 크기는 3MB를 초과할 수 없습니다. (현재 크기: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`)
      return false
    }

    // 유효성 검사 통과
    setError(null)
    return true
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (validateFile(file)) {
        setSelectedFile(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        // 유효성 검사 실패 시 파일 입력 초기화
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) {
      if (validateFile(file)) {
        setSelectedFile(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string)
        }
        reader.readAsDataURL(file)
        if (fileInputRef.current) {
          // 드롭된 파일을 input에도 반영 (DataTransfer 객체는 직접 할당할 수 없음)
          // 대신 FileList를 생성하는 방식으로 변경
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(file)
          fileInputRef.current.files = dataTransfer.files
        }
      }
    }
  }

  const handleRemovePreview = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const simulateProgress = () => {
    // 실제 업로드 진행 상황을 모방하는 함수
    // 실제로는 XMLHttpRequest나 fetch의 upload progress 이벤트를 사용할 수 있음
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90 // 90%에서 멈추고 실제 응답을 기다림
        }
        return prev + 10
      })
    }, 300)
    return interval
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setIsUploading(true)
      setError(null)
      
      // 업로드 진행 상태 시뮬레이션 시작
      const progressInterval = simulateProgress()

      // FormData 생성
      const formData = new FormData()
      formData.append("imageFile", selectedFile)
      formData.append("caption", caption)

      // API 호출
      const response = await fetch("/api/instagram", {
        method: "POST",
        body: formData,
      })

      // 진행 상태 시뮬레이션 중지 및 100%로 설정
      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "업로드에 실패했습니다.")
      }

      console.log("Upload successful:", result)
      
      // 약간의 딜레이 후 모달 닫기 (100% 진행률을 보여주기 위해)
      setTimeout(() => {
        alert("게시물이 성공적으로 업로드되었습니다!")
        onOpenChange(false)
        // 페이지 새로고침으로 새 게시물 표시 (추후 더 나은 방법으로 개선 가능)
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error("Upload error:", error)
      setUploadProgress(100) // 에러 상태에서도 진행 바는 100%로 표시
      const errorMessage = error instanceof Error ? error.message : "업로드 중 오류가 발생했습니다."
      setError(`업로드 실패: ${errorMessage}`)
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (isUploading && !open) {
        // 업로드 중에는 모달을 닫지 못하도록 함
        return
      }
      onOpenChange(open)
    }}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>새 이미지 업로드</DialogTitle>
          <DialogDescription>공유하고 싶은 이미지를 선택하고 설명을 추가하세요.</DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto p-1 pr-3 space-y-6">
          {/* 에러 메시지 표시 */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 업로드 진행률 표시 */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>업로드 진행 중...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* a. 파일 선택/드래그앤드롭 영역 */}
          {!previewUrl && !isUploading && (
            <div
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer
                ${isDragging ? "border-primary bg-primary-foreground/20" : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"}
                transition-colors duration-200 ease-in-out`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <UploadCloud
                className={`w-12 h-12 mb-3 ${isDragging ? "text-primary" : "text-gray-400 dark:text-gray-500"}`}
              />
              <p className={`mb-2 text-sm ${isDragging ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
                <span className="font-semibold">클릭하여 업로드</span> 또는 드래그앤드롭
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG, GIF (최대 3MB)</p>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg,image/png,image/gif" className="hidden" />
            </div>
          )}

          {/* b. 선택한 이미지 미리보기 공간 */}
          {previewUrl && !isUploading && (
            <div className="relative w-full aspect-square rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
              <Image
                src={previewUrl || "/placeholder.svg"}
                alt="선택한 이미지 미리보기"
                fill
                className="object-contain" // 이미지가 잘리지 않도록 contain으로 설정
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8"
                onClick={handleRemovePreview}
                aria-label="미리보기 제거"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* c. 이미지 설명을 입력할 수 있는 'Textarea' */}
          {previewUrl && !isUploading && (
            <div className="grid w-full gap-1.5">
              <Label htmlFor="caption" className="text-sm font-medium">
                이미지 설명
              </Label>
              <Textarea
                id="caption"
                placeholder="이미지에 대한 설명을 입력하세요..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          )}
        </div>

        <DialogFooter className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <DialogClose asChild>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
              취소
            </Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
            className={isUploading ? "opacity-50 cursor-not-allowed" : ""}
          >
            {isUploading ? "업로드 중..." : "게시하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
