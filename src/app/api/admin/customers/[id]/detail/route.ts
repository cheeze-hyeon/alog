import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase-client";
import { calculateCharacterProgress } from "@/lib/character-levels";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id, 10);

    if (isNaN(customerId)) {
      return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 });
    }

    // 고객의 모든 영수증 조회 (누적 구매 금액 계산용)
    const { data: allReceipts, error: allReceiptsError } = await supabaseServerClient
      .from("receipt")
      .select("id, visit_date, total_amount")
      .eq("customer_id", customerId)
      .order("visit_date", { ascending: false });

    // 최근 6개월 영수증 조회 (리필량, 상품 구매 수 계산용)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const { data: receipts, error: receiptsError } = await supabaseServerClient
      .from("receipt")
      .select("id, visit_date, total_amount")
      .eq("customer_id", customerId)
      .gte("visit_date", sixMonthsAgo.toISOString())
      .order("visit_date", { ascending: false });

    if (allReceiptsError || receiptsError) {
      console.error("Supabase error (receipts):", allReceiptsError || receiptsError);
      return NextResponse.json(
        { error: "영수증 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 총 방문 횟수 (전체 기간)
    const totalVisits = allReceipts?.length || 0;

    // 누적 구매 금액 계산 (레벨 계산용)
    const accumulatedPurchaseAmount = allReceipts?.reduce(
      (sum, receipt) => sum + (receipt.total_amount || 0),
      0
    ) || 0;

    // 레벨 계산 (구매 금액 기반)
    const characterProgress = calculateCharacterProgress(accumulatedPurchaseAmount);
    const level = characterProgress.currentLevel.level;
    const levelName = characterProgress.currentLevel.name;

    // 리필량과 상품 구매 수 계산
    let refillAmountMl = 0;
    let productPurchaseCount = 0;

    if (receipts && receipts.length > 0) {
      const receiptIds = receipts.map((r) => r.id);
      
      // 모든 receipt_item 조회
      const { data: allItems, error: itemsError } = await supabaseServerClient
        .from("receipt_item")
        .select("product_id, purchase_quantity")
        .in("receipt_id", receiptIds);

      if (!itemsError && allItems) {
        // 각 아이템의 product 정보 조회
        for (const item of allItems) {
          if (!item.product_id) continue;

          const { data: product, error: productError } = await supabaseServerClient
            .from("product")
            .select("id, is_refill")
            .eq("id", item.product_id)
            .maybeSingle();

          if (productError || !product) continue;

          const quantity = item.purchase_quantity || 0;

          if (product.is_refill === true) {
            // 리필인 경우: purchase_quantity가 ml 단위로 가정
            refillAmountMl += quantity;
          } else {
            // 상품인 경우: 구매 수 카운트
            productPurchaseCount += 1;
          }
        }
      }
    }

    // 도장 개수는 일단 방문 횟수와 같게 설정 (나중에 수정 가능하도록)
    const stampCount = totalVisits;

    return NextResponse.json({
      level,
      levelName,
      totalVisits,
      stampCount,
      refillAmountMl,
      productPurchaseCount,
      accumulatedPurchaseAmount, // 누적 구매 금액 추가
    });
  } catch (error) {
    console.error("Error fetching customer detail:", error);
    return NextResponse.json(
      { error: "고객 정보 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

