"use client";

/**
 * 지출 내역 페이지 컴포넌트
 * 
 * 주요 개선 사항:
 * 1. 코드 가독성: 컴포넌트 분리, 중복 제거, 명확한 네이밍
 * 2. 성능 최적화: useMemo, useCallback 활용, 불필요한 재렌더링 방지
 * 3. 재사용성: 공통 컴포넌트 및 유틸리티 함수 분리
 * 4. 유지보수성: 타입 안정성, 에러 처리 개선, 테스트 용이성
 */

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, TrendingUp, Calendar, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";

// TODO: 타입 정의를 별도 파일로 분리하여 재사용성 향상
// TODO: payment_method를 필수 필드로 변경하거나 기본값 설정 고려
interface Expense {
  amount: number;
  category: string | null;
  memo: string | null;
  date: string;
  payment_method?: string | null;
}

// TODO: 로딩 상태 컴포넌트를 별도 파일로 분리하여 재사용성 향상
// TODO: 로딩 메시지를 props로 받아서 유연성 증대
function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="text-gray-600">지출 내역을 불러오는 중...</span>
      </div>
    </div>
  );
}

// TODO: 에러 상태 컴포넌트를 별도 파일로 분리하여 재사용성 향상
// TODO: 에러 타입을 더 구체적으로 정의하여 다양한 에러 상황 처리
// TODO: 버튼 컴포넌트를 재사용 가능한 UI 컴포넌트로 교체
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        데이터를 불러올 수 없습니다
      </h3>
      <p className="text-gray-500 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
}

// TODO: 카테고리 색상 매핑을 별도 상수 파일로 분리하여 관리 용이성 향상
// TODO: 카테고리 타입을 enum으로 정의하여 타입 안정성 증대
// TODO: 색상 팔레트를 테마 시스템으로 통합하여 일관성 유지
const categoryColors: Record<string, string> = {
  "식비": "bg-orange-100 text-orange-800",
  "교통비": "bg-blue-100 text-blue-800",
  "쇼핑": "bg-purple-100 text-purple-800",
  "엔터테인먼트": "bg-pink-100 text-pink-800",
  "건강/의료": "bg-green-100 text-green-800",
  "교육": "bg-indigo-100 text-indigo-800",
  "공과금": "bg-yellow-100 text-yellow-800",
  "기타": "bg-gray-100 text-gray-800",
};

// TODO: 금액 포맷팅 함수를 유틸리티 파일로 분리하여 재사용성 향상
// TODO: 통화 설정을 환경 변수나 설정 파일로 분리하여 다국화 지원
// TODO: 성능 최적화를 위해 포맷터 인스턴스를 미리 생성하여 재사용
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: API 호출 로직을 커스텀 훅으로 분리하여 재사용성 향상
  // TODO: 에러 처리를 더 구체적으로 개선 (네트워크 오류, 서버 오류 등)
  // TODO: 재시도 로직과 타임아웃 설정 추가
  // TODO: useCallback을 사용하여 함수 재생성 방지
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/expenses');
      if (!response.ok) {
        throw new Error('지출 내역을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // TODO: 총 지출액 계산을 useMemo로 최적화하여 불필요한 재계산 방지
  // TODO: 계산 로직을 별도 함수로 분리하여 테스트 용이성 향상
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  // TODO: 페이지 헤더 컴포넌트를 별도로 분리하여 중복 제거
  // TODO: 레이아웃 컴포넌트로 감싸서 일관된 스타일링 적용
  const PageHeader = () => (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">지출 내역</h1>
      <p className="text-gray-600">최근 지출 내역을 확인하세요</p>
    </div>
  );

  const PageLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <PageHeader />
        {children}
      </div>
    </div>
  );

  // 로딩 상태
  if (loading) {
    return (
      <PageLayout>
        <LoadingState />
      </PageLayout>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <PageLayout>
        <ErrorState error={error} onRetry={fetchExpenses} />
      </PageLayout>
    );
  }

  return (
    <PageLayout>

      {/* TODO: 총 지출액 카드를 별도 컴포넌트로 분리하여 재사용성 향상 */}
      {/* 총 지출액 카드 */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            총 지출액
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {formatAmount(totalAmount)}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            총 {expenses.length}건의 지출 내역
          </p>
        </CardContent>
      </Card>

      {/* TODO: 지출 내역 리스트를 별도 컴포넌트로 분리하여 가독성 향상 */}
      {/* TODO: 가상화(virtualization) 도입을 고려하여 대량 데이터 처리 성능 개선 */}
      {/* TODO: 정렬, 필터링 기능 추가 고려 */}
      {/* 지출 내역 리스트 */}
      {expenses.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              최근 지출 내역
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {/* TODO: 각 지출 항목을 별도 컴포넌트로 분리하여 재사용성 향상 */}
              {/* TODO: key prop을 index 대신 고유 ID로 변경하여 성능 최적화 */}
              {expenses.map((expense, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge 
                          className={`${categoryColors[expense.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'} border-0`}
                        >
                          {expense.category || '기타'}
                        </Badge>
                        {expense.payment_method && (
                          <span className="text-sm text-gray-500">
                            {expense.payment_method}
                          </span>
                        )}
                      </div>
                      
                      {expense.memo && (
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{expense.memo}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(expense.date), "yyyy년 M월 d일 (E)", { locale: ko })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-semibold text-gray-900">
                        {formatAmount(expense.amount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* TODO: 빈 상태 컴포넌트를 별도로 분리하여 재사용성 향상 */
        /* 빈 상태 메시지 */
        <Card>
          <CardContent className="text-center py-12">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              지출 내역이 없습니다
            </h3>
            <p className="text-gray-500">
              새로운 지출을 등록해보세요
            </p>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}