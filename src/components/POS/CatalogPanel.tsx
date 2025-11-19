"use client";

import { useMemo } from "react";
import type { Product, ProductCategory } from "@/types";

type ExtendedCategory = ProductCategory | "all";

interface CatalogPanelProps {
  products: Product[];
  activeCat: ProductCategory | "all";
  onChangeCat: (cat: ProductCategory | "all") => void;
  onPick: (product: Product) => void;
  searchQuery?: string;
}

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  shampoo: "샴푸",
  conditioner: "컨디셔너",
  body_handwash: "바디워시/핸드워시",
  lotion_oil: "로션/오일",
  cream_balm_gel_pack: "크림/밤/젤/팩",
  cleansing: "클렌징 제품",
  detergent: "세제",
  snack_drink_base: "간식 및 음료 베이스",
  cooking_ingredient: "요리용 식재료",
  tea: "차류",
};

export default function CatalogPanel({
  products,
  activeCat,
  onChangeCat,
  onPick,
  searchQuery = "",
}: CatalogPanelProps) {
  // ✅ category가 없는 상품은 기본값 'shampoo'로 매핑 (안정성 확보)
  const normalized = useMemo(
    () => products.map((p) => (p.category ? p : ({ ...p, category: "shampoo" } as Product))),
    [products],
  );

  // 현재 활성 카테고리 (전체 포함)
  const currentActiveCat: ExtendedCategory = activeCat as ExtendedCategory;

  // ✅ 검색어 및 카테고리 필터링
  const filtered = useMemo(() => {
    let result = normalized;

    // 1. 먼저 카테고리 필터링 (전체가 아니면)
    if (currentActiveCat !== "all") {
      result = result.filter((p) => p.category === currentActiveCat);
    }

    // 2. 그 다음 검색어로 필터링 (검색어가 있으면)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      // 검색어를 단어 단위로 분리 (띄어쓰기 기준)
      const searchWords = query
        .split(/\s+/)
        .filter((word) => word.length > 0)
        .map((word) => word.trim());

      result = result.filter((p) => {
        // name과 brand 필드에서 검색
        const productName = (p.name?.toLowerCase() ?? "").trim();
        const productBrand = (p.brand?.toLowerCase() ?? "").trim();

        if (!productName && !productBrand) {
          return false;
        }

        // 각 검색어가 모두 포함되어야 함 (AND 조건)
        // 검색어는 name 또는 brand 중 어디든 포함되어 있으면 됨
        return searchWords.every((searchWord) => {
          // 정확한 문자열 포함 확인
          // '천연'을 검색하면 '천연'이라는 정확한 연속된 문자열이 포함되어야 함
          // '친환경'에는 '천연'이 없으므로 매칭되지 않음
          return productName.includes(searchWord) || productBrand.includes(searchWord);
        });
      });
    }

    return result;
  }, [normalized, searchQuery, currentActiveCat]);

  const formatUnitPrice = (price: number) => {
    return `${Math.round(price)}원/g`;
  };

  return (
    <div className="w-full pl-2 md:pl-3 lg:pl-4">
      {/* 상단 카테고리 탭 */}
      <div className="mb-6 md:mb-8">
        <div className="relative">
          <div className="overflow-x-auto pb-2 -mx-2 md:-mx-3 lg:-mx-4 px-2 md:px-3 lg:px-4 scrollbar-hide">
            <div className="flex gap-4 md:gap-6 lg:gap-8 min-w-max">
              {/* 전체 탭 */}
              <div className="h-[33px] relative flex-shrink-0">
                <button
                  onClick={() => onChangeCat("all")}
                  className={`text-sm font-semibold text-left whitespace-nowrap transition-colors ${
                    currentActiveCat === "all"
                      ? "text-[#e75251]"
                      : "text-black hover:text-[#e75251]"
                  }`}
                >
                  전체
                </button>
                {currentActiveCat === "all" && (
                  <div className="absolute left-0 right-0 top-[30px] h-0.5 bg-[#E75251]"></div>
                )}
              </div>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                const isActive = currentActiveCat === key;
                return (
                  <div key={key} className="h-[33px] relative flex-shrink-0">
                    <button
                      onClick={() => onChangeCat(key as ProductCategory)}
                      className={`text-sm font-semibold text-left whitespace-nowrap transition-colors ${
                        isActive ? "text-[#e75251]" : "text-black hover:text-[#e75251]"
                      }`}
                    >
                      {label}
                    </button>
                    {isActive && (
                      <div className="absolute left-0 right-0 top-[30px] h-0.5 bg-[#E75251]"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="absolute left-0 right-0 top-[32px] h-px bg-[#393C49] pointer-events-none"></div>
        </div>
      </div>

      {/* 검색 결과 표시 */}
      {searchQuery.trim() && (
        <div className="mb-4 px-2 md:px-3 lg:px-4">
          <p className="text-sm md:text-base text-gray-600">
            <span className="font-semibold text-[#e75251]">"{searchQuery}"</span>
            {currentActiveCat !== "all" && (
              <>
                {" "}
                (
                <span className="font-medium">
                  {CATEGORY_LABELS[currentActiveCat as ProductCategory]}
                </span>
                ) 검색 결과
              </>
            )}
            {currentActiveCat === "all" && " 검색 결과"}{" "}
            <span className="font-semibold">{filtered.length}개</span>
          </p>
        </div>
      )}

      {/* 상품 카드 그리드 */}
      {filtered.length === 0 ? (
        <p className="text-slate-400 text-sm mt-6 px-2 md:px-3 lg:px-4">
          {searchQuery.trim()
            ? currentActiveCat !== "all"
              ? `"${searchQuery}"에 대한 ${CATEGORY_LABELS[currentActiveCat as ProductCategory]} 검색 결과가 없습니다.`
              : `"${searchQuery}"에 대한 검색 결과가 없습니다.`
            : currentActiveCat === "all"
              ? "등록된 상품이 없습니다."
              : `${CATEGORY_LABELS[currentActiveCat as ProductCategory]} 카테고리에 등록된 상품이 없습니다.`}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-7">
          {filtered.map((p) => {
            // current_price는 g당 단가
            const unitPricePerG = p.current_price || 0;
            return (
              <button
                key={p.id}
                onClick={() => onPick(p)}
                className="relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 md:p-6 flex flex-col items-center min-h-[140px]"
              >
                {/* 브랜드명 */}
                <p className="text-sm font-medium text-black mb-2 text-center min-h-[1.25rem]">
                  {p.brand || "\u00A0"}
                </p>

                {/* 제품명 */}
                <p className="text-sm md:text-base font-medium text-black mb-2 text-center line-clamp-2">
                  {p.name || "상품명 없음"}
                </p>

                {/* 단가 */}
                <p className="text-sm text-black text-center mt-auto">
                  {formatUnitPrice(unitPricePerG)}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
