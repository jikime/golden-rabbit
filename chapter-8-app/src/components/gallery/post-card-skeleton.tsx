"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PostCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-sm bg-card">
      {/* 이미지 영역 */}
      <div className="relative aspect-square overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>

      {/* 콘텐츠 영역 */}
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          {/* 날짜 */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>

          {/* 설명 */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          
          {/* 태그 */}
          <div className="flex flex-wrap gap-1 mt-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </div>

        {/* 댓글 영역 */}
        <div className="space-y-2 border-t pt-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-16 mt-1" />
              </div>
            </div>
          </div>
        </div>

        {/* 댓글 입력 영역 */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-10" />
          </div>
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </Card>
  )
}
