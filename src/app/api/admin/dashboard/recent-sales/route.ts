import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase-client";

export async function GET() {
  try {
    // 최근 영수증 조회
    const { data: receipts, error: receiptsError } = await supabaseServerClient
      .from("receipt")
      .select("id, visit_date, customer_id")
      .order("visit_date", { ascending: false })
      .limit(10);

    if (receiptsError) {
      console.error("Supabase error (receipts):", receiptsError);
      return NextResponse.json(
        { error: "최근 판매 내역 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
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

    return NextResponse.json(validSales);
  } catch (error) {
    console.error("Error fetching recent sales:", error);
    return NextResponse.json(
      { error: "최근 판매 내역 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

