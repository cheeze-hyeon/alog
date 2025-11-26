import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase-client";

export async function GET() {
  try {
    const { data: receiptItems, error } = await supabaseServerClient
      .from("receipt_item")
      .select(
        `
        purchase_quantity,
        purchase_unit_price,
        product:product_id (
          id,
          name
        )
      `
      );

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "상품 순위 데이터 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 상품별 매출 집계
    const productSales = new Map<
      number,
      { name: string; amount: number; count: number }
    >();

    receiptItems?.forEach((item: any) => {
      const productId = item.product?.id;
      if (!productId) return;

      const amount = (item.purchase_quantity || 0) * (item.purchase_unit_price || 0);
      const productName = item.product?.name || `상품 ${productId}`;

      if (productSales.has(productId)) {
        const existing = productSales.get(productId)!;
        existing.amount += amount;
        existing.count += 1;
      } else {
        productSales.set(productId, {
          name: productName,
          amount,
          count: 1,
        });
      }
    });

    // 매출 순으로 정렬
    const ranking = Array.from(productSales.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6)
      .map((item, index) => ({
        rank: index + 1,
        name: item.name,
        amount: item.amount.toLocaleString(),
        count: item.count,
        color: index < 2 ? "bg-red-500" : index < 4 ? "bg-blue-500" : "bg-red-500",
      }));

    return NextResponse.json(ranking);
  } catch (error) {
    console.error("Error fetching product ranking:", error);
    return NextResponse.json(
      { error: "상품 순위 데이터 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

