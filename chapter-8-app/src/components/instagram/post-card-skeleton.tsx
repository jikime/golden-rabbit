import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AspectRatio } from "@/components/ui/aspect-ratio"

export default function PostCardSkeleton() {
  return (
    <Card className="w-full overflow-hidden rounded-lg shadow-sm">
      {/* 카드 헤더: 프로필 정보 스켈레톤 */}
      <CardHeader className="flex flex-row items-center space-x-3 p-4">
        {/* 아바타 스켈레톤 */}
        <Skeleton className="h-10 w-10 rounded-full" />
        {/* 사용자명 스켈레톤 */}
        <Skeleton className="h-4 w-24" />
        {/* 더보기 버튼 스켈레톤 */}
        <div className="ml-auto">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </CardHeader>

      {/* 카드 콘텐츠: 이미지 스켈레톤 */}
      <CardContent className="p-0">
        <AspectRatio ratio={1 / 1} className="bg-muted">
          <Skeleton className="h-full w-full" />
        </AspectRatio>
      </CardContent>

      {/* 카드 푸터: 액션 버튼, 좋아요, 캡션 등 스켈레톤 */}
      <CardFooter className="flex flex-col items-start p-4 space-y-3">
        {/* 액션 버튼 스켈레톤 */}
        <div className="flex space-x-1">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full ml-2" />
          <Skeleton className="h-6 w-6 rounded-full ml-2" />
        </div>

        {/* 좋아요 텍스트 스켈레톤 */}
        <Skeleton className="h-4 w-20" />

        {/* 캡션 스켈레톤 */}
        <div className="w-full space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* 댓글 스켈레톤 */}
        <Skeleton className="h-4 w-32" />
        <div className="w-full space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>

        {/* 시간 스켈레톤 */}
        <Skeleton className="h-3 w-16" />

        {/* 댓글 입력 스켈레톤 */}
        <div className="w-full flex space-x-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardFooter>
    </Card>
  )
} 