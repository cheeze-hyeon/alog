import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase-client";
import type { Customer } from "@/types/customer";

const KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
const KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";

// GET: 기존 호환성을 위해 유지 (쿼리 파라미터에서 code 받기)
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code) {
    return NextResponse.json({ error: "인증 코드가 없습니다." }, { status: 400 });
  }

  return await handleKakaoCallback(code, state);
}

// POST: 프론트엔드에서 body로 code 전달
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, state } = body;

    if (!code) {
      return NextResponse.json(
        { error: "인증 코드가 없습니다." },
        { status: 400 }
      );
    }

    return await handleKakaoCallback(code, state);
  } catch (error) {
    return NextResponse.json(
      { error: "요청 처리 중 오류가 발생했습니다." },
      { status: 400 }
    );
  }
}

async function handleKakaoCallback(code: string, state: string | null) {
  console.log("🔵 [서버] 카카오 콜백 처리 시작", { code: code?.substring(0, 10) + "..." });
  
  const clientId = process.env.KAKAO_CLIENT_ID;
  const clientSecret = process.env.KAKAO_CLIENT_SECRET;
  const redirectUri = process.env.KAKAO_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.error("❌ [서버] Kakao OAuth 설정 누락");
    return NextResponse.json(
      { error: "Kakao OAuth 설정이 누락되었습니다." },
      { status: 500 }
    );
  }

  try {
    // 1. 인증 코드로 액세스 토큰 교환
    console.log("🔄 [서버] 카카오 토큰 교환 시작");
    const tokenResponse = await fetch(KAKAO_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error("❌ [서버] 카카오 토큰 교환 실패:", errorData);
      return NextResponse.json(
        { error: "카카오 토큰 교환에 실패했습니다." },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log("✅ [서버] 카카오 토큰 교환 성공", { 
      hasAccessToken: !!accessToken,
      tokenType: tokenData.token_type 
    });

    if (!accessToken) {
      console.error("❌ [서버] 액세스 토큰 없음");
      return NextResponse.json(
        { error: "액세스 토큰을 받지 못했습니다." },
        { status: 400 }
      );
    }

    // 2. 액세스 토큰으로 사용자 정보 조회
    console.log("🔄 [서버] 카카오 사용자 정보 조회 시작");
    const userInfoResponse = await fetch(KAKAO_USER_INFO_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    if (!userInfoResponse.ok) {
      const errorData = await userInfoResponse.json().catch(() => ({}));
      console.error("❌ [서버] 카카오 사용자 정보 조회 실패:", errorData);
      return NextResponse.json(
        { error: "카카오 사용자 정보 조회에 실패했습니다." },
        { status: 400 }
      );
    }

    const userInfo = await userInfoResponse.json();
    const kakaoId = userInfo.id?.toString();
    const nickname = userInfo.kakao_account?.profile?.nickname || null;
    const email = userInfo.kakao_account?.email || null;
    console.log("✅ [서버] 카카오 사용자 정보 조회 성공", { 
      kakaoId, 
      nickname, 
      hasEmail: !!email 
    });

    if (!kakaoId) {
      console.error("❌ [서버] 카카오 ID 없음");
      return NextResponse.json(
        { error: "카카오 ID를 받지 못했습니다." },
        { status: 400 }
      );
    }

    // 3. Supabase에 사용자 정보 저장/업데이트 및 세션 생성
    // 3-1. kakao_id로 기존 고객 조회
    console.log("🔄 [서버] Supabase 고객 조회 시작", { kakaoId });
    let customer: Customer | null = null;
    const { data: existingCustomer, error: findError } = await supabaseServerClient
      .from("customer")
      .select("*")
      .eq("kakao_id", kakaoId)
      .maybeSingle();

    if (findError && findError.code !== "PGRST116") {
      console.error("Supabase error (customer find):", findError);
      return NextResponse.json(
        { error: "고객 정보 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    customer = existingCustomer;

    // 3-2. 고객이 없으면 새로 생성
    if (!customer) {
      console.log("➕ [서버] 새 고객 생성");
      const customerName = nickname || "카카오 사용자";
      
      const { data: newCustomer, error: createError } = await supabaseServerClient
        .from("customer")
        .insert({
          name: customerName,
          kakao_id: kakaoId,
          phone: null,
          gender: null,
          birth_date: null,
        })
        .select()
        .single();

      if (createError) {
        console.error("❌ [서버] 고객 생성 실패:", createError);
        return NextResponse.json(
          { error: "고객 정보 생성 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }

      customer = newCustomer as Customer;
      console.log("✅ [서버] 새 고객 생성 완료", { customerId: customer.id });
    } else {
      console.log("🔄 [서버] 기존 고객 발견", { customerId: customer.id });
      // 3-3. 기존 고객이 있으면 닉네임 업데이트 (변경된 경우)
      if (nickname && customer.name !== nickname) {
        console.log("🔄 [서버] 닉네임 업데이트", { old: customer.name, new: nickname });
        const { data: updatedCustomer, error: updateError } = await supabaseServerClient
          .from("customer")
          .update({ name: nickname })
          .eq("id", customer.id)
          .select()
          .single();

        if (!updateError && updatedCustomer) {
          customer = updatedCustomer as Customer;
        }
      }
    }

    // 4. 세션 쿠키 설정
    console.log("🍪 [서버] 쿠키 설정 시작", { customerId: customer.id, kakaoId: customer.kakao_id });
    const response = NextResponse.json({
      success: true,
      user: {
        id: customer.id,
        kakaoId: customer.kakao_id,
        nickname: customer.name,
        email: email,
      },
    });

    // customer_id를 쿠키에 저장 (30일 유효)
    const cookieMaxAge = 30 * 24 * 60 * 60; // 30일 (초 단위)
    response.cookies.set("customer_id", customer.id.toString(), {
      httpOnly: true, // XSS 공격 방지
      secure: process.env.NODE_ENV === "production", // HTTPS에서만 전송
      sameSite: "lax", // CSRF 공격 방지
      maxAge: cookieMaxAge,
      path: "/",
    });

    // kakao_id도 쿠키에 저장 (선택사항, 마이페이지 등에서 사용)
    if (customer.kakao_id) {
      response.cookies.set("kakao_id", customer.kakao_id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: cookieMaxAge,
        path: "/",
      });
    }

    console.log("✅ [서버] 로그인 완료 및 쿠키 설정 완료", {
      customerId: customer.id,
      kakaoId: customer.kakao_id,
    });

    return response;
  } catch (error) {
    console.error("Kakao callback error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "로그인 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
