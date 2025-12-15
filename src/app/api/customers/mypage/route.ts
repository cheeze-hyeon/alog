import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase-client";
import type {
  Customer,
  CustomerLoyalty,
  CustomerMyPageData,
  EnvironmentStats,
  PurchaseItem,
  Product,
} from "@/types";
import { calculateCharacterProgress } from "@/lib/character-levels";
import { calculateCO2Reduction, calculatePlasticReduction } from "@/lib/carbon-emission";
import { DUMMY_BADGES } from "@/types/badge";

/**
 * GET /api/customers/mypage?kakao_id=... 또는 /api/customers/mypage?phone=...
 * 카카오 ID 또는 전화번호를 기반으로 고객 마이페이지 데이터를 조회합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const kakaoId = sp.get("kakao_id");
    const phone = sp.get("phone");

    if (!kakaoId && !phone) {
      return NextResponse.json({ error: "카카오 ID 또는 전화번호가 필요합니다." }, { status: 400 });
    }

    let customer: Customer | null = null;

    // 전화번호로 조회 (우선순위)
    if (phone) {
      const normalizedPhone = phone.replace(/\D/g, "");

      if (!normalizedPhone || normalizedPhone.length < 10) {
        return NextResponse.json({ error: "유효하지 않은 전화번호입니다." }, { status: 400 });
      }

      // 정규화된 전화번호로 조회
      let { data, error } = await supabaseServerClient
        .from("customer")
        .select("*")
        .eq("phone", normalizedPhone)
        .maybeSingle();

      // 찾지 못한 경우 다른 형식으로도 시도
      if (!data && (!error || error.code === "PGRST116")) {
        const phoneVariations = [phone.trim(), phone.replace(/-/g, "").replace(/\s/g, "")].filter(
          (v) => v !== normalizedPhone && v.length >= 10,
        );

        for (const phoneVar of phoneVariations) {
          const { data: found, error: varError } = await supabaseServerClient
            .from("customer")
            .select("*")
            .eq("phone", phoneVar)
            .maybeSingle();

          if (found && !varError) {
            data = found;
            error = null;
            break;
          }
        }
      }

      if (error) {
        // 고객을 찾을 수 없는 경우 (404는 정상)
        if (error.code === "PGRST116") {
          // 에러가 아니므로 계속 진행
        } else {
          console.error("Supabase error:", error);
          return NextResponse.json({ error: "고객 조회 중 오류가 발생했습니다." }, { status: 500 });
        }
      }

      customer = data;
    }
    // kakao_id로 조회
    else if (kakaoId) {
      const { data, error } = await supabaseServerClient
        .from("customer")
        .select("*")
        .eq("kakao_id", kakaoId)
        .maybeSingle();

      if (error) {
        console.error("Supabase error (customer):", error);
        return NextResponse.json(
          { error: "고객 정보 조회 중 오류가 발생했습니다." },
          { status: 500 },
        );
      }

      customer = data;
    }

    if (!customer) {
      return NextResponse.json({ error: "고객을 찾을 수 없습니다." }, { status: 404 });
    }

    // 고객 로열티 정보 조회
    const { data: loyalty, error: loyaltyError } = await supabaseServerClient
      .from("customer_loyalty")
      .select("*")
      .eq("customer_id", customer.id)
      .maybeSingle();

    if (loyaltyError && loyaltyError.code !== "PGRST116") {
      console.error("Supabase error (loyalty):", loyaltyError);
    }

    // 고객의 영수증 목록 조회 (구매 횟수 계산용 및 구매 내역 조회)
    const { data: receipts, error: receiptsError } = await supabaseServerClient
      .from("receipt")
      .select("id, visit_date, total_amount")
      .eq("customer_id", customer.id)
      .order("visit_date", { ascending: false });

    if (receiptsError) {
      console.error("Supabase error (receipts):", receiptsError);
    }

    const totalPurchaseCount = receipts?.length || 0;

    // 실제 구매 금액 합산 (receipt의 total_amount 합계)
    const actualAccumulatedAmount =
      receipts?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;

    // 고객의 영수증 아이템에서 CO2 감축량 합계 계산 및 구매 내역 조회
    let co2ReductionKg = 0;
    let totalPlasticReductionG = 0;
    const purchaseItems: PurchaseItem[] = [];

    if (receipts && receipts.length > 0) {
      const { data: receiptItems, error: itemsError } = await supabaseServerClient
        .from("receipt_item")
        .select(
          "id, total_carbon_emission, receipt_id, product_id, purchase_quantity, purchase_unit_price",
        )
        .in(
          "receipt_id",
          receipts.map((r) => r.id),
        );

      if (itemsError) {
        console.error("Supabase error (receipt_items):", itemsError);
      }

      // 구매 내역 조회 (상품 정보 포함)
      if (receiptItems && receiptItems.length > 0) {
        const productIds = [
          ...new Set(receiptItems.map((item) => item.product_id).filter(Boolean)),
        ];

        let products: any[] = [];
        if (productIds.length > 0) {
          const { data: productData } = await supabaseServerClient
            .from("product")
            .select("id, name, category, is_refill, pricing_unit")
            .in("id", productIds);

          products = (productData || []) as any[];
        }

        const productMap = new Map(products.map((p) => [p.id, p]));

        // 영수증별로 그룹화하여 구매 내역 생성
        const receiptMap = new Map(receipts.map((r) => [r.id, r]));

        for (const item of receiptItems) {
          if (!item.receipt_id || !item.product_id) continue;

          const receipt = receiptMap.get(item.receipt_id);
          const product = productMap.get(item.product_id);

          if (!receipt) continue;

          // 날짜 파싱 (Supabase에서 받은 날짜는 ISO 문자열 또는 Date 객체일 수 있음)
          let visitDate: Date;
          if (!receipt.visit_date) {
            visitDate = new Date();
          } else if (receipt.visit_date instanceof Date) {
            visitDate = receipt.visit_date;
          } else if (typeof receipt.visit_date === "string") {
            // ISO 문자열인 경우 그대로 파싱
            visitDate = new Date(receipt.visit_date);
          } else {
            visitDate = new Date();
          }

          // 유효하지 않은 날짜인 경우 현재 날짜 사용
          if (isNaN(visitDate.getTime())) {
            console.warn(`Invalid date for receipt ${receipt.id}:`, receipt.visit_date);
            visitDate = new Date();
          }

          // 날짜를 YYMMDD 형식으로 변환
          const year = visitDate.getFullYear().toString().slice(-2);
          const month = (visitDate.getMonth() + 1).toString().padStart(2, "0");
          const day = visitDate.getDate().toString().padStart(2, "0");
          const dateStr = `${year}${month}${day}`;

          // 날짜를 YYYY.MM.DD 형식으로 변환 (표시용)
          const fullYear = visitDate.getFullYear();
          const visitDateStr = `${fullYear}.${month}.${day}`;

          const quantity = item["purchase_quantity"] || 0; // 수량 (g 또는 개)
          const unitPrice = item["purchase_unit_price"] || 0; // 단가 (원/g 또는 원/개)
          const price = Math.round(quantity * unitPrice);

          // product의 is_refill 필드 사용 (없으면 카테고리 기반으로 판단)
          const category = (product?.category as string) || "";
          const isRefillFromDB = product?.is_refill !== undefined ? product.is_refill : null;
          const isRefill =
            isRefillFromDB !== null
              ? isRefillFromDB
              : category !== "snack_drink_base" &&
                category !== "cooking_ingredient" &&
                category !== "tea";

          // pricing_unit 가져오기 (기본값은 "g")
          const pricingUnit = product?.pricing_unit || "g";

          // CO2 절감량 및 플라스틱 절감량 계산
          let itemCo2Reduction = 0;
          let plasticReductionG = 0;

          // 리필 상품이고 g 단위인 경우 항상 새로 계산
          if (isRefill && pricingUnit === "g" && quantity > 0) {
            // 리필 상품은 항상 새로운 계산 방식으로 계산
            itemCo2Reduction = calculateCO2Reduction(quantity);
            plasticReductionG = calculatePlasticReduction(quantity);
          } else if (isRefill && pricingUnit === "g") {
            // 리필이지만 수량이 0인 경우
            itemCo2Reduction = 0;
            plasticReductionG = 0;
          } else {
            // 리필이 아닌 경우: DB에 저장된 값 사용 또는 기존 로직
            itemCo2Reduction = item["total_carbon_emission"] || 0;
            plasticReductionG = isRefill && pricingUnit === "g" ? Math.round(quantity * 10) : 0;
          }

          // CO2 절감량 누적
          co2ReductionKg += itemCo2Reduction;
          totalPlasticReductionG += plasticReductionG;

          purchaseItems.push({
            id: item.id,
            receiptId: receipt.id,
            date: dateStr,
            visitDate: visitDateStr,
            productName: product?.name || "상품명 없음",
            productCategory: (category as any) || null,
            price,
            quantity,
            unitPrice,
            pricingUnit: pricingUnit === "ea" ? "ea" : "g",
            isRefill,
            type: isRefill ? "refill" : "product",
            plasticReductionG,
          });
        }

        // 날짜 기준으로 정렬 (최신순)
        purchaseItems.sort((a, b) => b.date.localeCompare(a.date));
      }
    }

    // 환경 지표 계산
    const refillCount = loyalty?.total_refill_count || 0;

    // CO2 감축량이 없고 리필 횟수가 있는 경우, 리필 횟수 기반으로 계산 (fallback)
    if (co2ReductionKg === 0 && refillCount > 0) {
      // 리필 1회당 평균 100g 구매로 가정
      co2ReductionKg = calculateCO2Reduction(refillCount * 100);
    }

    // 플라스틱 감축량이 없고 리필 횟수가 있는 경우, 리필 횟수 기반으로 계산 (fallback)
    if (totalPlasticReductionG === 0 && refillCount > 0) {
      totalPlasticReductionG = calculatePlasticReduction(refillCount * 100);
    }

    // 나무 감축량 계산 (CO2 감축량 기반)
    // 30년생 소나무 1그루의 연간 CO2 흡수량: 6.6kg
    // CO2 감축량 6.6kg = 나무 1그루를 심은 효과
    const TREE_CO2_ABSORPTION_KG = 6.6; // 30년생 소나무 1그루의 연간 CO2 흡수량
    const treeReduction = co2ReductionKg / TREE_CO2_ABSORPTION_KG;

    const stats: EnvironmentStats = {
      refillCount,
      plasticReductionKg: Math.round((totalPlasticReductionG / 1000) * 100) / 100, // 소수점 둘째 자리까지
      plasticReductionG: Math.round(totalPlasticReductionG), // g 단위
      treeReduction: Math.round(treeReduction * 100) / 100, // 소수점 둘째 자리까지
      co2ReductionKg: Math.round(co2ReductionKg * 10) / 10, // 소수점 첫째 자리까지
    };

    // 캐릭터 진행 상황 계산
    // customer_loyalty의 값이 있으면 사용하고, 없으면 receipt의 total_amount 합계 사용
    const accumulatedPurchaseAmount =
      loyalty?.accumulated_purchase_amount || actualAccumulatedAmount;
    const characterProgress = calculateCharacterProgress(accumulatedPurchaseAmount);

    // 배지 데이터 (더미 데이터 - 추후 동적 로직으로 교체 가능)
    // 현재는 모든 배지를 반환하되, unlocked 상태는 기반 데이터로 결정할 수 있음
    const badges = DUMMY_BADGES.map((badge) => {
      // 간단한 로직: 일부 배지는 기본적으로 획득된 것으로 표시
      // 추후 실제 로직으로 교체 가능
      if (badge.id === "first_purchase" && totalPurchaseCount > 0) {
        return { ...badge, unlocked: true };
      }
      if (badge.id === "refill_master" && refillCount >= 10) {
        return { ...badge, unlocked: true };
      }
      if (badge.id === "eco_guardian" && co2ReductionKg >= 10) {
        return { ...badge, unlocked: true };
      }
      if (badge.id === "loyal_customer" && accumulatedPurchaseAmount >= 100000) {
        return { ...badge, unlocked: true };
      }
      return badge;
    });

    const myPageData: CustomerMyPageData = {
      customer,
      loyalty,
      stats,
      characterProgress,
      badges,
      totalPurchaseCount,
      purchaseItems,
    };

    return NextResponse.json(myPageData);
  } catch (error) {
    console.error("Error fetching mypage data:", error);
    return NextResponse.json(
      { error: "마이페이지 데이터 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
