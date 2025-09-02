"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Edit, Trash2, Send, ArrowUpDown, Check, X, MessageCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState, useRef } from "react"

interface Comment {
  id: string
  text: string
  createdAt: string
}

interface PostCardProps {
  id: string
  imageUrl: string
  description: string
  createdAt: string
  comments?: Comment[]
  tags?: string[]
  onEdit?: (post: { id: string; imageUrl: string; description: string; tags: string[] }) => void
  onDelete?: (postId: string) => void
}

export function PostCard({
  id,
  imageUrl,
  description,
  createdAt,
  comments = [],
  tags = [],
  onEdit,
  onDelete,
}: PostCardProps) {
  const [newComment, setNewComment] = useState("")
  const [postComments, setPostComments] = useState<Comment[]>(comments)
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const commentInputRef = useRef<HTMLInputElement>(null)

  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/gallery/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: id,
          text: newComment.trim(),
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const newCommentData: Comment = {
          id: result.comment.id,
          text: result.comment.text,
          createdAt: result.comment.createdAt,
        }
        setPostComments([...postComments, newCommentData])
        setNewComment("")
      } else {
        console.error("댓글 추가 실패:", result.error)
        alert(result.error || "댓글 추가에 실패했습니다.")
      }
    } catch (error) {
      console.error("댓글 추가 오류:", error)
      alert("댓글 추가 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddComment()
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return

    try {
      const response = await fetch(`/api/gallery/comments/${commentId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setPostComments(postComments.filter((comment) => comment.id !== commentId))
      } else {
        console.error("댓글 삭제 실패:", result.error)
        alert(result.error || "댓글 삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("댓글 삭제 오류:", error)
      alert("댓글 삭제 중 오류가 발생했습니다.")
    }
  }

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id)
    setEditingText(comment.text)
  }

  const handleSaveEdit = async () => {
    if (!editingText.trim() || !editingCommentId) return

    try {
      const response = await fetch(`/api/gallery/comments/${editingCommentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: editingText.trim(),
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setPostComments(
          postComments.map((comment) =>
            comment.id === editingCommentId ? { ...comment, text: result.comment.text } : comment,
          ),
        )
        setEditingCommentId(null)
        setEditingText("")
      } else {
        console.error("댓글 수정 실패:", result.error)
        alert(result.error || "댓글 수정에 실패했습니다.")
      }
    } catch (error) {
      console.error("댓글 수정 오류:", error)
      alert("댓글 수정 중 오류가 발생했습니다.")
    }
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditingText("")
  }

  const handleReplyClick = () => {
    commentInputRef.current?.focus()
  }

  const handleEdit = () => {
    onEdit?.({
      id,
      imageUrl,
      description,
      tags,
    })
  }

  const handleDelete = async () => {
    if (!confirm("게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return

    try {
      const response = await fetch(`/api/gallery/posts/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (response.ok && result.success) {
        onDelete?.(id)
      } else {
        console.error("게시물 삭제 실패:", result.error)
        alert(result.error || "게시물 삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("게시물 삭제 오류:", error)
      alert("게시물 삭제 중 오류가 발생했습니다.")
    }
  }

  const getSortedComments = () => {
    return [...postComments].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "방금 전"
    if (diffInHours < 24) return `${diffInHours}시간 전`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}일 전`
    return date.toLocaleDateString("ko-KR")
  }

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-card">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={description || `Gallery image ${id}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{formatDate(createdAt)}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReplyClick}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              title="답글 달기"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{description}</p>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {postComments.length > 0 && (
          <div className="space-y-2 border-t pt-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium text-muted-foreground">댓글 {postComments.length}개</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowUpDown className="h-3 w-3 mr-1" />
                {sortOrder === "newest" ? "최신순" : "오래된순"}
              </Button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {getSortedComments().map((comment) => (
                <div key={comment.id} className="group/comment relative">
                  {editingCommentId === comment.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="text-sm"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <Button size="sm" onClick={handleSaveEdit} className="h-6 px-2 text-xs">
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="h-6 px-2 text-xs">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-foreground leading-relaxed">{comment.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatDate(comment.createdAt)}</p>
                        </div>
                        <div className="opacity-0 group-hover/comment:opacity-100 transition-opacity duration-200 flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartEdit(comment)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2 border-t">
          <div className="flex gap-2">
            <Input
              ref={commentInputRef}
              placeholder="댓글을 입력하세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <Button
              onClick={handleAddComment}
              size="sm"
              disabled={!newComment.trim() || isSubmitting}
              className="px-3 min-w-[44px] hover:scale-105 transition-transform"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Enter 키를 눌러 댓글을 작성하거나 전송 버튼을 클릭하세요.</p>
        </div>
      </div>
    </Card>
  )
}
