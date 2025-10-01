import { WeeklyReportGenerator } from '@/components/weekly-report-generator'

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <WeeklyReportGenerator />
      </div>
    </div>
  )
}