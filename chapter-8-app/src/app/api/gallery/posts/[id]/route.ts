import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

// PATCH - 게시물 수정
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { description, tags } = await request.json()

    console.log("[v0] Updating post:", { id, description, tags })

    // 입력 검증
    if (description !== undefined && typeof description !== "string") {
      return NextResponse.json({ error: "설명은 문자열이어야 합니다." }, { status: 400 })
    }

    if (tags !== undefined && !Array.isArray(tags)) {
      return NextResponse.json({ error: "태그는 배열이어야 합니다." }, { status: 400 })
    }

    // 설명 길이 제한 (2000자)
    if (description && description.length > 2000) {
      return NextResponse.json({ error: "설명은 2000자 이하로 입력해주세요." }, { status: 400 })
    }

    // 태그 개수 및 길이 제한
    if (tags && tags.length > 10) {
      return NextResponse.json({ error: "태그는 최대 10개까지 입력할 수 있습니다." }, { status: 400 })
    }

    if (tags && tags.some((tag: string) => typeof tag !== "string" || tag.length > 50)) {
      return NextResponse.json({ error: "각 태그는 50자 이하의 문자열이어야 합니다." }, { status: 400 })
    }

    // 게시물 존재 여부 확인
    const { data: postExists, error: postCheckError } = await supabase.from("posts").select("id").eq("id", id).single()

    if (postCheckError || !postExists) {
      console.error("[v0] Post not found:", id, postCheckError)
      return NextResponse.json({ error: "존재하지 않는 게시물입니다." }, { status: 404 })
    }

    // 업데이트할 데이터 준비
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (description !== undefined) {
      updateData.description = description.trim()
    }

    if (tags !== undefined) {
      updateData.tags = tags.map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
    }

    // 게시물 수정
    const { data, error } = await supabase.from("posts").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("[v0] Post update error:", error)
      return NextResponse.json({ error: "게시물 수정에 실패했습니다." }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "게시물을 찾을 수 없습니다." }, { status: 404 })
    }

    console.log("[v0] Post updated successfully:", data)

    return NextResponse.json({
      success: true,
      post: {
        id: data.id,
        imageUrl: data.image_url,
        description: data.description,
        tags: data.tags || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    })
  } catch (error) {
    console.error("[v0] Post update error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

// DELETE - 게시물 삭제 및 스토리지 정리
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    console.log("[v0] Deleting post:", id)

    // 게시물 존재 여부 확인 및 이미지 URL 가져오기
    const { data: post, error: postCheckError } = await supabase
      .from("posts")
      .select("id, image_url")
      .eq("id", id)
      .single()

    if (postCheckError || !post) {
      console.error("[v0] Post not found:", id, postCheckError)
      return NextResponse.json({ error: "존재하지 않는 게시물입니다." }, { status: 404 })
    }

    // 연결된 댓글 먼저 삭제
    const { error: commentsDeleteError } = await supabase.from("comments").delete().eq("post_id", id)

    if (commentsDeleteError) {
      console.error("[v0] Comments deletion error:", commentsDeleteError)
      return NextResponse.json({ error: "댓글 삭제에 실패했습니다." }, { status: 500 })
    }

    // 스토리지에서 이미지 파일 삭제
    if (post.image_url) {
      try {
        // URL에서 파일 경로 추출 (예: https://...storage.../gallery-images/filename.jpg -> filename.jpg)
        const urlParts = post.image_url.split("/")
        const fileName = urlParts[urlParts.length - 1]

        console.log("[v0] Deleting storage file:", fileName)

        const { error: storageError } = await supabase.storage.from("gallery-images").remove([fileName])

        if (storageError) {
          console.error("[v0] Storage deletion error:", storageError)
          // 스토리지 삭제 실패해도 게시물은 삭제 진행 (orphaned file은 나중에 정리)
        } else {
          console.log("[v0] Storage file deleted successfully:", fileName)
        }
      } catch (storageError) {
        console.error("[v0] Storage deletion failed:", storageError)
        // 스토리지 삭제 실패해도 게시물은 삭제 진행
      }
    }

    // 게시물 삭제
    const { error: postDeleteError } = await supabase.from("posts").delete().eq("id", id)

    if (postDeleteError) {
      console.error("[v0] Post deletion error:", postDeleteError)
      return NextResponse.json({ error: "게시물 삭제에 실패했습니다." }, { status: 500 })
    }

    console.log("[v0] Post deleted successfully:", id)

    return NextResponse.json({
      success: true,
      message: "게시물이 성공적으로 삭제되었습니다.",
    })
  } catch (error) {
    console.error("[v0] Post deletion error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
