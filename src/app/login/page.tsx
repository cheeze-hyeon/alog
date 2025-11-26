"use client";

import { useCallback } from "react";
import Image from "next/image";

export default function LoginPage() {
  const handleLogin = useCallback(() => {
    window.location.href = "/api/auth/kakao/login";
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      {/* 로고 */}
      <div className="flex flex-col items-center mb-10">
        <Image
          src="/almang_logo.png"
          alt="알맹 로고"
          width={120}
          height={120}
          className="object-contain"
          priority
        />
      </div>

      {/* 문구 */}
      <div className="text-center space-y-2 mb-12">
        <p className="text-[17px] font-medium text-black/80">
          알록을 시작해보세요
        </p>
        <p className="text-[14px] text-black/50">
          카카오로 3초 만에 로그인하고<br />
          나의 알맹 히스토리를 확인할 수 있어요.
        </p>
      </div>

      {/* 로그인 버튼 */}
      <button type="button" onClick={handleLogin}>
        <Image
          src="/kakao_login_large_wide.png"
          alt="카카오 로그인"
          width={393}
          height={72}
          className="w-full"
        />
      </button>


    
    </main>
  );
}

