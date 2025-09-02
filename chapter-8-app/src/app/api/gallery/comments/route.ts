import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, text } = body

    // 필수 필드 검증
    if (!postId || !text) {
      return NextResponse.json({ error: "게시물 ID와 댓글 내용이 필요합니다." }, { status: 400 })
    }

    // 댓글 내용 검증
    if (typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "댓글 내용을 입력해주세요." }, { status: 400 })
    }

    // 댓글 길이 제한 (1000자)
    if (text.trim().length > 1000) {
      return NextResponse.json({ error: "댓글은 1000자 이하로 입력해주세요." }, { status: 400 })
    }

    console.log("[v0] Creating comment for post:", postId, "Text:", text.substring(0, 50) + "...")

    // 게시물 존재 여부 확인
    const { data: postExists, error: postCheckError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", postId)
      .single()

    if (postCheckError || !postExists) {
      console.error("[v0] Post not found:", postId, postCheckError)
      return NextResponse.json({ error: "존재하지 않는 게시물입니다." }, { status: 404 })
    }

    // comments 테이블에 댓글 저장
    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        text: text.trim(),
      })
      .select()
      .single()

    if (commentError) {
      console.error("[v0] Comment insert error:", commentError)
      return NextResponse.json({ error: "댓글 저장에 실패했습니다." }, { status: 500 })
    }

    console.log("[v0] Comment created successfully:", commentData.id)

    // 성공 응답
    return NextResponse.json({
      success: true,
      comment: {
        id: commentData.id,
        text: commentData.text,
        createdAt: commentData.created_at,
        postId: commentData.post_id,
      },
    })
  } catch (error) {
    console.error("[v0] Comments API error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
