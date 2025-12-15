"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

function KakaoCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [authInfo, setAuthInfo] = useState<{
    isAuthenticated: boolean;
    user?: any;
    cookies?: any;
  } | null>(null);
  const [debugData, setDebugData] = useState<{
    kakaoCallback?: any;
    apiResponse?: any;
    authCheck?: any;
  } | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // 에러가 있는 경우
    if (error) {
      setStatus("error");
      setErrorMessage(
        errorDescription || "카카오 로그인 중 오류가 발생했습니다."
      );
      return;
    }

    // code가 없는 경우
    if (!code) {
      setStatus("error");
      setErrorMessage("인증 코드를 받지 못했습니다.");
      return;
    }

    // 백엔드로 code 전달하여 로그인 처리
    const handleLogin = async () => {
      try {
        // 1. 카카오에서 받아온 콜백 데이터 저장
        const kakaoCallbackData = {
          code,
          error,
          errorDescription,
          allParams: Object.fromEntries(searchParams.entries()),
        };
        setDebugData({ kakaoCallback: kakaoCallbackData });

        const response = await fetch("/api/auth/kakao/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("❌ [API 에러] 로그인 실패:", errorData);
          setDebugData((prev) => ({
            ...prev,
            apiResponse: { error: errorData },
          }));
          throw new Error(
            errorData.error || "로그인 처리 중 오류가 발생했습니다."
          );
        }

        const data = await response.json();
        
        // 2. API 응답 데이터 저장
        setDebugData((prev) => ({
          ...prev,
          apiResponse: data,
        }));

        // 3. 로그인 성공 후 토큰(쿠키) 확인
        try {
          const authCheckResponse = await fetch("/api/auth/me");
          const authCheckData = await authCheckResponse.json();
          setAuthInfo(authCheckData);
          setDebugData((prev) => ({
            ...prev,
            authCheck: authCheckData,
          }));
        } catch (authErr) {
          console.error("❌ [쿠키 확인 에러]:", authErr);
          setDebugData((prev) => ({
            ...prev,
            authCheck: { error: authErr instanceof Error ? authErr.message : "Unknown error" },
          }));
        }

        // 로그인 성공 후 마이페이지로 리다이렉트
        setStatus("success");
        setTimeout(() => {
          // kakao_id가 있으면 마이페이지로, 없으면 메인으로
          const redirectPath = data.user?.kakaoId 
            ? `/mypage?kakao_id=${data.user.kakaoId}`
            : "/";
          router.push(redirectPath);
        }, 5000); // 데이터 확인을 위해 5초로 연장
      } catch (err) {
        console.error("💥 [에러] 로그인 프로세스 실패:", err);
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "로그인 처리 중 오류가 발생했습니다."
        );
      }
    };

    handleLogin();
  }, [searchParams, router]);

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

        {/* 상태 메시지 */}
        {status === "loading" && (
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
        )}

        {status === "error" && (
          <div className="text-center space-y-4 max-w-md">
            <p className="text-[17px] font-medium text-red-600">
              로그인 실패
            </p>
            <p className="text-[14px] text-black/70">
              {errorMessage}
            </p>
            <button
              onClick={() => router.push("/login")}
              className="mt-4 px-6 py-3 bg-[#e04f4e] text-white rounded-2xl text-[15px] font-semibold hover:bg-[#c93e3d] transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-4 max-w-md">
            <div className="flex justify-center">
              <svg
                className="w-12 h-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-[17px] font-medium text-black/80">
              로그인 성공!
            </p>
            <p className="text-[14px] text-black/50">
              잠시 후 메인 페이지로 이동합니다...
            </p>
          
          </div>
        )}
      </div>
    </main>
  );
}

export default function KakaoCallbackPage() {
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
      <KakaoCallbackContent />
    </Suspense>
  );
}

