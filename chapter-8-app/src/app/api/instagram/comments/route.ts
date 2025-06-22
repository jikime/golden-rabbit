import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"
import { getUserIdFromSession } from "@/lib/server-auth"

export async function POST(request: Request) {
  try {
    console.log("POST /api/instagram/comments - Starting comment creation")

    // 사용자 인증 확인
    const userId = await getUserIdFromSession()
    if (!userId) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    // 요청 본문에서 데이터 추출
    const body = await request.json()
    const { post_id, content } = body

    console.log("Received comment data:", { post_id, content })

    // 유효성 검사
    if (!post_id) {
      return NextResponse.json({ error: "게시물 ID가 필요합니다." }, { status: 400 })
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "댓글 내용이 필요합니다." }, { status: 400 })
    }

    // 댓글 내용 길이 제한 (예: 500자)
    if (content.trim().length > 500) {
      return NextResponse.json({ error: "댓글은 500자를 초과할 수 없습니다." }, { status: 400 })
    }

    // 게시물 존재 여부 확인
    const { data: postExists, error: postCheckError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", post_id)
      .single()

    if (postCheckError || !postExists) {
      console.error("Post check error:", postCheckError)
      return NextResponse.json({ error: "존재하지 않는 게시물입니다." }, { status: 404 })
    }

    // comments 테이블에 새 댓글 삽입
    const { data: commentData, error: insertError } = await supabase
      .from("comments")
      .insert({
        post_id: post_id,
        user_id: userId,
        content: content.trim(),
      })
      .select()
      .single()

    if (insertError) {
      console.error("Comment insert error:", insertError)
      return NextResponse.json({ error: `댓글 저장 실패: ${insertError.message}` }, { status: 500 })
    }

    console.log("Comment created successfully:", commentData.id)

    // 성공 응답 반환
    return NextResponse.json(
      {
        message: "댓글이 성공적으로 작성되었습니다.",
        comment: commentData,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Unexpected error in POST /api/instagram/comments:", error)
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
