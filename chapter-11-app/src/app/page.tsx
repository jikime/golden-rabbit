import { ExpenseForm } from "@/components/expense-form";
import { ExpenseChart } from "@/components/expense-chart";
import { BudgetWarning } from "@/components/budget-warning";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

// 샘플 데이터 (실제 앱에서는 상태 관리나 데이터베이스에서 가져올 데이터)
const sampleExpenseData = [
  { category: "food", amount: 150000, count: 12 },
  { category: "transport", amount: 80000, count: 8 },
  { category: "shopping", amount: 200000, count: 5 },
  { category: "entertainment", amount: 120000, count: 6 },
  { category: "health", amount: 50000, count: 2 },
  { category: "education", amount: 300000, count: 3 },
  { category: "utilities", amount: 100000, count: 4 },
  { category: "other", amount: 75000, count: 7 },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            지출 관리 앱
          </h1>
          <p className="text-gray-600 mb-6">
            간편하게 지출을 기록하고 관리하세요
          </p>
          
          {/* 네비게이션 버튼들 */}
          <div className="flex justify-center gap-4">
            <Link href="/report">
              <Button className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                월별 리포트 보기
              </Button>
            </Link>
            <Link href="/expenses">
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                지출 내역 보기
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="gap-8">
          {/* 지출 입력 폼 */}
          <div className="order-2 lg:order-1">
            <ExpenseForm />
          </div>
        </div>
      </div>
    </main>
  );
}
