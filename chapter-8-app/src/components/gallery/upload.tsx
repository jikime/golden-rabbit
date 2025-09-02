"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { X, Upload, ImageIcon, Loader2 } from "lucide-react"

interface UploadModalProps {
  children: React.ReactNode
  onUpload?: (data: { image: File; description: string; tags: string[] }) => void
  onSuccess?: () => void
}

export function UploadModal({ children, onUpload, onSuccess }: UploadModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 파일 형식 검증 (jpeg, png, gif만 허용)
      const validTypes = ["image/jpeg", "image/png", "image/gif"]
      const maxSizeInBytes = 3 * 1024 * 1024 // 3MB
      
      if (!validTypes.includes(file.type)) {
        setError("JPEG, PNG, GIF 형식의 이미지만 업로드 가능합니다.")
        event.target.value = "" // 파일 선택 초기화
        return
      }
      
      // 파일 크기 검증 (3MB 이하만 허용)
      if (file.size > maxSizeInBytes) {
        setError("이미지 크기는 3MB 이하여야 합니다.")
        event.target.value = "" // 파일 선택 초기화
        return
      }
      
      setError(null)
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  // 업로드 진행률 시뮬레이션을 위한 함수
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isUploading && uploadProgress < 95) {
      interval = setInterval(() => {
        setUploadProgress((prev) => {
          // 진행 속도를 점점 느리게 만들어 실제 업로드 느낌을 줍니다
          const increment = Math.max(1, 10 * Math.exp(-prev / 20))
          return Math.min(95, prev + increment)
        })
      }, 300)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isUploading, uploadProgress])

  const handleUpload = async () => {
    if (!selectedImage || !description.trim()) return

    setIsUploading(true)
    setError(null)
    setUploadProgress(0) // 업로드 시작 시 진행률 초기화

    try {
      const formData = new FormData()
      formData.append("image", selectedImage)
      formData.append("description", description.trim())
      formData.append("tags", tags.join(","))

      console.log("[v0] Uploading to API:", { description, tags })

      const response = await fetch("/api/gallery/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "업로드에 실패했습니다.")
      }

      console.log("[v0] Upload successful:", result)

      onUpload?.({ image: selectedImage, description: description.trim(), tags })

      onSuccess?.()
      
      setUploadProgress(100) // 업로드 완료 시 100%로 설정
      
      // 업로드 완료 후 잠시 기다렸다가 모달 닫기
      setTimeout(() => {
        resetForm()
        setOpen(false)
      }, 500)
    } catch (err) {
      console.error("[v0] Upload error:", err)
      setError(err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다.")
      setUploadProgress(100) // 오류 발생 시에도 100%로 설정
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setDescription("")
    setTags([])
    setTagInput("")
    setError(null)
    setUploadProgress(0)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) resetForm()
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Photo</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image-upload">Photo</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg object-cover"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-transparent"
                    onClick={() => {
                      setSelectedImage(null)
                      setImagePreview(null)
                    }}
                  >
                    Change Photo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <Label htmlFor="image-upload" className="cursor-pointer text-primary hover:text-primary/80">
                      Click to select a photo
                    </Label>
                    <p className="text-sm text-muted-foreground">or drag and drop</p>
                  </div>
                </div>
              )}
              <Input id="image-upload" type="file" accept="image/jpeg,image/png,image/gif" className="hidden" onChange={handleImageSelect} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Write a description for your photo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button type="button" variant="outline" onClick={handleAddTag} disabled={!tagInput.trim()}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    #{tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>업로드 진행 중...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!selectedImage || !description.trim() || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                업로드 중...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                게시하기
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
