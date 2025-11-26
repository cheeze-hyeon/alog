'use client'

import Card from '@/components/ui/Card'
import { Heart, ShoppingBag, Droplet, Briefcase, Leaf } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type Stats = {
  totalCustomers: number
  totalProducts: number
  totalRefills: number
  totalRevenue: number
  co2SavedKg: number
}

type SalesTrend = {
  date: string
  day: string
  sales: number
}[]

type SalesAnalysis = {
  salesAnalysis: { category: string; percentage: number; color: string }[]
  productCategories: { name: string; amount: string; count: number }[]
}

type ProductRanking = {
  rank: number
  name: string
  amount: string
  count: number
  color: string
}[]

type RecentSale = {
  receipt: string
  product: string
  price: string
  category: string
  visits: number
}

type DashboardClientProps = {
  stats: Stats
  salesTrend: SalesTrend
  salesAnalysis: SalesAnalysis
  productRanking: ProductRanking
  recentSales: RecentSale[]
  dateRange: { start: string; end: string }
}

export default function DashboardClient({
  stats,
  salesTrend,
  salesAnalysis,
  productRanking,
  recentSales,
  dateRange,
}: DashboardClientProps) {
  const statsData = [
    {
      title: '총 고객 수',
      value: stats.totalCustomers.toLocaleString(),
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      title: '판매 물품 수',
      value: stats.totalProducts.toLocaleString(),
      icon: ShoppingBag,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: '리필 횟수',
      value: stats.totalRefills.toLocaleString(),
      icon: Droplet,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      title: '총 매출',
      value: `${stats.totalRevenue.toLocaleString()}원`,
      icon: Briefcase,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'CO₂ 감축량',
      value: `${stats.co2SavedKg.toFixed(2)}kg`,
      icon: Leaf,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
  ]

  return (
    <div className="space-y-6 bg-white">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statsData.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={stat.color} size={24} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* 매출 추이 차트 */}
      <Card title="매출 추이">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm">
            <span>{dateRange.start}</span>
            <span className="text-gray-400">~</span>
            <span>{dateRange.end}</span>
          </div>
        </div>
        {salesTrend.length > 0 ? (
          <>
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
                  formatter={(value: number) => [`${value}만원`, '판매']}
                />
                <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                  {salesTrend.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#EF4444" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 flex gap-4 text-xs text-gray-500">
              {salesTrend.map((item) => (
                <div key={item.date} className="text-center">
                  <div>{item.day}</div>
                  <div className="mt-1">{item.date}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            데이터가 없습니다.
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 판매 분석 */}
        <Card title="판매 분석">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm">
              <span>{dateRange.start}</span>
              <span className="text-gray-400">~</span>
              <span>{dateRange.end}</span>
            </div>
          </div>
          
          {/* Progress bars */}
          <div className="space-y-4 mb-6">
            {salesAnalysis.salesAnalysis.map((item) => (
              <div key={item.category}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  <span className="text-sm font-medium text-gray-700">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="h-6 rounded-full"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Product categories */}
          <div className="space-y-3">
            {salesAnalysis.productCategories.length > 0 ? (
              salesAnalysis.productCategories.map((category, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{index + 1}. {category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{category.amount}원</div>
                    <div className="text-xs text-gray-500">({category.count}건)</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 py-4">카테고리 데이터가 없습니다.</div>
            )}
          </div>
        </Card>

        {/* 상품 순위 */}
        <Card title="상품 순위">
          <div className="space-y-3">
            {productRanking.length > 0 ? (
              productRanking.map((product) => (
                <div key={product.rank} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                  <div className={`w-3 h-3 ${product.color} rounded`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{product.rank}. {product.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{product.amount}원</div>
                    <div className="text-xs text-gray-500">({product.count}건)</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 py-4">상품 순위 데이터가 없습니다.</div>
            )}
          </div>
        </Card>
      </div>

      {/* 최근 판매 내역 */}
      <Card title="최근 판매 내역">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">영수증 번호</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">제품 이름</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">가격</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">분류</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">총 방문 횟수</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.length > 0 ? (
                recentSales.map((sale, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{sale.receipt}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{sale.product}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{sale.price}원</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{sale.category}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{sale.visits}회</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                    최근 판매 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

