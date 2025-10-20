'use client';

import { useState, useEffect } from 'react';
import { Plus, StickyNote } from 'lucide-react';
import StickerMemo from '@/components/StickerMemo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface Memo {
  id: string;
  content: string;
  color: string;
  createdAt: number;
}

// 무작위로 선택할 파스텔 톤 색상 배열
const PASTEL_COLORS = [
  '#FFE082', // 연한 노란색
  '#FFCCBC', // 연한 주황색
  '#FFAB91', // 코랄
  '#F8BBD0', // 연한 핑크
  '#E1BEE7', // 연한 보라
  '#D1C4E9', // 라벤더
  '#C5CAE9', // 연한 인디고
  '#BBDEFB', // 하늘색
  '#B3E5FC', // 연한 시안
  '#B2DFDB', // 연한 틸
  '#C8E6C9', // 연한 초록
  '#DCEDC8', // 라임
  '#F0F4C3', // 연한 레몬
  '#FFF9C4', // 크림 노란색
  '#FFECB3', // 앰버
];

// 무작위 파스텔 색상 선택 함수
const getRandomPastelColor = () => {
  return PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
};

export default function Home() {
  const [memos, setMemos] = useState<Memo[]>([]);

  // 로컬 스토리지에서 메모 불러오기
  useEffect(() => {
    const savedMemos = localStorage.getItem('sticker-memos');
    if (savedMemos) {
      setMemos(JSON.parse(savedMemos));
    }
  }, []);

  // 메모 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    if (memos.length > 0) {
      localStorage.setItem('sticker-memos', JSON.stringify(memos));
    }
  }, [memos]);

  const addMemo = () => {
    const newMemo: Memo = {
      id: Date.now().toString(),
      content: '',
      color: getRandomPastelColor(), // 무작위 파스텔 색상 사용
      createdAt: Date.now(),
    };
    setMemos([...memos, newMemo]);
  };

  const updateMemo = (id: string, content: string) => {
    setMemos(memos.map(memo => 
      memo.id === id ? { ...memo, content } : memo
    ));
  };

  const deleteMemo = (id: string) => {
    const updatedMemos = memos.filter(memo => memo.id !== id);
    setMemos(updatedMemos);
    if (updatedMemos.length === 0) {
      localStorage.removeItem('sticker-memos');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <StickyNote className="w-10 h-10 text-yellow-600" />
            <h1 className="text-4xl font-bold text-gray-800">스티커 메모</h1>
          </div>
          <p className="text-gray-600 text-lg">나만의 메모를 포스트잇 스티커로 남겨보세요!</p>
        </header>

        {/* 메모 추가 버튼 */}
        <Card className="mb-8 shadow-xl border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              새 메모 만들기
            </CardTitle>
            <CardDescription>
              메모를 추가하면 무작위로 다양한 파스텔 톤 색상이 적용됩니다 ✨
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* 색상 미리보기 */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-gray-700">
                  사용 가능한 파스텔 색상들
                </label>
                <div className="flex gap-2 flex-wrap">
                  {PASTEL_COLORS.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-10 h-10 rounded-lg shadow-md border-2 border-white"
                      style={{ backgroundColor: color }}
                      title={`파스텔 색상 ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
              
              <Button
                onClick={addMemo}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                메모 추가
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 메모 목록 */}
        {memos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {memos.map((memo, index) => (
              <StickerMemo
                key={memo.id}
                memo={memo}
                onUpdate={updateMemo}
                onDelete={deleteMemo}
                index={index}
              />
            ))}
          </div>
        ) : (
          /* 빈 상태 메시지 */
          <Card className="border-dashed border-2 bg-white/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6 rotate-6 shadow-lg">
                <StickyNote className="w-12 h-12 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                아직 메모가 없습니다
              </h2>
              <p className="text-gray-500 text-center max-w-md">
                위의 &quot;메모 추가&quot; 버튼을 클릭하여 첫 번째 메모를 만들어보세요!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
