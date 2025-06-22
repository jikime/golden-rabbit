import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"
import { getUserIdFromSession } from "@/lib/server-auth"

export async function POST(request: Request) {
  try {
    console.log("POST /api/instagram/like - Adding like")

    // 사용자 인증 확인
    const userId = await getUserIdFromSession()
    if (!userId) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    // 요청 본문에서 데이터 추출
    const body = await request.json()
    const { post_id } = body

    console.log("Received like data:", { post_id, user_id: userId })

    // 유효성 검사
    if (!post_id) {
      return NextResponse.json({ error: "게시물 ID가 필요합니다." }, { status: 400 })
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

    // 이미 좋아요를 눌렀는지 확인
    const { data: existingLike, error: likeCheckError } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", post_id)
      .eq("user_id", userId)
      .single()

    if (likeCheckError && likeCheckError.code !== "PGRST116") {
      // PGRST116은 "no rows returned" 에러 코드
      console.error("Like check error:", likeCheckError)
      return NextResponse.json({ error: "좋아요 상태 확인 중 오류가 발생했습니다." }, { status: 500 })
    }

    if (existingLike) {
      return NextResponse.json({ error: "이미 좋아요를 누른 게시물입니다." }, { status: 409 })
    }

    // likes 테이블에 새 좋아요 추가
    const { data: likeData, error: insertError } = await supabase
      .from("likes")
      .insert({
        post_id: post_id,
        user_id: userId,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Like insert error:", insertError)
      return NextResponse.json({ error: `좋아요 저장 실패: ${insertError.message}` }, { status: 500 })
    }

    console.log("Like added successfully:", likeData.id)

    // 성공 응답 반환
    return NextResponse.json(
      {
        message: "좋아요가 추가되었습니다.",
        like: likeData,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Unexpected error in POST /api/instagram/like:", error)
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

export async function DELETE(request: Request) {
  try {
    console.log("DELETE /api/instagram/like - Removing like")

    // 사용자 인증 확인
    const userId = await getUserIdFromSession()
    if (!userId) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    // 요청 본문에서 데이터 추출
    const body = await request.json()
    const { post_id } = body

    console.log("Received unlike data:", { post_id, user_id: userId })

    // 유효성 검사
    if (!post_id) {
      return NextResponse.json({ error: "게시물 ID가 필요합니다." }, { status: 400 })
    }

    // 좋아요 존재 여부 확인 및 삭제
    const { data: deletedLike, error: deleteError } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", post_id)
      .eq("user_id", userId)
      .select()
      .single()

    if (deleteError) {
      if (deleteError.code === "PGRST116") {
        // 삭제할 좋아요가 없는 경우
        return NextResponse.json({ error: "좋아요를 누르지 않은 게시물입니다." }, { status: 404 })
      }
      console.error("Like delete error:", deleteError)
      return NextResponse.json({ error: `좋아요 삭제 실패: ${deleteError.message}` }, { status: 500 })
    }

    console.log("Like removed successfully:", deletedLike.id)

    // 성공 응답 반환
    return NextResponse.json(
      {
        message: "좋아요가 취소되었습니다.",
        like: deletedLike,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Unexpected error in DELETE /api/instagram/like:", error)
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
