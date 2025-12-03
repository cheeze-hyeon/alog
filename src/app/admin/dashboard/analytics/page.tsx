import AnalyticsClient from './AnalyticsClient'
import { supabaseServerClient } from '@/lib/supabase-client'

// 동적 렌더링 강제 (실시간 데이터를 위해)
export const dynamic = 'force-dynamic'

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

async function getMetrics(): Promise<Metrics> {
  try {
    // 총 고객 수
    const { count: totalCustomers, error: customersError } = await supabaseServerClient
      .from("customer")
      .select("*", { count: "exact", head: true });

    if (customersError) {
      console.error("Supabase error (customers):", customersError);
    }

    // 총 판매 물품 수 (receipt_item 개수)
    const { count: totalProducts, error: productsError } = await supabaseServerClient
      .from("receipt_item")
      .select("*", { count: "exact", head: true });

    if (productsError) {
      console.error("Supabase error (products):", productsError);
    }

    // 총 매출 (receipt의 total_amount 합계)
    const { data: receipts, error: receiptsError } = await supabaseServerClient
      .from("receipt")
      .select("total_amount");

    if (receiptsError) {
      console.error("Supabase error (receipts):", receiptsError);
    }

    const totalRevenue =
      receipts?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;

    // 총 리필 횟수 (customer_loyalty의 total_refill_count 합계)
    const { data: loyalties, error: loyaltiesError } = await supabaseServerClient
      .from("customer_loyalty")
      .select("total_refill_count");

    if (loyaltiesError) {
      console.error("Supabase error (loyalties):", loyaltiesError);
    }

    const totalRefills =
      loyalties?.reduce((sum, l) => sum + (l.total_refill_count || 0), 0) || 0;

    // 총 탄소 절감량 (receipt_item의 total_carbon_emission (kg) 합계)
    const { data: receiptItems, error: itemsError } = await supabaseServerClient
      .from("receipt_item")
      .select('"total_carbon_emission"');

    if (itemsError) {
      console.error("Supabase error (receipt_items):", itemsError);
    }

    const co2SavedKg =
      receiptItems?.reduce((sum, item) => sum + (item["total_carbon_emission"] || 0), 0) || 0;

    return {
      totalCustomers: totalCustomers || 0,
      totalRevenue,
      totalRefills,
      co2SavedKg,
    };
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return { totalCustomers: 0, totalRevenue: 0, totalRefills: 0, co2SavedKg: 0 }
  }
}

async function getSalesTrend(): Promise<SalesTrend> {
  try {
    // 기본값: 최근 7일 (6일 전부터 오늘까지)
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const { data: receipts, error } = await supabaseServerClient
      .from("receipt")
      .select("visit_date, total_amount")
      .gte("visit_date", start.toISOString())
      .lte("visit_date", end.toISOString())
      .order("visit_date", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return [];
    }

    // 날짜별로 그룹화
    const salesByDate = new Map<string, number>();

    // 선택된 날짜 범위의 모든 날짜 초기화
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateKey = currentDate.toISOString().split("T")[0];
      salesByDate.set(dateKey, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 실제 데이터 집계
    receipts?.forEach((receipt) => {
      if (receipt.visit_date) {
        const date = new Date(receipt.visit_date);
        const dateKey = date.toISOString().split("T")[0];
        const current = salesByDate.get(dateKey) || 0;
        salesByDate.set(dateKey, current + (receipt.total_amount || 0));
      }
    });

    // 결과 배열 생성 (날짜 순서대로 정렬)
    const result = Array.from(salesByDate.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB)) // 날짜 순서대로 정렬
      .map(([dateKey, amount]) => {
        const date = new Date(dateKey);
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
        const dayName = dayNames[date.getDay()];

        return {
          date: `${month}/${day}`,
          day: dayName,
          sales: Math.round(amount / 10000), // 만원 단위로 변환
        };
      });

    return result;
  } catch (error) {
    console.error('Error fetching sales trend:', error)
    return []
  }
}

export default async function AnalyticsPage() {
  const [metrics, salesTrend] = await Promise.all([
    getMetrics(),
    getSalesTrend(),
  ])

  return <AnalyticsClient metrics={metrics} salesTrend={salesTrend} />
}
