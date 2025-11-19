import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase-client";
import type { Product } from "@/types/product";

export async function GET() {
  try {
    const { data, error } = await supabaseServerClient
      .from("product")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "상품 조회 중 오류가 발생했습니다." }, { status: 500 });
    }

    return NextResponse.json(data as Product[]);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "상품 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const products = Array.isArray(body) ? body : [body];

    // 각 상품 데이터 검증 및 변환
    const insertData = products.map((p: any) => ({
      name: p.name,
      short_description: p.short_description || null,
      brand: p.brand || null,
      ingredients: p.ingredients || null,
      environmental_contribution: p.environmental_contribution || null,
      category: p.category || "detergent",
      current_price: p.current_price, // g당 단가
      current_carbon_emission: p.current_carbon_emission || null,
    }));

    const { data, error } = await supabaseServerClient.from("product").insert(insertData).select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "상품 추가 중 오류가 발생했습니다." }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating products:", error);
    return NextResponse.json({ error: "상품 추가 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// TODO: PATCH 구현 (권한 체크 및 Supabase 업데이트)
