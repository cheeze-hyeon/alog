"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const code = searchParams.get("code");

  // code 파라미터가 있으면 로그인 처리
  useEffect(() => {
    if (code && !isProcessing) {
      setIsProcessing(true);
      handleKakaoCallback(code);
    }
  }, [code, isProcessing]);

  const handleKakaoCallback = async (authCode: string) => {
    try {
      const response = await fetch("/api/auth/kakao/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: authCode }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ [API 에러] 로그인 실패:", errorData);
        throw new Error(
          errorData.error || "로그인 처리 중 오류가 발생했습니다."
        );
      }

      const data = await response.json();

      // 로그인 성공 후 마이페이지로 리다이렉트
      const redirectPath = data.user?.kakaoId 
        ? `/mypage?kakao_id=${data.user.kakaoId}`
        : "/";
      
      if (data.user?.kakaoId) {
        router.push(redirectPath);
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("💥 [에러] 로그인 실패:", err);
      // 에러 발생 시 로그인 화면으로 돌아가기 (code 파라미터 제거)
      router.push("/login");
    }
  };

  const handleLogin = useCallback(() => {
    window.location.href = "/api/auth/kakao/login";
  }, []);

  // code가 있으면 로딩 화면 표시
  if (isProcessing || code) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
        <div className="flex flex-col items-center space-y-6">
          {/* 로고 */}
          <div className="flex flex-col items-center">
            <Image
              src="/almang_logo.png"
              alt="알맹 로고"
              width={120}
              height={120}
              className="object-contain"
              priority
            />
          </div>

          {/* 로딩 메시지 */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-[#e04f4e] border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-[17px] font-medium text-black/80">
              로그인 중입니다...
            </p>
            <p className="text-[14px] text-black/50">
              잠시만 기다려주세요
            </p>
          </div>
        </div>
      </main>
    );
  }

  // 일반 로그인 화면
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex flex-col items-center">
              <Image
                src="/almang_logo.png"
                alt="알맹 로고"
                width={120}
                height={120}
                className="object-contain"
                priority
              />
            </div>
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-[#e04f4e] border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-[17px] font-medium text-black/80">
                로딩 중...
              </p>
            </div>
          </div>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
