"use client"

import { PostCard } from "@/components/gallery/post-card"
import { PostCardSkeleton } from "@/components/gallery/post-card-skeleton"
import { UploadModal } from "@/components/gallery/upload"
import { SearchBar } from "@/components/gallery/search-bar"
import { EditModal } from "@/components/gallery/edit-modal"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface Comment {
  id: string
  text: string
  createdAt: string
}

interface Post {
  id: string
  imageUrl: string
  description: string
  createdAt: string
  tags: string[]
  comments: Comment[]
}

export default function GalleryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const fetchPosts = async (query?: string) => {
    try {
      setLoading(true)
      // 검색어가 있으면 새로운 검색 API 사용, 없으면 기존 API 사용
      const url = query ? `/api/gallery/posts?query=${encodeURIComponent(query)}` : "/api/gallery/posts"
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Fetched posts data:", data)
      setPosts(data)
      setError(null)
    } catch (err) {
      console.error("[v0] Error fetching posts:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch posts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPosts(searchQuery)
    }, 300) // 300ms 디바운스로 API 호출 최적화

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleUpload = (data: { image: File; description: string; tags: string[] }) => {
    console.log("[v0] Upload data:", data)
  }

  const handleUploadSuccess = () => {
    console.log("[v0] Upload successful, refreshing gallery...")
    fetchPosts(searchQuery)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleEditPost = (post: { id: string; imageUrl: string; description: string; tags: string[] }) => {
    const fullPost = posts.find((p) => p.id === post.id)
    if (fullPost) {
      setEditingPost(fullPost)
      setIsEditModalOpen(true)
    }
  }

  const handleEditSave = (updatedData: { description: string; tags: string[] }) => {
    if (editingPost) {
      setPosts(
        posts.map((post) =>
          post.id === editingPost.id ? { ...post, description: updatedData.description, tags: updatedData.tags } : post,
        ),
      )
    }
  }

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter((post) => post.id !== postId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">Gallery</h1>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">로딩 중...</div>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <SearchBar onSearch={handleSearch} disabled={loading} />
            </div>
          </div>
        </header>

        {/* 스켈레톤 UI */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {Array(10).fill(0).map((_, index) => (
              <PostCardSkeleton key={index} />
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">Gallery</h1>
              <div className="flex items-center gap-4">
                <div className="text-sm text-destructive">오류 발생</div>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <SearchBar onSearch={handleSearch} disabled={true} />
            </div>
          </div>
        </header>

        {/* 에러 메시지 */}
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="max-w-md w-full bg-card p-6 rounded-lg shadow-lg">
              <div className="text-center">
                <div className="text-destructive text-5xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold text-foreground mb-2">게시물을 불러오는 데 실패했습니다</h2>
                <p className="text-muted-foreground mb-6">
                  {error}
                </p>
                <div className="flex justify-center gap-4">
                  <Button onClick={() => fetchPosts()} variant="default">다시 시도</Button>
                  <Button onClick={() => window.location.reload()} variant="outline">페이지 새로고침</Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Gallery</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">{posts.length} photos</div>
              <UploadModal onUpload={handleUpload} onSuccess={handleUploadSuccess}>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Upload
                </Button>
              </UploadModal>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </header>

      {/* Gallery Grid */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              imageUrl={post.imageUrl}
              description={post.description}
              createdAt={post.createdAt}
              comments={post.comments}
              tags={post.tags}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
            />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            {searchQuery ? (
              <>
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-medium text-foreground mb-2">검색 결과가 없습니다</h3>
                <p className="text-muted-foreground mb-6">"{searchQuery}"에 대한 검색 결과를 찾을 수 없습니다.</p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>모든 사진 보기</Button>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-xl font-medium text-foreground mb-2">표시할 게시물이 없습니다</h3>
                <p className="text-muted-foreground mb-6">첫 번째 사진을 업로드해보세요!</p>
                <UploadModal onUpload={handleUpload} onSuccess={handleUploadSuccess}>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    사진 업로드
                  </Button>
                </UploadModal>
              </>
            )}
          </div>
        )}
      </main>

      <EditModal post={editingPost} open={isEditModalOpen} onOpenChange={setIsEditModalOpen} onSave={handleEditSave} />
    </div>
  )
}
