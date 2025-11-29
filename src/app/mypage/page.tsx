"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { CustomerMyPageData } from "@/types";
import HeaderSection from "@/components/Mypage/HeaderSection";
import EnvironmentSection from "@/components/Mypage/EnvironmentSection";
import BadgesSection from "@/components/Mypage/BadgesSection";

function MyPageContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<CustomerMyPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const kakaoId = searchParams.get("kakao_id");
    const phone = searchParams.get("phone");

    if (!kakaoId && !phone) {
      setError("카카오 ID 또는 전화번호가 필요합니다.");
      setLoading(false);
      return;
    }

    // API에서 마이페이지 데이터 조회
    const fetchMyPageData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 전화번호가 있으면 전화번호로, 없으면 kakao_id로 조회
        const queryParam = phone
          ? `phone=${encodeURIComponent(phone)}`
          : `kakao_id=${encodeURIComponent(kakaoId!)}`;

        const response = await fetch(`/api/customers/mypage?${queryParam}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "마이페이지 데이터를 불러올 수 없습니다.");
        }

        const myPageData: CustomerMyPageData = await response.json();
        setData(myPageData);
      } catch (err: any) {
        console.error("Error fetching mypage data:", err);
        setError(err.message || "마이페이지 데이터 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyPageData();
  }, [searchParams]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <img
                src="/loading_mypage.png"
                alt="로딩 중"
                className="w-32 h-32 mx-auto mb-4 animate-pulse"
              />
              <div className="text-slate-600">잠시만 기다려주세요!</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-slate-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center bg-white rounded-2xl shadow-sm p-6">
              <div className="text-4xl mb-4">⚠️</div>
              <div className="text-slate-900 font-semibold mb-2">오류가 발생했습니다</div>
              <div className="text-slate-600 text-sm">
                {error || "데이터를 불러올 수 없습니다."}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

      return (
        <main className="min-h-screen bg-white">
          <div className="max-w-md mx-auto">
            {/* 헤더 섹션 */}
            <HeaderSection 
              customer={data.customer} 
              characterProgress={data.characterProgress}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />

            {/* 환경 영향 섹션 */}
            <EnvironmentSection 
              stats={data.stats} 
              purchaseItems={data.purchaseItems}
              selectedYear={selectedYear}
            />

            {/* 구매 내역 섹션 */}
            <BadgesSection 
              purchaseItems={data.purchaseItems}
              selectedYear={selectedYear}
            />
          </div>
        </main>
      );
}

export default function MyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white">
          <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <img
                  src="/loading_mypage.png"
                  alt="로딩 중"
                  className="w-32 h-32 mx-auto mb-4 animate-pulse"
                />
                <div className="text-slate-600">잠시만 기다려주세요!</div>
              </div>
            </div>
          </div>
        </main>
      }
    >
      <MyPageContent />
    </Suspense>
  );
}
