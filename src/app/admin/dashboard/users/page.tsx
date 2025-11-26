import Card from '@/components/ui/Card'

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">사용자 관리</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          사용자 목록을 확인하고 관리하세요.
        </p>
      </div>

      <Card title="사용자 목록">
        <div className="text-gray-600 dark:text-gray-400">
          사용자 테이블이 여기에 표시됩니다.
        </div>
      </Card>
    </div>
  )
}


