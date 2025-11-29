import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase-client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let today = new Date();
    let sevenDaysAgo = new Date(today);

    if (startDateParam && endDateParam) {
      // 제공된 날짜 사용
      sevenDaysAgo = new Date(startDateParam);
      today = new Date(endDateParam);
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
      return NextResponse.json(
        { error: "판매 분석 데이터 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    const receiptIds = recentReceipts?.map((r) => r.id) || [];

    if (receiptIds.length === 0) {
      return NextResponse.json({
        salesAnalysis: [
          { category: "리필", percentage: 0, color: "#EF4444" },
          { category: "상품", percentage: 0, color: "#3B82F6" },
        ],
        productCategories: [],
      });
    }

    // receipt_item에서 product_id 조회
    const { data: receiptItems, error } = await supabaseServerClient
      .from("receipt_item")
      .select("product_id")
      .in("receipt_id", receiptIds);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "판매 분석 데이터 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
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
    const { data: itemsWithCategory, error: categoryError } = await supabaseServerClient
      .from("receipt_item")
      .select(
        `
        purchase_quantity,
        purchase_unit_price,
        product:product_id (
          category,
          name
        )
      `
      )
      .in("receipt_id", receiptIds);

    if (categoryError) {
      console.error("Supabase error (category):", categoryError);
    }

    const categorySales = new Map<string, { amount: number; count: number }>();

    itemsWithCategory?.forEach((item: any) => {
      const category = item.product?.category || "기타";
      const amount = (item.purchase_quantity || 0) * (item.purchase_unit_price || 0);

      if (categorySales.has(category)) {
        const existing = categorySales.get(category)!;
        existing.amount += amount;
        existing.count += 1;
      } else {
        categorySales.set(category, { amount, count: 1 });
      }
    });

    const categoryList = Array.from(categorySales.entries())
      .map(([name, data]) => ({
        name,
        amount: data.amount.toLocaleString(),
        count: data.count,
      }))
      .sort((a, b) => parseFloat(b.amount.replace(/,/g, "")) - parseFloat(a.amount.replace(/,/g, "")))
      .slice(0, 4);

    return NextResponse.json({
      salesAnalysis: [
        { category: "리필", percentage: refillPercentage, color: "#EF4444" },
        { category: "상품", percentage: productPercentage, color: "#3B82F6" },
      ],
      productCategories: categoryList,
    });
  } catch (error) {
    console.error("Error fetching sales analysis:", error);
    return NextResponse.json(
      { error: "판매 분석 데이터 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

