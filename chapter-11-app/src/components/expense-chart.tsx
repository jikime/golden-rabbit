"use client";

import { useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import { PieChart, BarChart3 } from "lucide-react";

// Chart.js 컴포넌트 등록
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface ExpenseData {
  category: string;
  amount: number;
  count: number;
}

interface ExpenseChartProps {
  data: ExpenseData[];
}

const categoryLabels: { [key: string]: string } = {
  food: "식비",
  transport: "교통비",
  shopping: "쇼핑",
  entertainment: "엔터테인먼트",
  health: "건강/의료",
  education: "교육",
  utilities: "공과금",
  other: "기타",
};

const colors = [
  "#3B82F6", // blue
  "#EF4444", // red
  "#10B981", // green
  "#F59E0B", // yellow
  "#8B5CF6", // purple
  "#F97316", // orange
  "#06B6D4", // cyan
  "#84CC16", // lime
];

export function ExpenseChart({ data }: ExpenseChartProps) {
  const [chartType, setChartType] = useState<"doughnut" | "bar">("doughnut");

  // 데이터가 없을 때의 처리
  if (!data || data.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-8">
          <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            지출 데이터가 없습니다
          </h3>
          <p className="text-gray-500">
            지출을 등록하면 차트로 확인할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  // 차트 데이터 준비
  const chartData = {
    labels: data.map((item) => categoryLabels[item.category] || item.category),
    datasets: [
      {
        data: data.map((item) => item.amount),
        backgroundColor: colors.slice(0, data.length),
        borderColor: colors.slice(0, data.length).map(color => color + "80"),
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: data.map((item) => categoryLabels[item.category] || item.category),
    datasets: [
      {
        label: "지출 금액 (원)",
        data: data.map((item) => item.amount),
        backgroundColor: colors.slice(0, data.length).map(color => color + "80"),
        borderColor: colors.slice(0, data.length),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || "";
            const value = context.parsed;
            const total = data.reduce((sum, item) => sum + item.amount, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString()}원 (${percentage}%)`;
          },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.parsed.y.toLocaleString()}원`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString() + "원";
          },
        },
      },
    },
  };

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">카테고리별 지출</h2>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={chartType === "doughnut" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("doughnut")}
            className="flex items-center gap-1"
          >
            <PieChart className="h-4 w-4" />
            도넛
          </Button>
          <Button
            variant={chartType === "bar" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("bar")}
            className="flex items-center gap-1"
          >
            <BarChart3 className="h-4 w-4" />
            막대
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">총 지출</p>
          <p className="text-2xl font-bold text-gray-900">
            {totalAmount.toLocaleString()}원
          </p>
        </div>
      </div>

      <div className="h-80">
        {chartType === "doughnut" ? (
          <Doughnut data={chartData} options={options} />
        ) : (
          <Bar data={barData} options={barOptions} />
        )}
      </div>

      {/* 카테고리별 상세 정보 */}
      <div className="mt-6 space-y-2">
        <h3 className="text-sm font-medium text-gray-700 mb-3">카테고리별 상세</h3>
        {data.map((item, index) => {
          const percentage = ((item.amount / totalAmount) * 100).toFixed(1);
          return (
            <div key={item.category} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index] }}
                />
                <span className="text-sm text-gray-700">
                  {categoryLabels[item.category] || item.category}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {item.amount.toLocaleString()}원
                </div>
                <div className="text-xs text-gray-500">{percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}