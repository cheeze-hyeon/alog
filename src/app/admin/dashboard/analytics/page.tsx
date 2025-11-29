'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import { getBaseUrl } from '@/lib/env'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

type Metrics = {
  totalCustomers: number
  totalRevenue: number
  totalRefills: number
  co2SavedKg: number
}

type SalesTrend = {
  date: string
  day: string
  sales: number
}[]

const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [salesTrend, setSalesTrend] = useState<SalesTrend>([])
  const [loading, setLoading] = useState(true)
  const [supabaseConnected, setSupabaseConnected] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // 메트릭 데이터 가져오기
      const metricsRes = await fetch(`${getBaseUrl()}/api/admin/metrics`, { cache: 'no-store' })
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json()
        setMetrics(metricsData)
        setSupabaseConnected(true)
      }

      // 매출 추이 데이터 가져오기
      const trendRes = await fetch(`${getBaseUrl()}/api/admin/dashboard/sales-trend`, { cache: 'no-store' })
      if (trendRes.ok) {
        const trendData = await trendRes.json()
        setSalesTrend(trendData)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setSupabaseConnected(false)
      // 더미 데이터
      setMetrics({
        totalCustomers: 150,
        totalRevenue: 5000000,
        totalRefills: 320,
        co2SavedKg: 1250.5,
      })
      setSalesTrend([
        { date: '11/20', day: '월', sales: 44 },
        { date: '11/21', day: '화', sales: 52 },
        { date: '11/22', day: '수', sales: 38 },
        { date: '11/23', day: '목', sales: 61 },
        { date: '11/24', day: '금', sales: 55 },
        { date: '11/25', day: '토', sales: 48 },
        { date: '11/26', day: '일', sales: 42 },
      ])
    } finally {
      setLoading(false)
    }
  }

  // 파이 차트 데이터 (리필 vs 일반)
  const refillVsGeneral = metrics ? [
    { name: '리필', value: metrics.totalRefills, color: '#EF4444' },
    { name: '일반', value: metrics.totalCustomers - metrics.totalRefills, color: '#3B82F6' },
  ] : []

  return (
    <div className="space-y-6 bg-white">
      {/* Supabase Connection Status */}
      <div className={`text-sm font-medium ${supabaseConnected ? 'text-green-600' : 'text-yellow-600'}`}>
        {supabaseConnected ? '✅ Supabase 연결됨' : '⚠️ 더미 데이터 사용 중'}
      </div>

      {/* Header */}
      <PageHeader 
        title="데이터 분석"
        description="통계 및 분석 데이터를 확인하세요."
      />

      {loading ? (
        <div className="p-8 text-center text-gray-500">로딩 중...</div>
      ) : (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="p-4">
                <p className="text-sm font-medium text-gray-600 mb-2">총 고객 수</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.totalCustomers.toLocaleString() || 0}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <p className="text-sm font-medium text-gray-600 mb-2">총 매출</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.totalRevenue.toLocaleString() || 0}원
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <p className="text-sm font-medium text-gray-600 mb-2">총 리필 횟수</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.totalRefills.toLocaleString() || 0}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <p className="text-sm font-medium text-gray-600 mb-2">탄소 절감량</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.co2SavedKg.toLocaleString() || 0}kg
                </p>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 매출 추이 차트 */}
            <Card title="매출 추이 (최근 7일)">
              {salesTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      axisLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis 
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      axisLine={{ stroke: '#E5E7EB' }}
                      label={{ value: '만(원)', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                      formatter={(value: number) => {
                        const amount = value * 10000
                        return [`${amount.toLocaleString()}원`, '판매']
                      }}
                    />
                    <Bar dataKey="sales" radius={[4, 4, 0, 0]} fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  데이터가 없습니다.
                </div>
              )}
            </Card>

            {/* 리필 vs 일반 차트 */}
            <Card title="리필 vs 일반 고객">
              {refillVsGeneral.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={refillVsGeneral}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {refillVsGeneral.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  데이터가 없습니다.
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
