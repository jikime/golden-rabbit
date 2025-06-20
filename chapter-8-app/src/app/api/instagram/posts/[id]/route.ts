import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const postId = params.id
    console.log(`DELETE /api/instagram/posts/${postId} - Starting post deletion`)

    // 유효성 검사
    if (!postId) {
      return NextResponse.json({ error: "게시물 ID가 필요합니다." }, { status: 400 })
    }

    // 1. 게시물 정보 조회 (이미지 URL 확인용)
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("id, image_url, user_id")
      .eq("id", postId)
      .single()

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        // 게시물이 존재하지 않는 경우
        return NextResponse.json({ error: "존재하지 않는 게시물입니다." }, { status: 404 })
      }
      console.error("Post fetch error:", fetchError)
      return NextResponse.json({ error: `게시물 조회 실패: ${fetchError.message}` }, { status: 500 })
    }

    console.log("Found post to delete:", { id: post.id, image_url: post.image_url })

    // 2. 관련 데이터 삭제 (외래 키 제약 조건 때문에 순서 중요)

    // 2-1. 댓글 삭제
    const { error: commentsDeleteError } = await supabase.from("comments").delete().eq("post_id", postId)

    if (commentsDeleteError) {
      console.error("Comments delete error:", commentsDeleteError)
      return NextResponse.json({ error: `댓글 삭제 실패: ${commentsDeleteError.message}` }, { status: 500 })
    }

    // 2-2. 좋아요 삭제
    const { error: likesDeleteError } = await supabase.from("likes").delete().eq("post_id", postId)

    if (likesDeleteError) {
      console.error("Likes delete error:", likesDeleteError)
      return NextResponse.json({ error: `좋아요 삭제 실패: ${likesDeleteError.message}` }, { status: 500 })
    }

    // 3. 스토리지에서 이미지 파일 삭제
    if (post.image_url) {
      try {
        // 이미지 URL에서 파일명 추출
        const url = new URL(post.image_url)
        const pathSegments = url.pathname.split("/")
        const fileName = pathSegments[pathSegments.length - 1]

        console.log("Attempting to delete file:", fileName)

        const { error: storageDeleteError } = await supabase.storage.from("gallery-images").remove([fileName])

        if (storageDeleteError) {
          console.error("Storage delete error:", storageDeleteError)
          // 스토리지 삭제 실패는 경고로만 처리 (데이터베이스 삭제는 계속 진행)
          console.warn(`스토리지 파일 삭제 실패: ${storageDeleteError.message}`)
        } else {
          console.log("File deleted successfully from storage:", fileName)
        }
      } catch (urlError) {
        console.error("URL parsing error:", urlError)
        console.warn("이미지 URL 파싱 실패, 스토리지 삭제를 건너뜁니다.")
      }
    }

    // 4. 게시물 레코드 삭제
    const { error: postDeleteError } = await supabase.from("posts").delete().eq("id", postId)

    if (postDeleteError) {
      console.error("Post delete error:", postDeleteError)
      return NextResponse.json({ error: `게시물 삭제 실패: ${postDeleteError.message}` }, { status: 500 })
    }

    console.log("Post deleted successfully:", postId)

    // 5. 성공 응답 반환
    return NextResponse.json(
      {
        message: "게시물이 성공적으로 삭제되었습니다.",
        deletedPostId: postId,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Unexpected error in DELETE /api/instagram/posts/[id]:", error)
    const errorMessage = error instanceof Error ? error.message : "예상치 못한 오류가 발생했습니다."

    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
