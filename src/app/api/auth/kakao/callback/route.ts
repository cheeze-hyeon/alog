import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code) {
    return NextResponse.json({ error: "인증 코드가 없습니다." }, { status: 400 });
  }

  // TODO: Kakao 토큰 교환 및 Supabase 세션 연동 로직 구현
  //  - `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`, `KAKAO_REDIRECT_URI`는 서버 환경에서만 사용하세요.
  //  - Supabase Auth 또는 custom JWT 전략과 통합할 때에도 RLS 정책을 고려하세요.

  return NextResponse.json({ code, state });
}
