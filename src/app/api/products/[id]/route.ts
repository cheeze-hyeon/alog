import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase-client";
import type { Product } from "@/types/product";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    
    if (isNaN(productId)) {
      return NextResponse.json({ error: "유효하지 않은 상품 ID입니다." }, { status: 400 });
    }

    const { data, error } = await supabaseServerClient
      .from("product")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "상품 조회 중 오류가 발생했습니다." }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(data as Product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "상품 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

