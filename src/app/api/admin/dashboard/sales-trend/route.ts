import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase-client";

export async function GET() {
  try {
    // 최근 7일간의 매출 데이터 조회
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const { data: receipts, error } = await supabaseServerClient
      .from("receipt")
      .select("visit_date, total_amount")
      .gte("visit_date", sevenDaysAgo.toISOString())
      .order("visit_date", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "매출 추이 데이터 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 날짜별로 그룹화
    const salesByDate = new Map<string, number>();

    // 최근 7일 초기화
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      salesByDate.set(dateKey, 0);
    }

    // 실제 데이터 집계
    receipts?.forEach((receipt) => {
      if (receipt.visit_date) {
        const date = new Date(receipt.visit_date);
        const dateKey = date.toISOString().split("T")[0];
        const current = salesByDate.get(dateKey) || 0;
        salesByDate.set(dateKey, current + (receipt.total_amount || 0));
      }
    });

    // 결과 배열 생성
    const result = Array.from(salesByDate.entries()).map(([dateKey, amount]) => {
      const date = new Date(dateKey);
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
      const dayName = dayNames[date.getDay()];

      return {
        date: `${month}/${day}`,
        day: dayName,
        sales: Math.round(amount / 10000), // 만원 단위로 변환
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching sales trend:", error);
    return NextResponse.json(
      { error: "매출 추이 데이터 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

