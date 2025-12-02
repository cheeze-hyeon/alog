import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase-client";

/**
 * 현재 로그인 상태를 확인하는 API
 * GET /api/auth/me
 */
export async function GET(request: NextRequest) {
  try {
    // 쿠키에서 customer_id와 kakao_id 읽기
    const customerId = request.cookies.get("customer_id")?.value;
    const kakaoId = request.cookies.get("kakao_id")?.value;

    // 쿠키가 없으면 로그인되지 않은 상태
    if (!customerId) {
      return NextResponse.json(
        {
          isAuthenticated: false,
          message: "로그인되지 않았습니다.",
        },
        { status: 401 }
      );
    }

    // customer_id로 고객 정보 조회
    const { data: customer, error } = await supabaseServerClient
      .from("customer")
      .select("id, name, kakao_id, phone, gender, birth_date")
      .eq("id", parseInt(customerId))
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          isAuthenticated: false,
          message: "고객 정보 조회 중 오류가 발생했습니다.",
          error: error.message,
        },
        { status: 500 }
      );
    }

    if (!customer) {
      return NextResponse.json(
        {
          isAuthenticated: false,
          message: "고객 정보를 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    // 로그인된 상태
    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: customer.id,
        name: customer.name,
        kakaoId: customer.kakao_id,
        phone: customer.phone,
        gender: customer.gender,
        birthDate: customer.birth_date,
      },
      cookies: {
        customer_id: customerId,
        kakao_id: kakaoId || null,
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      {
        isAuthenticated: false,
        message: "인증 상태 확인 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

