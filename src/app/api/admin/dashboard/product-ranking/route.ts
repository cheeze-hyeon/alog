import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase-client";

export async function GET() {
  try {
    // receipt_item에서 product_id와 purchase_quantity 조회
    const { data: receiptItems, error } = await supabaseServerClient
      .from("receipt_item")
      .select("product_id, purchase_quantity");

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "상품 순위 데이터 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
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

    return NextResponse.json(ranking);
  } catch (error) {
    console.error("Error fetching product ranking:", error);
    return NextResponse.json(
      { error: "상품 순위 데이터 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

