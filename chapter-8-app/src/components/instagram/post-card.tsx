"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Heart, MessageCircle, Send, MoreHorizontal, Trash2 } from "lucide-react"

// 댓글 데이터 타입 정의
interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
}

interface PostCardProps {
  id: string
  username: string
  avatarSrc: string
  avatarFallback: string
  imgSrc: string
  imgAlt: string
  likes: number
  caption: string
  timestamp: string
  commentsCount?: number
  comments?: Comment[]
  isLiked?: boolean // 현재 사용자가 좋아요를 눌렀는지 여부
  onPostDeleted?: (postId: string) => void // 게시물 삭제 콜백
}

export default function PostCard({
  id,
  username,
  avatarSrc,
  avatarFallback,
  imgSrc,
  imgAlt,
  likes,
  caption,
  timestamp,
  commentsCount,
  comments = [],
  isLiked = false,
  onPostDeleted,
}: PostCardProps) {
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [localComments, setLocalComments] = useState<Comment[]>(comments)

  // 좋아요 상태 관리
  const [isLikedState, setIsLikedState] = useState(isLiked)
  const [likesCount, setLikesCount] = useState(likes)
  const [isLikeProcessing, setIsLikeProcessing] = useState(false)

  // 삭제 관련 상태
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // 댓글 입력 필드 참조
  const commentInputRef = useRef<HTMLInputElement>(null)

  let viewCommentsLinkText = "댓글 모두 보기"
  if (commentsCount && commentsCount > 0) {
    viewCommentsLinkText = `댓글 ${commentsCount}개 모두 보기`
  } else if (commentsCount === 0) {
    viewCommentsLinkText = "댓글 추가하기"
  }

  // 삭제 버튼 클릭 처리
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  // 삭제 확인 처리
  const handleDeleteConfirm = async () => {
    if (isDeleting) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/instagram/posts/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "게시물 삭제에 실패했습니다.")
      }

      const result = await response.json()
      console.log("Post deleted successfully:", result)

      // 성공 시 부모 컴포넌트에 삭제 완료 알림
      if (onPostDeleted) {
        onPostDeleted(id)
      }

      // 모달 닫기
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Delete error:", error)
      const errorMessage = error instanceof Error ? error.message : "게시물 삭제 중 오류가 발생했습니다."
      alert(`삭제 실패: ${errorMessage}`)
    } finally {
      setIsDeleting(false)
    }
  }

  // 댓글 아이콘 클릭 처리 - 댓글 입력 필드로 포커스 이동
  const handleCommentIconClick = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus()
      // 부드러운 스크롤로 댓글 입력 영역으로 이동
      commentInputRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }

  // 좋아요 버튼 클릭 처리
  const handleLikeToggle = async () => {
    if (isLikeProcessing) return

    setIsLikeProcessing(true)

    // 낙관적 업데이트 (UI 먼저 변경)
    const newLikedState = !isLikedState
    const newLikesCount = newLikedState ? likesCount + 1 : likesCount - 1

    setIsLikedState(newLikedState)
    setLikesCount(newLikesCount)

    try {
      const method = newLikedState ? "POST" : "DELETE"
      const response = await fetch("/api/instagram/like", {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "좋아요 처리에 실패했습니다.")
      }

      const result = await response.json()
      console.log("Like toggle successful:", result)
    } catch (error) {
      console.error("Like toggle error:", error)

      // 오류 발생 시 상태 롤백
      setIsLikedState(isLikedState)
      setLikesCount(likesCount)

      const errorMessage = error instanceof Error ? error.message : "좋아요 처리 중 오류가 발생했습니다."
      alert(`좋아요 실패: ${errorMessage}`)
    } finally {
      setIsLikeProcessing(false)
    }
  }

  // 댓글 작성 처리
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmittingComment) return

    setIsSubmittingComment(true)

    try {
      const response = await fetch("/api/instagram/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: id,
          content: newComment.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "댓글 작성에 실패했습니다.")
      }

      const result = await response.json()
      console.log("Comment created:", result)

      // 새 댓글을 로컬 상태에 추가
      const newCommentData: Comment = {
        id: result.comment.id,
        content: newComment.trim(),
        created_at: result.comment.created_at,
        user_id: result.comment.user_id,
      }

      setLocalComments((prev) => [...prev, newCommentData])
      setNewComment("") // 입력 필드 초기화
    } catch (error) {
      console.error("Comment submission error:", error)
      const errorMessage = error instanceof Error ? error.message : "댓글 작성 중 오류가 발생했습니다."
      alert(`댓글 작성 실패: ${errorMessage}`)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // 댓글 시간 포맷 함수
  const formatCommentTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffInMs = now.getTime() - date.getTime()
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      const diffInHours = Math.floor(diffInMinutes / 60)
      const diffInDays = Math.floor(diffInHours / 24)

      if (diffInMinutes < 1) {
        return "방금"
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}분`
      } else if (diffInHours < 24) {
        return `${diffInHours}시간`
      } else if (diffInDays < 7) {
        return `${diffInDays}일`
      } else {
        return date.toLocaleDateString("ko-KR")
      }
    } catch (e) {
      return ""
    }
  }

  return (
    <>
      <Card className="w-full overflow-hidden rounded-lg shadow-sm">
        {/* 1. CardHeader: 프로필 정보 및 더보기 버튼 */}
        <CardHeader className="flex flex-row items-center space-x-3 p-4">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={avatarSrc || "/placeholder.svg"} alt={`${username}님의 프로필 사진`} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <Link href={`/${username}`} className="font-semibold text-sm hover:underline">
            {username}
          </Link>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">더보기 옵션</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleDeleteClick}
                  className="text-red-500 hover:!text-red-500 focus:text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/50 dark:focus:bg-red-900/50 cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {/* 2. CardContent: 이미지 (패딩 없이 꽉 차게) */}
        <CardContent className="p-0">
          <AspectRatio ratio={1 / 1} className="bg-muted">
            <Image src={imgSrc || "/placeholder.svg"} alt={imgAlt} fill className="object-cover" priority />
          </AspectRatio>
        </CardContent>

        {/* 3. 카드 하단 영역: 액션 버튼, 좋아요 수, 캡션 등 */}
        <CardFooter className="flex flex-col items-start p-4 space-y-3">
          {/* a. 아이콘 버튼들 */}
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLikeToggle}
              disabled={isLikeProcessing}
              className="hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Heart
                className={`h-6 w-6 transition-all duration-200 ${
                  isLikedState
                    ? "fill-red-500 text-red-500 scale-110"
                    : "text-gray-700 dark:text-gray-300 hover:text-red-500"
                }`}
              />
              <span className="sr-only">좋아요</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCommentIconClick}
              className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <MessageCircle className="h-6 w-6 text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors" />
              <span className="sr-only">댓글</span>
            </Button>
            <Button variant="ghost" size="icon">
              <Send className="h-6 w-6" />
              <span className="sr-only">공유</span>
            </Button>
          </div>

          {/* b. '좋아요 X개' 텍스트 */}
          <p className="font-bold text-sm">좋아요 {likesCount}개</p>

          {/* c. 작성자 아이디와 게시물 캡션 */}
          <p className="text-sm">
            <Link href={`/${username}`} className="font-bold hover:underline">
              {username}
            </Link>{" "}
            {caption}
          </p>

          {/* d. "댓글 모두 보기" 링크 텍스트 */}
          <Link href="#" className="text-sm text-muted-foreground hover:underline">
            {viewCommentsLinkText}
          </Link>

          {/* 기존 댓글들 표시 영역 */}
          {localComments.length > 0 && (
            <div className="w-full space-y-2">
              {localComments.slice(0, 3).map((comment) => (
                <div key={comment.id} className="flex items-start space-x-2">
                  <p className="text-sm flex-1">
                    <span className="font-semibold">사용자 {comment.user_id.substring(0, 8)}</span>{" "}
                    <span>{comment.content}</span>
                  </p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatCommentTime(comment.created_at)}
                  </span>
                </div>
              ))}
              {localComments.length > 3 && (
                <p className="text-sm text-muted-foreground">댓글 {localComments.length - 3}개 더 보기...</p>
              )}
            </div>
          )}

          {/* e. 게시 시간 정보 */}
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{timestamp}</p>

          {/* 새 댓글 입력 폼 */}
          <form
            onSubmit={handleCommentSubmit}
            className="w-full flex space-x-2 pt-2 border-t border-gray-100 dark:border-gray-800"
          >
            <Input
              ref={commentInputRef}
              type="text"
              placeholder="댓글 달기..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 border-none shadow-none focus-visible:ring-0 px-0 focus-visible:ring-offset-0"
              disabled={isSubmittingComment}
            />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              disabled={!newComment.trim() || isSubmittingComment}
              className="text-blue-500 hover:text-blue-600 font-semibold px-2"
            >
              {isSubmittingComment ? "게시 중..." : "게시"}
            </Button>
          </form>
        </CardFooter>
      </Card>

      {/* 삭제 확인 AlertDialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>게시물 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 게시물을 정말로 삭제하시겠습니까?
              <br />
              삭제된 게시물은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
