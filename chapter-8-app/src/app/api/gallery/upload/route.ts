import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"
import { Buffer } from "buffer"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // FormData에서 필드 추출
    const imageFile = formData.get("image") as File
    const description = formData.get("description") as string
    const tagsString = formData.get("tags") as string

    // 이미지 파일 존재 여부 검증
    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json({ error: "이미지 파일이 필요합니다." }, { status: 400 })
    }

    // 파일 형식 검증 (MIME 타입)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: "지원되지 않는 파일 형식입니다. JPEG, PNG, WebP, GIF만 허용됩니다." },
        { status: 400 },
      )
    }

    // 파일 크기 검증 (최대 5MB로 제한)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (imageFile.size > maxSize) {
      return NextResponse.json({ error: "파일 크기가 너무 큽니다. 최대 5MB까지 허용됩니다." }, { status: 400 })
    }
    
    // 파일 내용 검증 (magic bytes 확인)
    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const fileSignature = buffer.slice(0, 4).toString('hex')
      
      // 각 이미지 형식의 magic bytes 확인
      const isJPEG = fileSignature.startsWith('ffd8')
      const isPNG = fileSignature === '89504e47'
      const isGIF = fileSignature.startsWith('474946')
      const isWEBP = buffer.slice(8, 12).toString() === 'WEBP'
      
      if (!(isJPEG || isPNG || isGIF || isWEBP)) {
        return NextResponse.json(
          { error: "파일 내용이 유효한 이미지 형식이 아닙니다." },
          { status: 400 },
        )
      }
      
      // MIME 타입과 실제 파일 내용 일치 여부 확인
      if (
        (imageFile.type === 'image/jpeg' && !isJPEG) ||
        (imageFile.type === 'image/png' && !isPNG) ||
        (imageFile.type === 'image/gif' && !isGIF) ||
        (imageFile.type === 'image/webp' && !isWEBP)
      ) {
        return NextResponse.json(
          { error: "파일 확장자와 내용이 일치하지 않습니다." },
          { status: 400 },
        )
      }
    } catch (err) {
      console.error("[v0] File content validation error:", err)
      return NextResponse.json({ error: "이미지 파일 검증에 실패했습니다." }, { status: 400 })
    }

    // 태그 파싱
    const tags = tagsString
      ? tagsString
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : []

    // 고유한 파일명 생성 (파일 확장자를 MIME 타입에 따라 안전하게 결정)
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    
    // MIME 타입에 따라 적절한 확장자 결정
    let fileExtension = ""
    switch (imageFile.type) {
      case "image/jpeg":
        fileExtension = "jpg"
        break
      case "image/png":
        fileExtension = "png"
        break
      case "image/gif":
        fileExtension = "gif"
        break
      case "image/webp":
        fileExtension = "webp"
        break
      default:
        // 이 부분은 앞서 MIME 타입 검증에서 걸러졌을 것이므로 실행되지 않아야 함
        fileExtension = "jpg"
    }
    
    const fileName = `${timestamp}-${randomString}.${fileExtension}`

    console.log("[v0] Uploading file:", fileName, "Size:", imageFile.size, "Type:", imageFile.type)

    // Supabase Storage에 이미지 업로드
    // 업로드 전에 추가 보안 검사
    const fileBuffer = Buffer.from(await imageFile.arrayBuffer())
    
    // 파일 크기 재확인 (클라이언트 측 조작 방지)
    if (fileBuffer.length > maxSize) {
      return NextResponse.json({ error: "파일 크기가 허용 범위를 초과합니다." }, { status: 400 })
    }
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("gallery-images")
      .upload(fileName, fileBuffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: imageFile.type // 정확한 MIME 타입 설정
      })

    if (uploadError) {
      console.error("[v0] Storage upload error:", uploadError)
      return NextResponse.json({ error: "이미지 업로드에 실패했습니다." }, { status: 500 })
    }

    // 업로드된 이미지의 공개 URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from("gallery-images").getPublicUrl(fileName)

    console.log("[v0] Image uploaded successfully:", publicUrl)

    // posts 테이블에 게시물 정보 저장
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .insert({
        image_url: publicUrl,
        description: description || "",
        tags: tags,
      })
      .select()
      .single()

    if (postError) {
      console.error("[v0] Database insert error:", postError)

      // 데이터베이스 저장 실패 시 업로드된 이미지 삭제
      await supabase.storage.from("gallery-images").remove([fileName])

      return NextResponse.json({ error: "게시물 저장에 실패했습니다." }, { status: 500 })
    }

    console.log("[v0] Post created successfully:", postData.id)

    // 성공 응답
    return NextResponse.json({
      success: true,
      post: {
        id: postData.id,
        imageUrl: postData.image_url,
        description: postData.description,
        tags: postData.tags,
        createdAt: postData.created_at,
      },
    })
  } catch (error) {
    console.error("[v0] Upload API error:", error)
    
    // 에러 유형에 따라 더 구체적인 에러 메시지 제공
    if (error instanceof TypeError) {
      return NextResponse.json({ error: "파일 처리 중 오류가 발생했습니다." }, { status: 400 })
    } else if (error instanceof Error && error.message.includes("storage")) {
      return NextResponse.json({ error: "파일 저장소 접근 중 오류가 발생했습니다." }, { status: 500 })
    } else if (error instanceof Error && error.message.includes("database")) {
      return NextResponse.json({ error: "데이터베이스 처리 중 오류가 발생했습니다." }, { status: 500 })
    }
    
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
