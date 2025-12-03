import DashboardClient from './DashboardClient'
import { supabaseServerClient } from '@/lib/supabase-client'

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
  category: string
  visits: number
}

async function getStats(): Promise<Stats> {
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

    // 총 리필 횟수 (customer_loyalty의 total_refill_count 합계)
    const { data: loyalties, error: loyaltiesError } = await supabaseServerClient
      .from("customer_loyalty")
      .select("total_refill_count");

    if (loyaltiesError) {
      console.error("Supabase error (loyalties):", loyaltiesError);
    }

    const totalRefills =
      loyalties?.reduce((sum, l) => sum + (l.total_refill_count || 0), 0) || 0;

    // 총 매출 (receipt의 total_amount 합계)
    const { data: receipts, error: receiptsError } = await supabaseServerClient
      .from("receipt")
      .select("total_amount");

    if (receiptsError) {
      console.error("Supabase error (receipts):", receiptsError);
    }

    const totalRevenue =
      receipts?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;

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
      totalProducts: totalProducts || 0,
      totalRefills,
      totalRevenue,
      co2SavedKg,
    };
  } catch (error) {
    console.error('Error fetching stats:', error)
    return { totalCustomers: 0, totalProducts: 0, totalRefills: 0, totalRevenue: 0, co2SavedKg: 0 }
  }
}

async function getSalesTrend(startDate?: string, endDate?: string): Promise<SalesTrend> {
  try {
    // 날짜 범위 설정
    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      // 파라미터로 받은 날짜 사용
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      // 기본값: 최근 7일 (6일 전부터 오늘까지)
      end = new Date();
      end.setHours(23, 59, 59, 999);
      start = new Date(end);
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);
    }

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

async function getSalesAnalysis(startDate?: string, endDate?: string): Promise<SalesAnalysis> {
  try {
    let today = new Date();
    let sevenDaysAgo = new Date(today);

    if (startDate && endDate) {
      // 제공된 날짜 사용
      sevenDaysAgo = new Date(startDate);
      today = new Date(endDate);
      today.setHours(23, 59, 59, 999); // 하루의 끝
      sevenDaysAgo.setHours(0, 0, 0, 0); // 하루의 시작
    } else {
      // 기본값: 최근 7일간의 데이터
      today.setHours(23, 59, 59, 999);
      sevenDaysAgo.setDate(today.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
    }

    // 먼저 지정된 기간의 receipt ID 조회
    const { data: recentReceipts, error: receiptsError } = await supabaseServerClient
      .from("receipt")
      .select("id")
      .gte("visit_date", sevenDaysAgo.toISOString())
      .lte("visit_date", today.toISOString());

    if (receiptsError) {
      console.error("Supabase error (receipts):", receiptsError);
      return {
        salesAnalysis: [
          { category: "리필", percentage: 0, color: "#EF4444" },
          { category: "상품", percentage: 0, color: "#3B82F6" },
        ],
        productCategories: [],
      };
    }

    const receiptIds = recentReceipts?.map((r) => r.id) || [];

    if (receiptIds.length === 0) {
      return {
        salesAnalysis: [
          { category: "리필", percentage: 0, color: "#EF4444" },
          { category: "상품", percentage: 0, color: "#3B82F6" },
        ],
        productCategories: [],
      };
    }

    // receipt_item에서 product_id 조회
    const { data: receiptItems, error } = await supabaseServerClient
      .from("receipt_item")
      .select("product_id")
      .in("receipt_id", receiptIds);

    if (error) {
      console.error("Supabase error:", error);
      return {
        salesAnalysis: [
          { category: "리필", percentage: 0, color: "#EF4444" },
          { category: "상품", percentage: 0, color: "#3B82F6" },
        ],
        productCategories: [],
      };
    }

    // product_id별로 그룹화하여 is_refill 값 확인
    const productIds = [...new Set(receiptItems?.map((item: any) => item.product_id).filter(Boolean) || [])];
    
    let refillCount = 0;
    let productCount = 0;

    // 각 product_id에 대해 is_refill 값 확인
    await Promise.all(
      productIds.map(async (productId: number) => {
        const { data: product, error: productError } = await supabaseServerClient
          .from("product")
          .select("is_refill")
          .eq("id", productId)
          .maybeSingle();

        if (!productError && product) {
          // 해당 product_id가 receipt_item에 몇 번 나타나는지 카운트
          const count = receiptItems?.filter((item: any) => item.product_id === productId).length || 0;
          
          if (product.is_refill === true) {
            refillCount += count;
          } else {
            productCount += count;
          }
        }
      })
    );

    const total = refillCount + productCount;
    const refillPercentage = total > 0 ? Math.round((refillCount / total) * 100) : 0;
    const productPercentage = 100 - refillPercentage;

    // 카테고리별 매출
    let categoryList: { name: string; amount: string; count: number }[] = [];

    if (receiptIds.length > 0) {
      // receipt_item만 먼저 조회
      const { data: receiptItems, error: itemsError } = await supabaseServerClient
        .from("receipt_item")
        .select("product_id, purchase_quantity, purchase_unit_price")
        .in("receipt_id", receiptIds);

      if (itemsError) {
        console.error("Supabase error (receipt_items):", itemsError);
      }

      const categorySales = new Map<string, { amount: number; count: number }>();

      // 각 아이템의 product 정보를 별도로 조회
      if (receiptItems) {
        await Promise.all(
          receiptItems.map(async (item: any) => {
            let category = "기타";
            
            if (item.product_id) {
              const { data: product, error: productError } = await supabaseServerClient
                .from("product")
                .select("category, name")
                .eq("id", item.product_id)
                .maybeSingle();

              if (!productError && product) {
                category = product.category || "기타";
              }
            }

            const amount = (item.purchase_quantity || 0) * (item.purchase_unit_price || 0);

            if (categorySales.has(category)) {
              const existing = categorySales.get(category)!;
              existing.amount += amount;
              existing.count += 1;
            } else {
              categorySales.set(category, { amount, count: 1 });
            }
          })
        );
      }

      categoryList = Array.from(categorySales.entries())
        .map(([name, data]) => ({
          name,
          amount: data.amount.toLocaleString(),
          count: data.count,
        }))
        .sort((a, b) => parseFloat(b.amount.replace(/,/g, "")) - parseFloat(a.amount.replace(/,/g, "")))
        .slice(0, 4);
    }

    return {
      salesAnalysis: [
        { category: "리필", percentage: refillPercentage, color: "#EF4444" },
        { category: "상품", percentage: productPercentage, color: "#3B82F6" },
      ],
      productCategories: categoryList,
    };
  } catch (error) {
    console.error('Error fetching sales analysis:', error)
    return { salesAnalysis: [], productCategories: [] }
  }
}

async function getProductRanking(): Promise<ProductRanking> {
  try {
    // receipt_item에서 product_id와 purchase_quantity 조회
    const { data: receiptItems, error } = await supabaseServerClient
      .from("receipt_item")
      .select("product_id, purchase_quantity");

    if (error) {
      console.error("Supabase error:", error);
      return [];
    }

    // product_id별 건수 및 purchase_quantity 합계 집계
    const productData = new Map<number, { count: number; totalQuantity: number }>();
    
    receiptItems?.forEach((item: any) => {
      if (!item.product_id) return;
      const productId = item.product_id;
      const quantity = item.purchase_quantity || 0;
      
      if (productData.has(productId)) {
        const existing = productData.get(productId)!;
        existing.count += 1;
        existing.totalQuantity += quantity;
      } else {
        productData.set(productId, {
          count: 1,
          totalQuantity: quantity,
        });
      }
    });

    // 건수 기준으로 정렬 (내림차순)
    const sortedProductIds = Array.from(productData.entries())
      .sort((a, b) => b[1].count - a[1].count) // 건수 기준 정렬
      .slice(0, 6); // 상위 6개

    // 각 product_id에 대해 product 정보 조회 및 가격 계산
    const ranking = await Promise.all(
      sortedProductIds.map(async ([productId, data], index) => {
        const { count, totalQuantity } = data;
        
        // product 정보 조회 (name, is_refill, current_price)
        const { data: product, error: productError } = await supabaseServerClient
          .from("product")
          .select("id, name, is_refill, current_price")
          .eq("id", productId)
          .maybeSingle();

        if (productError || !product) {
          return {
            rank: index + 1,
            name: `상품 ${productId}`,
            amount: "0",
            count: count,
            color: index < 2 ? "bg-red-500" : index < 4 ? "bg-blue-500" : "bg-red-500",
          };
        }

        const productName = product.name || `상품 ${productId}`;
        const currentPrice = product.current_price || 0;
        const isRefill = product.is_refill === true;

        // 가격 계산 (purchase_quantity 포함)
        let amount = 0;
        if (isRefill) {
          // is_refill이 true면: (언급 횟수) * current_price * purchase_quantity 합계
          amount = count * currentPrice * totalQuantity;
        } else {
          // is_refill이 false면: current_price * purchase_quantity 합계
          amount = currentPrice * totalQuantity;
        }

        return {
          rank: index + 1,
          name: productName,
          amount: amount.toLocaleString(),
          count: count,
          color: index < 2 ? "bg-red-500" : index < 4 ? "bg-blue-500" : "bg-red-500",
        };
      })
    );

    return ranking;
  } catch (error) {
    console.error('Error fetching product ranking:', error)
    return []
  }
}

async function getRecentSales(): Promise<RecentSale[]> {
  try {
    // 최근 영수증 조회
    const { data: receipts, error: receiptsError } = await supabaseServerClient
      .from("receipt")
      .select("id, visit_date, customer_id")
      .order("visit_date", { ascending: false })
      .limit(10);

    if (receiptsError) {
      console.error("Supabase error (receipts):", receiptsError);
      return [];
    }

    // 각 영수증의 아이템 조회
    const recentSales = await Promise.all(
      (receipts || []).map(async (receipt) => {
        const { data: items, error: itemsError } = await supabaseServerClient
          .from("receipt_item")
          .select("product_id, purchase_quantity, purchase_unit_price")
          .eq("receipt_id", receipt.id);

        if (itemsError) {
          console.error("Supabase error (items):", itemsError);
          return [];
        }

        // 고객의 총 방문 횟수 조회
        let visits = 1;
        if (receipt.customer_id) {
          const { count, error: visitError } = await supabaseServerClient
            .from("receipt")
            .select("*", { count: "exact", head: true })
            .eq("customer_id", receipt.customer_id);

          if (!visitError && count) {
            visits = count;
          }
        }

        // 각 receipt_item을 개별 행으로 반환
        if (!items || items.length === 0) {
          return [];
        }

        // 각 아이템의 product 정보를 조회하여 개별 행으로 변환
        const salesWithProduct = await Promise.all(
          items.map(async (item: any) => {
            let productName = "상품명 없음";
            let category = "-";
            let totalAmount = 0;

            // product_id가 있으면 product 정보 조회 (is_refill, current_price 포함)
            if (item.product_id) {
              const { data: product, error: productError } = await supabaseServerClient
                .from("product")
                .select("id, name, is_refill, current_price")
                .eq("id", item.product_id)
                .maybeSingle();

              if (!productError && product) {
                productName = product.name || "상품명 없음";
                // is_refill 필드 사용: true면 리필, false면 상품
                category = product.is_refill === true ? "리필" : "상품";
                
                // 가격 계산: current_price * purchase_quantity
                const quantity = item.purchase_quantity || 0;
                const currentPrice = product.current_price || 0;
                totalAmount = currentPrice * quantity;
              }
            }

            return {
              receipt: receipt.id.toString(),
              product: productName,
              category: category,
              visits,
            };
          })
        );

        return salesWithProduct;
      })
    );

    // 배열을 평탄화하고 최신순으로 정렬 (visit_date 기준)
    const validSales = recentSales
      .flat()
      .sort((a, b) => {
        // receipt 번호로 정렬 (최신 영수증이 먼저)
        return parseInt(b.receipt) - parseInt(a.receipt);
      })
      .slice(0, 10); // 최대 10개만 표시

    return validSales;
  } catch (error) {
    console.error('Error fetching recent sales:', error)
    return []
  }
}

export default async function DashboardPage() {
  // 날짜 범위 계산
  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 7)
  const dateRange = {
    start: sevenDaysAgo.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '-').replace(/\s/g, '').slice(0, -1),
    end: today.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '-').replace(/\s/g, '').slice(0, -1),
  }

  const [stats, salesTrend, salesAnalysis, productRanking, recentSales] = await Promise.all([
    getStats(),
    getSalesTrend(dateRange.start, dateRange.end),
    getSalesAnalysis(dateRange.start, dateRange.end),
    getProductRanking(),
    getRecentSales(),
  ])

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
