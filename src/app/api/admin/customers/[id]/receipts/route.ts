import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase-client";

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

    // 고객의 영수증 목록 조회
    const { data: receipts, error: receiptsError } = await supabaseServerClient
      .from("receipt")
      .select("id, visit_date, total_amount")
      .eq("customer_id", customerId)
      .order("visit_date", { ascending: false });

    if (receiptsError) {
      console.error("Supabase error (receipts):", receiptsError);
      return NextResponse.json(
        { error: "영수증 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    if (!receipts || receipts.length === 0) {
      return NextResponse.json([]);
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
            purchaseDetails: [],
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

    return NextResponse.json(receiptsWithItems);
  } catch (error) {
    console.error("Error fetching customer receipts:", error);
    return NextResponse.json(
      { error: "영수증 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

