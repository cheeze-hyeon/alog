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
        console.log("🔵 [카카오 콜백] 로그인 프로세스 시작");
        
        // 1. 카카오에서 받아온 콜백 데이터 저장
        const kakaoCallbackData = {
          code,
          error,
          errorDescription,
          allParams: Object.fromEntries(searchParams.entries()),
        };
        console.log("📥 [카카오 콜백] 받은 데이터:", kakaoCallbackData);
        setDebugData({ kakaoCallback: kakaoCallbackData });

        console.log("🔄 [API 호출] /api/auth/kakao/callback 요청 시작", { code });
        const response = await fetch("/api/auth/kakao/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        console.log("📡 [API 응답] 상태:", response.status, response.statusText);

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
        console.log("✅ [API 성공] 로그인 응답 데이터:", data);
        
        // 2. API 응답 데이터 저장
        setDebugData((prev) => ({
          ...prev,
          apiResponse: data,
        }));

        // 3. 로그인 성공 후 토큰(쿠키) 확인
        console.log("🔐 [인증 확인] 쿠키 확인 시작");
        try {
          const authCheckResponse = await fetch("/api/auth/me");
          const authCheckData = await authCheckResponse.json();
          console.log("🍪 [쿠키 확인] 인증 상태:", {
            isAuthenticated: authCheckData.isAuthenticated,
            user: authCheckData.user,
            cookies: authCheckData.cookies,
          });
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
        console.log("🎉 [로그인 완료] 성공 상태로 변경");
        setStatus("success");
        setTimeout(() => {
          // kakao_id가 있으면 마이페이지로, 없으면 메인으로
          const redirectPath = data.user?.kakaoId 
            ? `/mypage?kakao_id=${data.user.kakaoId}`
            : "/";
          console.log("🚀 [리다이렉트] 이동할 경로:", redirectPath);
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
            
            {/* 데이터 확인 정보 (개발용) */}
            {debugData && (
              <div className="mt-6 w-full max-w-2xl space-y-4">
                {/* 1. 카카오 콜백 데이터 */}
                {debugData.kakaoCallback && (
                  <div className="p-4 bg-blue-50 rounded-lg text-left space-y-2">
                    <p className="font-semibold text-blue-800 mb-2">
                      📥 1. 카카오에서 받아온 데이터
                    </p>
                    <pre className="text-xs bg-white p-3 rounded overflow-auto max-h-40 border border-blue-200">
                      {JSON.stringify(debugData.kakaoCallback, null, 2)}
                    </pre>
                  </div>
                )}

                {/* 2. API 응답 데이터 */}
                {debugData.apiResponse && (
                  <div className="p-4 bg-green-50 rounded-lg text-left space-y-2">
                    <p className="font-semibold text-green-800 mb-2">
                      🔄 2. 로그인 API 응답 데이터
                    </p>
                    <pre className="text-xs bg-white p-3 rounded overflow-auto max-h-40 border border-green-200">
                      {JSON.stringify(debugData.apiResponse, null, 2)}
                    </pre>
                  </div>
                )}

                {/* 3. 인증 확인 데이터 */}
                {debugData.authCheck && (
                  <div className="p-4 bg-purple-50 rounded-lg text-left space-y-2">
                    <p className="font-semibold text-purple-800 mb-2">
                      🔐 3. 인증 상태 확인 데이터
                    </p>
                    <pre className="text-xs bg-white p-3 rounded overflow-auto max-h-40 border border-purple-200">
                      {JSON.stringify(debugData.authCheck, null, 2)}
                    </pre>
                  </div>
                )}

                {/* 간단한 요약 정보 */}
                {authInfo && (
                  <div className="p-4 bg-gray-50 rounded-lg text-left space-y-2 text-xs">
                    <p className="font-semibold text-black/80 mb-2">📋 요약 정보:</p>
                    <div className="space-y-1">
                      <p>
                        <span className="font-medium">로그인 상태:</span>{" "}
                        <span className={authInfo.isAuthenticated ? "text-green-600" : "text-red-600"}>
                          {authInfo.isAuthenticated ? "✅ 로그인됨" : "❌ 로그인 안됨"}
                        </span>
                      </p>
                      {authInfo.user && (
                        <>
                          <p>
                            <span className="font-medium">사용자 ID:</span> {authInfo.user.id}
                          </p>
                          <p>
                            <span className="font-medium">이름:</span> {authInfo.user.name}
                          </p>
                          <p>
                            <span className="font-medium">카카오 ID:</span> {authInfo.user.kakaoId}
                          </p>
                        </>
                      )}
                      {authInfo.cookies && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="font-medium mb-1">쿠키 정보:</p>
                          <p className="text-gray-600">
                            customer_id: {authInfo.cookies.customer_id ? `✅ ${authInfo.cookies.customer_id}` : "❌ 없음"}
                          </p>
                          <p className="text-gray-600">
                            kakao_id: {authInfo.cookies.kakao_id ? `✅ ${authInfo.cookies.kakao_id}` : "❌ 없음"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-gray-400 text-center">
                  💡 브라우저 개발자 도구(F12) → Application → Cookies에서도 쿠키 확인 가능
                  <br />
                  💡 로컬 테스트 시 .env.local에 KAKAO_REDIRECT_URI=http://localhost:3000/oauth/callback/kakao 설정 필요
                </p>
              </div>
            )}
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

