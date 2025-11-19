import { NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase-client";

// 인기 상품별 매출 (단위: 원)
export async function GET() {
  try {
    // receipt_item과 product를 조인하여 상품별 매출 집계
    const { data, error } = await supabaseClient
      .from("receipt_item")
      .select(
        `
        product_id,
        "purchase_quantity",
        "purchase_unit_price",
        product:product_id (
          id,
          name
        )
      `,
      );

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "매출 데이터 조회 중 오류가 발생했습니다." }, { status: 500 });
    }

    // 상품별 매출 집계
    const salesByProduct = new Map<number, { name: string; total: number }>();

    data?.forEach((item: any) => {
      const productId = item.product_id;
      if (!productId) return; // product_id가 null이면 스킵

      const product = item.product;
      const amount =
        (item["purchase_quantity"] || 0) * (item["purchase_unit_price"] || 0);

      if (salesByProduct.has(productId)) {
        const existing = salesByProduct.get(productId)!;
        existing.total += amount;
      } else {
        salesByProduct.set(productId, {
          name: product?.name || `상품 ${productId}`,
          total: amount,
        });
      }
    });

    // 매출 순으로 정렬
    const sorted = Array.from(salesByProduct.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // 상위 10개

    return NextResponse.json({
      labels: sorted.map((item) => item.name),
      values: sorted.map((item) => item.total),
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json({ error: "매출 데이터 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
