import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

// 임시 사용자 ID
const TEMP_USER_ID = "6f984bf4-59da-4758-a8c2-e86ccdb2fe6e"

// 파일 유효성 검사를 위한 상수
const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3MB
const VALID_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"]

export async function GET() {
  try {
    console.log("GET /api/instagram - Starting to fetch posts with comments and likes")

    // posts, comments, likes를 함께 조회
    const { data: posts, error } = await supabase
      .from("posts")
      .select(`
        *,
        comments (
          id,
          content,
          created_at,
          user_id
        ),
        likes (
          id,
          user_id,
          created_at
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        {
          error: "데이터베이스 조회 중 오류가 발생했습니다.",
          details: error.message,
        },
        { status: 500 },
      )
    }

    // 각 게시물의 댓글을 생성 시간 순으로 정렬하고, 좋아요 정보 처리
    const postsWithProcessedData =
      posts?.map((post) => ({
        ...post,
        comments:
          post.comments?.sort(
            (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
          ) || [],
        likes_count: post.likes?.length || 0,
        is_liked: post.likes?.some((like: any) => like.user_id === TEMP_USER_ID) || false,
      })) || []

    console.log(`Successfully fetched ${postsWithProcessedData.length} posts with comments and likes`)
    return NextResponse.json(postsWithProcessedData)
  } catch (e) {
    console.error("Unexpected error in GET /api/instagram:", e)
    const errorMessage = e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다."

    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log("POST /api/instagram - Starting image upload")

    // 1. 데이터 수신 - FormData 형태로 전송된 요청 받기
    const formData = await request.formData()

    // 2. 데이터 추출 및 유효성 검사
    const imageFile = formData.get("imageFile") as File | null
    const caption = formData.get("caption") as string | null

    console.log("Received file:", imageFile?.name, "Caption:", caption)

    // 이미지 파일 유효성 검사
    if (!imageFile) {
      return NextResponse.json({ error: "이미지 파일이 필요합니다." }, { status: 400 })
    }

    // 파일 타입 검사 - 허용된 MIME 타입만 검사
    if (!VALID_FILE_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { 
          error: "지원되지 않는 파일 형식입니다.", 
          details: `JPG, PNG, GIF 형식만 업로드 가능합니다. (제공된 형식: ${imageFile.type})` 
        }, 
        { status: 400 }
      )
    }

    // 파일 크기 검사 (3MB)
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: "파일 크기 제한 초과", 
          details: `파일 크기는 3MB를 초과할 수 없습니다. (현재 크기: ${(imageFile.size / (1024 * 1024)).toFixed(2)}MB)` 
        }, 
        { status: 400 }
      )
    }

    // 3. Supabase 스토리지에 파일 업로드
    const fileExtension = imageFile.name.split(".").pop()
    const uniqueFileName = `${crypto.randomUUID()}_${Date.now()}.${fileExtension}`

    console.log("Uploading file with name:", uniqueFileName)

    // 파일을 ArrayBuffer로 변환
    const fileBuffer = await imageFile.arrayBuffer()

    // Supabase 스토리지에 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("gallery-images")
      .upload(uniqueFileName, fileBuffer, {
        contentType: imageFile.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      return NextResponse.json({ error: `파일 업로드 실패: ${uploadError.message}` }, { status: 500 })
    }

    console.log("File uploaded successfully:", uploadData.path)

    // 4. 이미지 URL 가져오기
    const { data: urlData } = supabase.storage.from("gallery-images").getPublicUrl(uniqueFileName)

    const imageUrl = urlData.publicUrl
    console.log("Public URL:", imageUrl)

    // 5. Supabase 데이터베이스에 정보 저장
    const { data: postData, error: dbError } = await supabase
      .from("posts")
      .insert({
        user_id: TEMP_USER_ID,
        image_url: imageUrl,
        caption: caption || null,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database insert error:", dbError)

      // 롤백: 데이터베이스 저장 실패 시 업로드된 파일 삭제
      try {
        await supabase.storage.from("gallery-images").remove([uniqueFileName])
        console.log("Rollback: 업로드된 파일이 삭제되었습니다.")
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError)
      }

      return NextResponse.json({ error: `데이터베이스 저장 실패: ${dbError.message}` }, { status: 500 })
    }

    console.log("Post created successfully:", postData.id)

    // 6. 성공 응답 반환
    return NextResponse.json(
      {
        message: "게시물이 성공적으로 업로드되었습니다.",
        post: postData,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Unexpected error in POST /api/instagram:", error)
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
