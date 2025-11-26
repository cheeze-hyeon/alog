import Card from '@/components/ui/Card'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">분석</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          데이터 분석 및 통계를 확인하세요.
        </p>
      </div>

      <Card title="통계 차트">
        <div className="text-gray-600 dark:text-gray-400">
          차트와 그래프가 여기에 표시됩니다.
        </div>
      </Card>
    </div>
  )
}


