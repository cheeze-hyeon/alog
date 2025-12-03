'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import SearchBar from '@/components/ui/SearchBar'
import type { Customer } from '@/types/customer'

type UsersClientProps = {
  initialCustomers: Customer[]
}

export default function UsersClient({ initialCustomers }: UsersClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  // 검색 필터링
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return initialCustomers
    const query = searchQuery.toLowerCase()
    return initialCustomers.filter((customer) => {
      return (
        customer.name?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query) ||
        customer.kakao_id?.toLowerCase().includes(query)
      )
    })
  }, [initialCustomers, searchQuery])

  return (
    <div className="space-y-6 bg-white">
      {/* Header */}
      <PageHeader 
        title="고객 관리"
        description="고객 목록을 확인하고 관리하세요."
      />

      {/* Search */}
      <SearchBar 
        placeholder="이름, 전화번호, 카카오 ID로 검색..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Customers Table */}
      <Card>
        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? '검색 결과가 없습니다.' : '고객 데이터가 없습니다.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">이름</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">전화번호</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">카카오 ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">성별</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">생년월일</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">가입일</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/dashboard/users/${customer.id}`)}
                  >
                    <td className="py-3 px-4 text-sm text-gray-900">{customer.id}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{customer.name || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{customer.phone || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{customer.kakao_id || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {customer.gender === 'M' ? '남성' : customer.gender === 'F' ? '여성' : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {customer.birth_date 
                        ? new Date(customer.birth_date).toLocaleDateString('ko-KR')
                        : '-'
                      }
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(customer.created_at).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

