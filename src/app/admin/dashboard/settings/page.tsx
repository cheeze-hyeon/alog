import Card from '@/components/ui/Card'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">설정</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          시스템 설정을 관리하세요.
        </p>
      </div>

      <Card title="일반 설정">
        <div className="text-gray-600 dark:text-gray-400">
          설정 옵션들이 여기에 표시됩니다.
        </div>
      </Card>
    </div>
  )
}


