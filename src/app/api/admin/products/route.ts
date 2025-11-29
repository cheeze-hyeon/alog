import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase-client";
import type { Product } from "@/types/product";
import { CATEGORY_LABELS } from "@/types/product";

type AdminProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  sales: number;
  revenue: number;
  type: '리필' | '일반';
  status: '판매중' | '품절' | '단종';
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // 상품 목록 조회 (is_refill 포함)
    let query = supabaseServerClient
      .from("product")
      .select("id, name, category, current_price, is_refill")
      .order("id", { ascending: true });

    // 검색어가 있으면 필터링
    if (search) {
      query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%`);
    }

    const { data: products, error: productsError } = await query;

    if (productsError) {
      console.error("Supabase error:", productsError);
      return NextResponse.json({ error: "상품 조회 중 오류가 발생했습니다." }, { status: 500 });
    }

    if (!products || products.length === 0) {
      return NextResponse.json([]);
    }

    // 모든 receipt_item 조회하여 판매량과 매출 계산
    const { data: receiptItems, error: itemsError } = await supabaseServerClient
      .from("receipt_item")
      .select("product_id, purchase_quantity, purchase_unit_price");

    if (itemsError) {
      console.error("Supabase error (receipt_items):", itemsError);
    }

    // 상품별 판매량과 매출 집계
    const salesData = new Map<number, { sales: number; revenue: number }>();

    receiptItems?.forEach((item: any) => {
      if (!item.product_id) return;

      const productId = item.product_id;
      const quantity = item.purchase_quantity || 0;
      const unitPrice = item.purchase_unit_price || 0;
      const revenue = quantity * unitPrice;

      if (salesData.has(productId)) {
        const existing = salesData.get(productId)!;
        existing.sales += 1; // 판매 건수
        existing.revenue += revenue;
      } else {
        salesData.set(productId, {
          sales: 1,
          revenue: revenue,
        });
      }
    });

    // 각 상품을 AdminProduct 형식으로 변환
    const adminProducts: AdminProduct[] = products.map((product: any) => {
      const salesInfo = salesData.get(product.id) || { sales: 0, revenue: 0 };
      const isRefill = product.is_refill === true;
      const categoryLabel = product.category
        ? (CATEGORY_LABELS[product.category as keyof typeof CATEGORY_LABELS] || product.category)
        : '기타';

      return {
        id: product.id,
        name: product.name || '이름 없음',
        category: categoryLabel,
        price: product.current_price || 0,
        stock: 0, // 재고 필드가 없으므로 기본값 0
        sales: salesInfo.sales,
        revenue: salesInfo.revenue,
        type: isRefill ? '리필' : '일반',
        status: '판매중', // 기본값
      };
    });

    return NextResponse.json(adminProducts);
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
      is_refill: p.is_refill === true || p.is_refill === 'true', // boolean 필드
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
