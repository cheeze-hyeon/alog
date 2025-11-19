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

    // ReceiptItem 조회 (product 정보 포함)
    const { data: items, error: itemsError } = await supabaseServerClient
      .from("receipt_item")
      .select(
        `
        *,
        product:product_id (
          id,
          name
        )
      `,
      )
      .eq("receipt_id", receiptId);

    if (itemsError) {
      console.error("Supabase error (receipt_item):", itemsError);
      return NextResponse.json({ error: "영수증 항목 조회 중 오류가 발생했습니다." }, { status: 500 });
    }

    // product 정보를 각 item에 추가
    const itemsWithProduct = (items || []).map((item: any) => ({
      ...item,
      name: item.product?.name || null,
    }));

    return NextResponse.json({
      ...(receipt as Receipt),
      items: itemsWithProduct,
    });
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return NextResponse.json({ error: "영수증 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

