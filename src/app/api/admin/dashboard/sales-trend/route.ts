import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase-client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate'); // YYYY-MM-DD 형식
    const endDateParam = searchParams.get('endDate'); // YYYY-MM-DD 형식

    // 날짜 범위 설정
    let startDate: Date;
    let endDate: Date;

    if (startDateParam && endDateParam) {
      // 파라미터로 받은 날짜 사용
      startDate = new Date(startDateParam);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // 기본값: 최근 7일 (6일 전부터 오늘까지)
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    }

    const { data: receipts, error } = await supabaseServerClient
      .from("receipt")
      .select("visit_date, total_amount")
      .gte("visit_date", startDate.toISOString())
      .lte("visit_date", endDate.toISOString())
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

    // 선택된 날짜 범위의 모든 날짜 초기화
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split("T")[0];
      salesByDate.set(dateKey, 0);
      currentDate.setDate(currentDate.getDate() + 1);
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

    // 결과 배열 생성 (날짜 순서대로 정렬)
    const result = Array.from(salesByDate.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB)) // 날짜 순서대로 정렬
      .map(([dateKey, amount]) => {
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

