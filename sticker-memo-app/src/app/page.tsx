'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import StickerMemo from '@/components/StickerMemo';

export interface Memo {
  id: string;
  content: string;
  color: string;
  createdAt: number;
}

export default function Home() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [inputText, setInputText] = useState('');

  const handleAddMemo = () => {
    if (inputText.trim()) {
      const newMemo: Memo = {
        id: Date.now().toString(),
        content: inputText,
        color: '#fef08a', // 노란색 배경
        createdAt: Date.now(),
      };
      setMemos([...memos, newMemo]);
      setInputText('');
    }
  };

  const handleUpdateMemo = (id: string, content: string) => {
    setMemos(memos.map(memo => 
      memo.id === id ? { ...memo, content } : memo
    ));
  };

  const handleDeleteMemo = (id: string) => {
    setMemos(memos.filter(memo => memo.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddMemo();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          📝 스티커 메모장
        </h1>

        {/* 입력 영역 */}
        <div className="flex gap-3 mb-12 max-w-2xl mx-auto">
          <Input
            type="text"
            placeholder="메모를 입력하세요..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 h-12 text-base"
          />
          <Button
            onClick={handleAddMemo}
            className="h-12 px-8 text-base font-semibold"
            disabled={!inputText.trim()}
          >
            추가
          </Button>
        </div>

        {/* 스티커 메모 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {memos.map((memo, index) => (
            <StickerMemo
              key={memo.id}
              memo={memo}
              onUpdate={handleUpdateMemo}
              onDelete={handleDeleteMemo}
              index={index}
            />
          ))}
        </div>

        {/* 빈 상태 메시지 */}
        {memos.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-xl">메모를 추가해보세요! ✨</p>
          </div>
        )}
      </div>
    </div>
  );
}
