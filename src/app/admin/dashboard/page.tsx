import Card from '@/components/ui/Card'
import DashboardClient from './DashboardClient'
import { getBaseUrl } from '@/lib/env'

// 동적 렌더링 강제 (실시간 데이터를 위해)
export const dynamic = 'force-dynamic'

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

async function getStats(): Promise<Stats> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/admin/dashboard/stats`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch stats')
    return res.json()
  } catch (error) {
    console.error('Error fetching stats:', error)
    return { totalCustomers: 0, totalProducts: 0, totalRefills: 0, totalRevenue: 0, co2SavedKg: 0 }
  }
}

async function getSalesTrend(): Promise<SalesTrend> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/admin/dashboard/sales-trend`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch sales trend')
    return res.json()
  } catch (error) {
    console.error('Error fetching sales trend:', error)
    return []
  }
}

async function getSalesAnalysis(): Promise<SalesAnalysis> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/admin/dashboard/sales-analysis`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch sales analysis')
    return res.json()
  } catch (error) {
    console.error('Error fetching sales analysis:', error)
    return { salesAnalysis: [], productCategories: [] }
  }
}

async function getProductRanking(): Promise<ProductRanking> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/admin/dashboard/product-ranking`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch product ranking')
    return res.json()
  } catch (error) {
    console.error('Error fetching product ranking:', error)
    return []
  }
}

async function getRecentSales(): Promise<RecentSale[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/admin/dashboard/recent-sales`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch recent sales')
    return res.json()
  } catch (error) {
    console.error('Error fetching recent sales:', error)
    return []
  }
}

export default async function DashboardPage() {
  const [stats, salesTrend, salesAnalysis, productRanking, recentSales] = await Promise.all([
    getStats(),
    getSalesTrend(),
    getSalesAnalysis(),
    getProductRanking(),
    getRecentSales(),
  ])

  // 날짜 범위 계산
  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 7)
  const dateRange = {
    start: sevenDaysAgo.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '-').replace(/\s/g, '').slice(0, -1),
    end: today.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '-').replace(/\s/g, '').slice(0, -1),
  }

  return (
    <DashboardClient
      stats={stats}
      salesTrend={salesTrend}
      salesAnalysis={salesAnalysis}
      productRanking={productRanking}
      recentSales={recentSales}
      dateRange={dateRange}
    />
  )
}
