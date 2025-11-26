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
          .select(
            `
            purchase_quantity,
            purchase_unit_price,
            product:product_id (
              id,
              name,
              category
            )
          `
          )
          .eq("receipt_id", receipt.id);

        if (itemsError) {
          console.error("Supabase error (items):", itemsError);
          return null;
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

        // 상품 정보 조합
        const productNames = items
          ?.map((item: any) => {
            const name = item.product?.name || "상품명 없음";
            const quantity = item.purchase_quantity || 0;
            const unitPrice = item.purchase_unit_price || 0;
            return quantity > 0
              ? `${name} (${unitPrice}원/g 외 ${items.length - 1}건)`
              : name;
          })
          .join(", ") || "상품 정보 없음";

        const categories = Array.from(
          new Set(
            items
              ?.map((item: any) => {
                const category = item.product?.category;
                return category === "refill" ? "리필" : "상품";
              })
              .filter(Boolean) || []
          )
        ).join(", ");

        const totalAmount = items?.reduce(
          (sum: number, item: any) =>
            sum + (item.purchase_quantity || 0) * (item.purchase_unit_price || 0),
          0
        ) || 0;

        return {
          receipt: receipt.id.toString(),
          product: productNames,
          price: totalAmount.toLocaleString(),
          category: categories || "-",
          visits,
        };
      })
    );

    // null 제거
    const validSales = recentSales.filter((sale) => sale !== null).slice(0, 4);

    return NextResponse.json(validSales);
  } catch (error) {
    console.error("Error fetching recent sales:", error);
    return NextResponse.json(
      { error: "최근 판매 내역 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

