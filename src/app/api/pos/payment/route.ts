import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase-client";
import type { CartItem } from "@/types/cart";
import type { ReceiptItem } from "@/types/receipt";

/**
 * 오프라인 결제 후, 스마트 영수증 발송 및 서버 기록용 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, items, totalAmount } = body;

    // 📋 서버로 전송된 데이터 로깅
    console.log("=== 결제 데이터 전송 ===");
    console.log("전송 시간:", new Date().toISOString());
    console.log("고객 ID:", customerId);
    console.log("총 금액:", totalAmount);
    console.log("상품 목록:", JSON.stringify(items, null, 2));
    console.log("========================");

    // ✅ 필수 데이터 검증
    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
    }

    if (typeof totalAmount !== "number" || totalAmount <= 0) {
      return NextResponse.json({ error: "결제 금액이 올바르지 않습니다." }, { status: 400 });
    }

    const customerIdNum = typeof customerId === "string" ? parseInt(customerId, 10) : customerId;
    if (isNaN(customerIdNum)) {
      return NextResponse.json({ error: "유효하지 않은 고객 ID입니다." }, { status: 400 });
    }

    // Receipt 생성
    const receiptData = {
      customer_id: customerIdNum,
      visit_date: new Date().toISOString(),
      total_amount: totalAmount,
    };

    // 📋 데이터베이스에 저장되는 영수증 데이터 로깅
    console.log("영수증 저장:", JSON.stringify(receiptData, null, 2));

    const { data: receipt, error: receiptError } = await supabaseServerClient
      .from("receipt")
      .insert(receiptData)
      .select()
      .single();

    if (receiptError) {
      console.error("=== 영수증 저장 오류 ===");
      console.error("Supabase error (receipt):", JSON.stringify(receiptError, null, 2));
      console.error("오류 코드:", receiptError.code);
      console.error("오류 메시지:", receiptError.message);
      console.error("오류 상세:", receiptError.details);
      console.error("오류 힌트:", receiptError.hint);
      console.error("저장 시도한 데이터:", JSON.stringify(receiptData, null, 2));
      console.error("=========================");
      
      // 실제 Supabase 오류 메시지 전달 (더 자세한 정보 포함)
      const errorMessage = receiptError.message || receiptError.details || receiptError.hint || "영수증 저장 중 오류가 발생했습니다.";
      return NextResponse.json(
        { 
          error: errorMessage,
          code: receiptError.code,
          details: receiptError.details,
          hint: receiptError.hint,
        },
        { status: 500 },
      );
    }

    // ReceiptItem 생성
    const receiptItems = await Promise.all(
      items.map(async (item: CartItem) => {
        // Product 정보 조회 (carbon emission 계산을 위해)
        const productId = typeof item.productId === "string" ? parseInt(item.productId, 10) : item.productId;
        const { data: product, error: productError } = await supabaseServerClient
          .from("product")
          .select("current_carbon_emission, is_refill, pricing_unit")
          .eq("id", productId)
          .maybeSingle();

        // 제품 조회 오류 처리 (제품이 없어도 계속 진행)
        if (productError && productError.code !== "PGRST116") {
          console.error(`제품 조회 오류 (제품 ID: ${productId}):`, JSON.stringify(productError, null, 2));
        }

        // DB 스키마의 필드명은 ml이지만 실제 값은 g 단위로 저장
        // 실제 컬럼명에 공백과 괄호가 포함되어 있으므로 따옴표로 감싸서 사용
        const receiptItemData: any = {
          receipt_id: receipt.id,
          product_id: typeof item.productId === "string" ? parseInt(item.productId, 10) : item.productId,
          "purchase_quantity": item.volumeG, // 실제로는 g 단위 값
          "purchase_unit_price": item.unitPricePerG, // 실제로는 g당 단가
        };

        // 탄소 배출량 계산 (리필 상품인 경우)
        const isRefill = product?.is_refill ?? false;
        const pricingUnit = product?.pricing_unit || "g";
        
        if (isRefill && pricingUnit === "g") {
          // 리필 상품인 경우: 구매량(g) 기반으로 CO2 절감량 계산
          const { calculateCO2Reduction } = await import("@/lib/carbon-emission");
          const co2Reduction = calculateCO2Reduction(item.volumeG);
          receiptItemData["purchase_carbon_emission_base"] = co2Reduction / item.volumeG; // g당 CO2 절감량 (kg/g)
          receiptItemData["total_carbon_emission"] = co2Reduction; // 총 CO2 절감량 (kg)
        } else if (product?.current_carbon_emission !== null && product?.current_carbon_emission !== undefined) {
          // 기존 로직: current_carbon_emission이 있는 경우
          const carbonEmissionPerG = product.current_carbon_emission;
          receiptItemData["purchase_carbon_emission_base"] = carbonEmissionPerG; // 실제로는 g당 탄소 배출량 (kg/g)
          receiptItemData["total_carbon_emission"] = carbonEmissionPerG * item.volumeG; // g당 kg * g = kg
        }

        // 📋 데이터베이스에 저장되는 데이터 로깅
        console.log(`영수증 아이템 저장 (제품 ID: ${item.productId}):`, JSON.stringify(receiptItemData, null, 2));

        const { data: receiptItem, error: itemError } = await supabaseServerClient
          .from("receipt_item")
          .insert(receiptItemData)
          .select()
          .single();

        if (itemError) {
          console.error("Supabase error (receipt_item):", JSON.stringify(itemError, null, 2));
          // 실제 Supabase 오류 메시지와 함께 오류 전달
          const errorMessage = itemError.message || itemError.details || "영수증 아이템 저장 중 오류가 발생했습니다.";
          throw new Error(errorMessage);
        }

        return receiptItem as ReceiptItem;
      }),
    );

    return NextResponse.json(
      {
        success: true,
        message: "결제 내역이 저장되었습니다. (오프라인 결제)",
        receipt: {
          id: receipt.id,
          createdAt: receipt.visit_date,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("❌ 결제 처리 오류:", error);
    // 실제 오류 메시지 전달
    const errorMessage = error?.message || error?.details || "결제 데이터 저장 중 오류가 발생했습니다.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
