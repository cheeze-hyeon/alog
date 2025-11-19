import { NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase-client";

export async function GET() {
  try {
    // 총 고객 수
    const { count: totalCustomers, error: customersError } = await supabaseClient
      .from("customer")
      .select("*", { count: "exact", head: true });

    if (customersError) {
      console.error("Supabase error (customers):", customersError);
    }

    // 총 매출 (receipt의 total_amount 합계)
    const { data: receipts, error: receiptsError } = await supabaseClient
      .from("receipt")
      .select("total_amount");

    if (receiptsError) {
      console.error("Supabase error (receipts):", receiptsError);
    }

    const totalRevenue =
      receipts?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;

    // 총 리필 횟수 (customer_loyalty의 total_refill_count 합계)
    const { data: loyalties, error: loyaltiesError } = await supabaseClient
      .from("customer_loyalty")
      .select("total_refill_count");

    if (loyaltiesError) {
      console.error("Supabase error (loyalties):", loyaltiesError);
    }

    const totalRefills =
      loyalties?.reduce((sum, l) => sum + (l.total_refill_count || 0), 0) || 0;

    // 총 탄소 절감량 (receipt_item의 total_carbon_emission (kg) 합계)
    const { data: receiptItems, error: itemsError } = await supabaseClient
      .from("receipt_item")
      .select('"total_carbon_emission (kg)"');

    if (itemsError) {
      console.error("Supabase error (receipt_items):", itemsError);
    }

    const co2SavedKg =
      receiptItems?.reduce((sum, item) => sum + (item["total_carbon_emission (kg)"] || 0), 0) || 0;

    return NextResponse.json({
      totalCustomers: totalCustomers || 0,
      totalRevenue,
      totalRefills,
      co2SavedKg,
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json({ error: "통계 데이터 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
