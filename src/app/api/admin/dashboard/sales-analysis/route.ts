import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase-client";

export async function GET() {
  try {
    // 최근 7일간의 데이터
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // 먼저 최근 7일간의 receipt ID 조회
    const { data: recentReceipts, error: receiptsError } = await supabaseServerClient
      .from("receipt")
      .select("id")
      .gte("visit_date", sevenDaysAgo.toISOString());

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

    // receipt_item 조회 (리필 여부는 purchase_quantity로 판단)
    // 리필: purchase_quantity가 있는 경우 (실제로는 더 정확한 로직 필요)
    // 상품: 새로 구매한 경우
    const { data: receiptItems, error } = await supabaseServerClient
      .from("receipt_item")
      .select("purchase_quantity, purchase_unit_price")
      .in("receipt_id", receiptIds);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "판매 분석 데이터 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    let refillTotal = 0;
    let productTotal = 0;

    receiptItems?.forEach((item: any) => {
      const amount = (item.purchase_quantity || 0) * (item.purchase_unit_price || 0);
      // 간단한 로직: purchase_quantity가 0보다 크면 리필로 간주
      // 실제로는 더 정확한 비즈니스 로직이 필요할 수 있습니다
      if (item.purchase_quantity > 0) {
        refillTotal += amount;
      } else {
        productTotal += amount;
      }
    });

    const total = refillTotal + productTotal;
    const refillPercentage = total > 0 ? Math.round((refillTotal / total) * 100) : 0;
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

