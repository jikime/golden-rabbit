import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

// PUT - 댓글 수정
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { text } = await request.json()

    console.log("[v0] Updating comment:", { id, text })

    // 입력 검증
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "댓글 내용이 필요합니다." }, { status: 400 })
    }

    if (text.trim().length === 0) {
      return NextResponse.json({ error: "댓글 내용을 입력해주세요." }, { status: 400 })
    }

    if (text.length > 500) {
      return NextResponse.json({ error: "댓글은 500자 이하로 작성해주세요." }, { status: 400 })
    }

    // 댓글 수정
    const { data, error } = await supabase
      .from("comments")
      .update({
        text: text.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Comment update error:", error)
      return NextResponse.json({ error: "댓글 수정에 실패했습니다." }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 })
    }

    console.log("[v0] Comment updated successfully:", data)

    return NextResponse.json({
      success: true,
      comment: {
        id: data.id,
        text: data.text,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    })
  } catch (error) {
    console.error("[v0] Comment update error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

// DELETE - 댓글 삭제
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    console.log("[v0] Deleting comment:", { id })

    // 댓글 삭제
    const { error } = await supabase.from("comments").delete().eq("id", id)

    if (error) {
      console.error("[v0] Comment delete error:", error)
      return NextResponse.json({ error: "댓글 삭제에 실패했습니다." }, { status: 500 })
    }

    console.log("[v0] Comment deleted successfully")

    return NextResponse.json({
      success: true,
      message: "댓글이 삭제되었습니다.",
    })
  } catch (error) {
    console.error("[v0] Comment delete error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
