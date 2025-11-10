import { NextResponse } from "next/server";

const KAKAO_OAUTH_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";

export async function GET() {
  const clientId = process.env.KAKAO_CLIENT_ID;
  const redirectUri = process.env.KAKAO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        error: "Kakao OAuth 설정이 누락되었습니다.",
      },
      { status: 500 },
    );
  }

  const url = new URL(KAKAO_OAUTH_AUTHORIZE_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile_nickname,account_email");

  return NextResponse.redirect(url);
}
