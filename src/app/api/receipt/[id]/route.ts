import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase-client";
import type { Receipt, ReceiptItem } from "@/types/receipt";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const receiptId = parseInt(id, 10);

    if (isNaN(receiptId)) {
      return NextResponse.json({ error: "Invalid receipt ID" }, { status: 400 });
    }

    // Receipt 조회
    const { data: receipt, error: receiptError } = await supabaseServerClient
      .from("receipt")
      .select("*")
      .eq("id", receiptId)
      .single();

    if (receiptError) {
      console.error("Supabase error (receipt):", receiptError);
      return NextResponse.json({ error: "영수증을 찾을 수 없습니다." }, { status: 404 });
    }

    // ReceiptItem 조회
    const { data: items, error: itemsError } = await supabaseServerClient
      .from("receipt_item")
      .select("*")
      .eq("receipt_id", receiptId);

    if (itemsError) {
      console.error("Supabase error (receipt_item):", itemsError);
      return NextResponse.json({ error: "영수증 항목 조회 중 오류가 발생했습니다." }, { status: 500 });
    }

    // product_id가 있는 경우 product 정보를 별도로 조회
    const itemsWithProduct = await Promise.all(
      (items || []).map(async (item: any) => {
        let productName = null;
        let productCategory = null;
        
        if (item.product_id) {
          const { data: product, error: productError } = await supabaseServerClient
            .from("product")
            .select("id, name, category")
            .eq("id", item.product_id)
            .maybeSingle();

          if (!productError && product) {
            productName = product.name;
            productCategory = product.category;
          }
        }

        return {
          ...item,
          name: productName,
          category: productCategory,
        };
      })
    );

    return NextResponse.json({
      ...(receipt as Receipt),
      items: itemsWithProduct,
    });
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return NextResponse.json({ error: "영수증 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

