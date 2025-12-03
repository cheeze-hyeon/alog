'use server'

import { supabaseServerClient } from '@/lib/supabase-client'
import { calculateCharacterProgress } from '@/lib/character-levels'
import type { Customer } from '@/types/customer'

export type ReceiptData = {
  receiptId: number
  visitDate: string | null
  price: number
  purchaseDetails: string
}

export type CustomerDetail = {
  level: number
  levelName: string
  totalVisits: number
  stampCount: number
  refillAmountMl: number
  productPurchaseCount: number
}

export async function getCustomer(id: number): Promise<Customer | null> {
  try {
    const { data, error } = await supabaseServerClient
      .from("customer")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return null;
    }

    return data as Customer;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return null;
  }
}

export async function getCustomerReceipts(customerId: number): Promise<ReceiptData[]> {
  try {
    // 고객의 영수증 목록 조회
    const { data: receipts, error: receiptsError } = await supabaseServerClient
      .from("receipt")
      .select("id, visit_date, total_amount")
      .eq("customer_id", customerId)
      .order("visit_date", { ascending: false });

    if (receiptsError) {
      console.error("Supabase error (receipts):", receiptsError);
      return [];
    }

    if (!receipts || receipts.length === 0) {
      return [];
    }

    // 각 영수증의 receipt_item 조회 및 product 정보 포함
    const receiptsWithItems = await Promise.all(
      receipts.map(async (receipt) => {
        const { data: items, error: itemsError } = await supabaseServerClient
          .from("receipt_item")
          .select("product_id, purchase_quantity")
          .eq("receipt_id", receipt.id);

        if (itemsError) {
          console.error("Supabase error (items):", itemsError);
          return {
            receiptId: receipt.id,
            visitDate: receipt.visit_date,
            price: receipt.total_amount || 0,
            purchaseDetails: '',
          };
        }

        // 각 아이템의 product 정보 조회
        const purchaseDetails = await Promise.all(
          (items || []).map(async (item: any) => {
            if (!item.product_id) {
              return null;
            }

            const { data: product, error: productError } = await supabaseServerClient
              .from("product")
              .select("id, name, current_price")
              .eq("id", item.product_id)
              .maybeSingle();

            if (productError || !product) {
              return null;
            }

            return {
              name: product.name || "상품명 없음",
              quantity: item.purchase_quantity || 0,
              price: product.current_price || 0,
            };
          })
        );

        // 구매 내역 문자열 생성 (예: "보타닉 제비꽃 샴푸 외 3개")
        const validDetails = purchaseDetails.filter(Boolean);
        const mainProduct = validDetails[0];
        const otherCount = validDetails.length - 1;

        let purchaseDetailsText = "";
        if (mainProduct) {
          if (otherCount > 0) {
            purchaseDetailsText = `${mainProduct.name} 외 ${otherCount}개`;
          } else {
            purchaseDetailsText = mainProduct.name;
          }
        }

        return {
          receiptId: receipt.id,
          visitDate: receipt.visit_date,
          price: receipt.total_amount || 0,
          purchaseDetails: purchaseDetailsText,
        };
      })
    );

    return receiptsWithItems;
  } catch (error) {
    console.error("Error fetching customer receipts:", error);
    return [];
  }
}

export async function getCustomerDetail(customerId: number): Promise<CustomerDetail | null> {
  try {
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
      return null;
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

    return {
      level,
      levelName,
      totalVisits,
      stampCount,
      refillAmountMl,
      productPurchaseCount,
    };
  } catch (error) {
    console.error("Error fetching customer detail:", error);
    return null;
  }
}

export async function updateStampCount(customerId: number, stampCount: number) {
  try {
    if (typeof stampCount !== 'number' || stampCount < 0) {
      return { success: false, error: "Invalid stamp count" };
    }

    // TODO: customer_stamps 테이블이 있으면 업데이트, 없으면 생성
    // 현재는 임시로 성공 응답만 반환
    // 추후 customer_stamps 테이블 생성 후 아래 코드 활성화:
    /*
    const { data, error } = await supabaseServerClient
      .from("customer_stamps")
      .upsert({
        customer_id: customerId,
        stamp_count: stampCount,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return { success: false, error: "도장 개수 저장 중 오류가 발생했습니다." };
    }
    */

    return { success: true, stampCount };
  } catch (error) {
    console.error("Error updating stamp count:", error);
    return { success: false, error: "도장 개수 저장 중 오류가 발생했습니다." };
  }
}

