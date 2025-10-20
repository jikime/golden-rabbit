'use client';

import { useState, useRef, useEffect } from 'react';
import { Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Memo } from '@/app/page';

interface StickerMemoProps {
  memo: Memo;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  index: number;
}

export default function StickerMemo({ memo, onUpdate, onDelete, index }: StickerMemoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(memo.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 자연스러운 회전 각도 (인덱스 기반)
  const rotation = [2, -1, 1.5, -2, 0.5, -1.5, 2.5, -0.5][index % 8];

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    onUpdate(memo.id, content);
  };

  const handleCancel = () => {
    setContent(memo.content);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleDelete = () => {
    if (content && !window.confirm('이 메모를 삭제하시겠습니까?')) {
      return;
    }
    onDelete(memo.id);
  };

  return (
    <div
      className="relative group transition-all duration-300 hover:z-10 animate-popIn"
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* 포스트잇 스티커 */}
      <div
        className="relative w-full h-72 rounded-sm shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-105 hover:rotate-0"
        style={{
          backgroundColor: memo.color,
          boxShadow: `
            0 1px 3px rgba(0,0,0,0.12),
            0 10px 20px rgba(0,0,0,0.1),
            inset 0 -2px 0 rgba(0,0,0,0.05)
          `,
        }}
      >
        {/* 접착 테이프 효과 */}
        <div
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-20 h-8 bg-gradient-to-b from-white/60 to-white/30 rounded-sm"
          style={{
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(2px)',
          }}
        />

        {/* 상단 삭제 버튼 */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            onClick={handleDelete}
            size="icon"
            variant="destructive"
            className="h-8 w-8 rounded-full shadow-lg"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* 메모 내용 영역 */}
        <div className="p-6 h-full flex flex-col">
          {isEditing ? (
            <>
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={handleChange}
                className="flex-1 resize-none bg-transparent border-none shadow-none focus-visible:ring-0 font-handwriting text-gray-800 text-base leading-relaxed p-0"
                placeholder="여기에 메모를 입력하세요..."
                style={{ 
                  backgroundColor: 'transparent',
                  color: '#1a1a1a',
                }}
              />
              {/* 편집 모드 버튼 */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-400/30">
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  저장
                </Button>
                <Button
                  onClick={handleCancel}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-1" />
                  취소
                </Button>
              </div>
            </>
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="flex-1 overflow-auto cursor-text"
            >
              <div className="whitespace-pre-wrap break-words text-gray-800 text-base leading-relaxed font-handwriting min-h-full">
                {content || (
                  <span className="text-gray-600/60 italic">
                    클릭하여 메모 작성...
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 작성 날짜 */}
          {!isEditing && (
            <div className="text-xs text-gray-600/50 mt-4 pt-3 border-t border-gray-400/20">
              {new Date(memo.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          )}
        </div>

        {/* 포스트잇 질감 오버레이 */}
        <div 
          className="absolute inset-0 rounded-sm pointer-events-none"
          style={{
            background: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 1px,
                rgba(0,0,0,0.01) 1px,
                rgba(0,0,0,0.01) 2px
              )
            `,
          }}
        />
      </div>
    </div>
  );
}

