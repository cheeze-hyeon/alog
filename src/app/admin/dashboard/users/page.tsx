'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import SearchBar from '@/components/ui/SearchBar'
import { getBaseUrl } from '@/lib/env'
import type { Customer } from '@/types/customer'

export default function UsersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [supabaseConnected, setSupabaseConnected] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${getBaseUrl()}/api/admin/customers`, { cache: 'no-store' })
      
      if (!res.ok) {
        throw new Error('Failed to fetch customers')
      }

      const data = await res.json()
      setCustomers(data)
      setSupabaseConnected(true)
    } catch (error) {
      console.error('Error fetching customers:', error)
      setSupabaseConnected(false)
      // 더미 데이터
      setCustomers([
        {
          id: 1,
          name: '홍길동',
          phone: '010-1234-5678',
          kakao_id: 'kakao_123',
          gender: 'M',
          birth_date: '1990-01-01',
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: '김영희',
          phone: '010-9876-5432',
          kakao_id: 'kakao_456',
          gender: 'F',
          birth_date: '1995-05-15',
          created_at: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  // 검색 필터링
  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      customer.name?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query) ||
      customer.kakao_id?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-6 bg-white">
      {/* Supabase Connection Status */}
      <div className={`text-sm font-medium ${supabaseConnected ? 'text-green-600' : 'text-yellow-600'}`}>
        {supabaseConnected ? '✅ Supabase 연결됨' : '⚠️ 더미 데이터 사용 중'}
      </div>

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
        {loading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : filteredCustomers.length === 0 ? (
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
