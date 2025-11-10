"use client";

import { useCallback } from "react";

/**
 * TODO: 실제 Kakao 인증 로직 구현
 *  - 상태 토큰(state) 생성 및 검증 로직 추가
 *  - 서버 측 Route Handler에서 토큰 교환 처리 권장
 *  - 환경 변수는 서버 영역에서만 주입되도록 `app/api/auth/kakao/route.ts` 등으로 분리하세요.
 */
export function KakaoLoginButton() {
  const handleLogin = useCallback(() => {
    window.location.href = "/api/auth/kakao/login";
  }, []);

  return (
    <button
      type="button"
      onClick={handleLogin}
      className="rounded-md bg-yellow-400 px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-yellow-300"
    >
      카카오로 로그인
    </button>
  );
}

export default KakaoLoginButton;
