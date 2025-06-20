"use client"

import { useState, useEffect } from "react"
import PostCard from "@/components/instagram/post-card"
import PostCardSkeleton from "@/components/instagram/post-card-skeleton"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import ImageUploadModal from "@/components/instagram/image-upload-modal"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// API 응답으로 받을 게시물 데이터 타입 정의
interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
}

interface PostData {
  id: string
  created_at: string
  user_id: string
  image_url: string
  caption: string | null
  comments: Comment[]
  likes_count: number
  is_liked: boolean
}

export default function InstagramFeedPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [posts, setPosts] = useState<PostData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  // 게시물 데이터 가져오기 함수
  const fetchPosts = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Fetching posts from /api/instagram")

      const response = await fetch("/api/instagram", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP Error: ${response.status}`)
        } else {
          const errorText = await response.text()
          console.error("Non-JSON error response:", errorText)
          throw new Error(`서버 오류 (${response.status}): ${errorText.substring(0, 100)}...`)
        }
      }

      const data: PostData[] = await response.json()
      console.log("Successfully fetched posts:", data.length)
      setPosts(data)
    } catch (err) {
      console.error("Failed to fetch posts:", err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("게시물을 불러오는 중 알 수 없는 오류가 발생했습니다.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 게시물 삭제 처리
  const handlePostDeleted = (deletedPostId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== deletedPostId))
    console.log("Post removed from UI:", deletedPostId)
  }

  // 게시 시간 포맷 함수
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffInMs = now.getTime() - date.getTime()
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
      const diffInDays = Math.floor(diffInHours / 24)

      if (diffInHours < 1) {
        return "방금 전"
      } else if (diffInHours < 24) {
        return `${diffInHours}시간 전`
      } else if (diffInDays < 7) {
        return `${diffInDays}일 전`
      } else {
        return date.toLocaleDateString("ko-KR")
      }
    } catch (e) {
      return "알 수 없음"
    }
  }

  // 로딩 상태 UI 렌더링
  const renderLoadingState = () => {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((index) => (
          <PostCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    )
  }

  // 에러 상태 UI 렌더링
  const renderErrorState = () => {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>게시물을 불러오는 데 실패했습니다</AlertTitle>
          <AlertDescription className="mt-2">
            {error || "서버 연결에 문제가 발생했습니다."}
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={fetchPosts}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          다시 시도
        </Button>
      </div>
    )
  }

  // 데이터 없음 상태 UI 렌더링
  const renderEmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Plus className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">표시할 게시물이 없습니다</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          첫 번째 게시물을 업로드하고 친구들과 공유해보세요!
        </p>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> 새 게시물 업로드
        </Button>
      </div>
    )
  }

  // 게시물 목록 UI 렌더링
  const renderPosts = () => {
    return (
      <div className="space-y-8">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            username={`사용자 ${post.user_id.substring(0, 8)}`}
            avatarSrc="/placeholder.svg?height=40&width=40"
            avatarFallback={post.user_id.substring(0, 2).toUpperCase()}
            imgSrc={post.image_url}
            imgAlt={post.caption || `게시물 이미지 ${post.id}`}
            likes={post.likes_count}
            caption={post.caption || ""}
            timestamp={formatTimestamp(post.created_at)}
            commentsCount={post.comments?.length || 0}
            comments={post.comments || []}
            isLiked={post.is_liked}
            onPostDeleted={handlePostDeleted}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 py-8">
      <header className="container mx-auto max-w-2xl px-4 md:px-0 mb-6 sticky top-0 bg-slate-50/80 dark:bg-neutral-900/80 backdrop-blur-md py-4 z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">피드</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> 업로드
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 md:px-0">
        {isLoading && renderLoadingState()}
        {!isLoading && error && renderErrorState()}
        {!isLoading && !error && posts.length === 0 && renderEmptyState()}
        {!isLoading && !error && posts.length > 0 && renderPosts()}
      </main>

      <ImageUploadModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
