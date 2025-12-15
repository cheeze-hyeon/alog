import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase-client";
import type { Customer } from "@/types/customer";

// GET /api/pos/customers?id=... 또는 /api/pos/customers?phone=...
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const id = sp.get("id");
    const phone = sp.get("phone");

    // id로 조회
    if (id) {
      const customerId = parseInt(id, 10);
      if (isNaN(customerId)) {
        return NextResponse.json({ error: "유효하지 않은 고객 ID입니다." }, { status: 400 });
      }

      const { data, error } = await supabaseServerClient
        .from("customer")
        .select("*")
        .eq("id", customerId)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json({ error: "고객을 찾을 수 없습니다." }, { status: 404 });
      }

      return NextResponse.json(data as Customer);
    }

    // phone으로 조회
    if (phone) {
      // 전화번호에서 숫자만 추출하여 정규화
      const normalizedPhone = phone.replace(/\D/g, "");

      if (!normalizedPhone || normalizedPhone.length < 10) {
        return NextResponse.json({ error: "유효하지 않은 전화번호입니다." }, { status: 400 });
      }

      // 정규화된 전화번호로 조회
      let { data, error } = await supabaseServerClient
        .from("customer")
        .select("*")
        .eq("phone", normalizedPhone)
        .maybeSingle();

      // 찾지 못한 경우 다른 형식으로도 시도
      if (!data && (!error || error.code === "PGRST116")) {
        const phoneVariations = [phone.trim(), phone.replace(/-/g, "").replace(/\s/g, "")].filter(
          (v) => v !== normalizedPhone && v.length >= 10,
        );

        for (const phoneVar of phoneVariations) {
          const { data: found, error: varError } = await supabaseServerClient
            .from("customer")
            .select("*")
            .eq("phone", phoneVar)
            .maybeSingle();

          if (found && !varError) {
            data = found;
            error = null;
            break;
          }
        }
      }

      if (error) {
        // 고객을 찾을 수 없는 경우 (404는 정상)
        if (error.code === "PGRST116") {
          return NextResponse.json({ error: "고객을 찾을 수 없습니다." }, { status: 404 });
        }
        console.error("Supabase error:", error);
        return NextResponse.json({ error: "고객 조회 중 오류가 발생했습니다." }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json({ error: "고객을 찾을 수 없습니다." }, { status: 404 });
      }

      return NextResponse.json(data as Customer);
    }

    return NextResponse.json({ error: "id 또는 phone 쿼리가 필요합니다." }, { status: 400 });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json({ error: "고객 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// POST /api/pos/customers  { name, phone?, kakao_id? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, kakao_id } = body || {};

    // name 또는 phone 중 하나는 필요
    if (!name && !phone) {
      return NextResponse.json({ error: "이름 또는 전화번호가 필요합니다." }, { status: 400 });
    }

    // phone이 있으면 전화번호 정규화 및 중복 체크
    if (phone) {
      const normalizedPhone = phone.replace(/\D/g, "");

      if (normalizedPhone.length < 10) {
        return NextResponse.json({ error: "유효하지 않은 전화번호입니다." }, { status: 400 });
      }

      // 전화번호로 기존 고객 조회 (다양한 형식으로 시도)
      // 1. 정규화된 전화번호로 조회
      let { data: existingByPhone, error: searchError } = await supabaseServerClient
        .from("customer")
        .select("*")
        .eq("phone", normalizedPhone)
        .maybeSingle();

      // 2. 찾지 못했고 오류가 없는 경우, 다른 형식으로도 시도
      if (!existingByPhone && (!searchError || searchError.code === "PGRST116")) {
        // 원본 전화번호로도 조회 시도 (하이픈 포함 등)
        const phoneVariations = [
          normalizedPhone,
          phone.trim(),
          phone.replace(/-/g, "").replace(/\s/g, ""),
        ].filter((v, i, arr) => arr.indexOf(v) === i); // 중복 제거

        for (const phoneVar of phoneVariations) {
          if (phoneVar === normalizedPhone) continue; // 이미 조회함

          const { data: found, error: varError } = await supabaseServerClient
            .from("customer")
            .select("*")
            .eq("phone", phoneVar)
            .maybeSingle();

          if (found && !varError) {
            existingByPhone = found;
            break;
          }
        }
      }

      // 검색 오류가 있고, 고객을 찾을 수 없는 경우가 아닌 경우만 오류
      if (searchError && searchError.code !== "PGRST116" && !existingByPhone) {
        console.error("Supabase search error:", searchError);
        return NextResponse.json(
          { error: searchError.message || "고객 조회 중 오류가 발생했습니다." },
          { status: 500 },
        );
      }

      if (existingByPhone) {
        // 기존 고객이 있으면 반환 (업데이트하지 않음)
        return NextResponse.json(existingByPhone as Customer, { status: 200 });
      }
    }

    // kakao_id로 중복 체크
    if (kakao_id) {
      const { data: existing } = await supabaseServerClient
        .from("customer")
        .select("*")
        .eq("kakao_id", kakao_id)
        .single();

      if (existing) {
        return NextResponse.json(existing as Customer, { status: 200 });
      }
    }

    // 신규 고객 생성
    // name이 없으면 전화번호나 기본값 사용
    const customerName = name || (phone ? phone.replace(/\D/g, "") : "고객");

    const insertData: any = {
      name: customerName,
      kakao_id: kakao_id || null,
      gender: null,
      birth_date: null,
    };

    // phone이 있으면 정규화된 전화번호 저장
    if (phone) {
      insertData.phone = phone.replace(/\D/g, "");
    }

    const { data, error } = await supabaseServerClient
      .from("customer")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Supabase error (customer insert):", JSON.stringify(error, null, 2));

      // 중복 키 오류인 경우 (동시 요청 또는 전화번호로 재조회)
      if (error.code === "23505" || error.message?.includes("duplicate key")) {
        // 전화번호로 기존 고객을 다시 조회
        if (phone) {
          const normalizedPhone = phone.replace(/\D/g, "");
          const { data: existingCustomer, error: retryError } = await supabaseServerClient
            .from("customer")
            .select("*")
            .eq("phone", normalizedPhone)
            .maybeSingle();

          if (existingCustomer) {
            return NextResponse.json(existingCustomer as Customer, { status: 200 });
          }

          if (retryError && retryError.code !== "PGRST116") {
            console.error("재조회 오류:", retryError);
          }
        }
      }

      // 실제 Supabase 오류 메시지 전달
      const errorMessage = error.message || error.details || "고객 생성 중 오류가 발생했습니다.";
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    return NextResponse.json(data as Customer, { status: 201 });
  } catch (error: any) {
    console.error("Error creating customer:", error);
    return NextResponse.json({ error: error?.message || "잘못된 요청입니다." }, { status: 400 });
  }
}
