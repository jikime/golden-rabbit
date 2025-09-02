import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    console.log("[v0] Fetching posts with query:", query)

    let supabaseQuery = supabase.from("posts").select(`
        id,
        image_url,
        description,
        tags,
        created_at,
        comments (
          id,
          text,
          created_at
        )
      `)

    if (query && query.trim()) {
      const searchTerm = query.trim()

      // 설명에서 검색하거나 태그 배열에서 검색
      supabaseQuery = supabaseQuery.or(`description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)

      console.log("[v0] Applying search filter:", searchTerm)
    }

    const { data: posts, error } = await supabaseQuery.order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Supabase query error:", error)
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
    }

    const formattedPosts = posts?.map((post) => ({
      id: post.id,
      imageUrl: post.image_url,
      description: post.description,
      tags: post.tags || [],
      createdAt: post.created_at,
      comments:
        post.comments?.map((comment) => ({
          id: comment.id,
          text: comment.text,
          createdAt: comment.created_at,
        })) || [],
    }))

    console.log("[v0] Fetched posts count:", formattedPosts?.length || 0)

    return NextResponse.json(formattedPosts || [])
  } catch (error) {
    console.error("[v0] API route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
