"use client";

import type { Product } from "@/types/product";
import { REFILL_CATEGORY, CATEGORY_LABELS, type ProductCategory } from "@/types/product";
import { useState, useEffect } from "react";
import { getBaseUrl } from "@/lib/env";
// 아이콘 컴포넌트 (SVG로 구현)
const XIcon = ({ size = 20, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6L6 18M6 6L18 18" />
  </svg>
);

const LeafIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const InfoIcon = ({ size = 32, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const ShoppingBagIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

type Props = {
  open: boolean;
  onClose: () => void;
  productId: number | null;
};

function formatCurrency(krw: number) {
  return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(krw);
}

// 리터럴 \n 문자열을 실제 줄바꿈으로 변환
function formatTextWithLineBreaks(text: string | null): string {
  if (!text) return "";
  return text.replace(/\\n/g, "\n");
}

// 카테고리에 따라 이미지 경로 반환
function getCategoryImage(category: ProductCategory | null): string {
  if (!category) return "/product/stationery.png";

  // 1. 욕실 및 퍼스널 케어
  const bathroomCategories: ProductCategory[] = [
    "shampoo",
    "conditioner",
    "body_handwash",
    "cleansing",
    "lotion_oil",
    "cream_balm_gel_pack",
    "bathroom",
  ];
  if (bathroomCategories.includes(category)) {
    return "/product/bathroom.png";
  }

  // 2. 주방 및 식품
  const kitchenCategories: ProductCategory[] = [
    "snack_drink_base",
    "tea",
    "cooking_ingredient",
    "kitchen",
  ];
  if (kitchenCategories.includes(category)) {
    return "/product/kitchen.png";
  }

  // 3. 세탁 및 청소
  const cleaningCategories: ProductCategory[] = ["detergent", "cleaning"];
  if (cleaningCategories.includes(category)) {
    return "/product/cleaning.png";
  }

  // 4. 문구 및 기타
  if (category === "stationery") {
    return "/product/stationery.png";
  }

  // 기본값
  return "/product/stationery.png";
}

// 스켈레톤 UI 컴포넌트 (로딩 경험 개선)
const ProductSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-48 bg-gray-200 rounded-2xl w-full" />
    <div className="h-8 bg-gray-200 rounded w-3/4" />
    <div className="h-6 bg-gray-200 rounded w-1/2" />
    <div className="space-y-2 pt-4">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-full" />
    </div>
  </div>
);

export default function ProductDetailModal({ open, onClose, productId }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !productId) {
      setProduct(null);
      setError(null);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${getBaseUrl()}/api/products/${productId}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("상품 정보를 불러올 수 없습니다.");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [open, productId]);

  // ESC 키 닫기 및 스크롤 방지
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  if (!open) return null;

  // 데이터 가공
  const categoryKey = product?.category as ProductCategory | null;
  const isRefill = categoryKey !== null && REFILL_CATEGORY[categoryKey] !== undefined;
  const categoryLabel = categoryKey && CATEGORY_LABELS[categoryKey]
    ? CATEGORY_LABELS[categoryKey]
    : product?.category || "기타";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-0 sm:p-4"
      onClick={onClose}
    >
      {/* 모달 컨테이너: 모바일에서는 Bottom Sheet 느낌, 데스크탑에서는 Modal */}
      <div
        className="relative w-full max-w-[400px] max-h-[85vh] sm:max-h-[90vh] rounded-t-[24px] sm:rounded-[24px] bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 & 닫기 버튼 */}
        <div className="absolute right-4 top-4 z-20">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow-sm backdrop-blur transition-all"
            aria-label="닫기"
          >
            <XIcon size={20} className="text-gray-600" />
          </button>
        </div>

        {/* 컨텐츠 스크롤 영역 */}
        <div className="overflow-y-auto flex-1 scrollbar-hide">
          {loading ? (
            <div className="p-6 pt-12">
              <ProductSkeleton />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
              <InfoIcon size={32} className="text-gray-400 mb-2" />
              <p className="text-gray-500">{error}</p>
            </div>
          ) : product ? (
            <>
              {/* 1. 상품 이미지 영역 */}
              <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
                <img
                  src={getCategoryImage(categoryKey)}
                  alt={product.name || "상품 이미지"}
                  className="w-full h-full object-cover"
                />
                {isRefill && (
                  <div className="absolute bottom-3 left-4 bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                    <LeafIcon size={12} /> 리필 가능
                  </div>
                )}
              </div>

              <div className="p-6 space-y-6">
                {/* 2. 헤더 정보 (브랜드, 이름, 가격) */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {product.brand || "알맹상점"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {categoryLabel}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                    {product.name}
                  </h2>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-[#e04f4e]">
                      {product.current_price ? formatCurrency(product.current_price) : "가격 미정"}/g
                    </span>
                    {/* 리필 상품일 경우 단위 표시 추가 추천 (예: /1g) */}
                  </div>
                </div>

            
                {/* 3. 친환경 정보 — 더 미니멀한 스타일 */}
{(product.current_carbon_emission !== null || product.environmental_contribution) && (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
    <div className="p-1.5 bg-white rounded-full text-green-600 border border-gray-200">
      <LeafIcon size={16} />
    </div>

    <div className="flex-1">
      {product.current_carbon_emission !== null && (
        <p className="text-sm text-gray-700">
          탄소 배출량
          <span className="font-semibold text-gray-900 ml-1">
            {product.current_carbon_emission.toFixed(3)}kg CO₂
          </span>
        </p>
      )}

      {product.environmental_contribution && (
        <p className="text-xs text-gray-500 leading-relaxed mt-1 whitespace-pre-line">
          {formatTextWithLineBreaks(product.environmental_contribution)}
        </p>
      )}
    </div>
  </div>
)}


                {/* 4. 상세 정보 (아코디언 없이 깔끔한 나열) */}
                <div className="space-y-4 pt-2">
                  {product.short_description && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">상품 소개</h4>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {formatTextWithLineBreaks(product.short_description)}
                      </p>
                    </div>
                  )}

                  {product.ingredients && (
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">전성분</h4>
                      <p className="text-xs text-gray-500 leading-relaxed word-break-keep-all">
                        {product.ingredients}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
