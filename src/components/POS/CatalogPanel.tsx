"use client";

import { useMemo } from "react";
import type { Product, ProductCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";

type ExtendedCategory = ProductCategory | "all" | "shampoo_conditioner_cleansing";

interface CatalogPanelProps {
  products: Product[];
  activeCat: ProductCategory | "all" | "shampoo_conditioner_cleansing";
  onChangeCat: (cat: ProductCategory | "all" | "shampoo_conditioner_cleansing") => void;
  onPick: (product: Product) => void;
  searchQuery?: string;
}

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
      // 통합 카테고리인 경우 세 카테고리 모두 포함
      if (currentActiveCat === "shampoo_conditioner_cleansing") {
        result = result.filter((p) => 
          p.category === "shampoo" || 
          p.category === "conditioner" || 
          p.category === "cleansing"
        );
      } else {
        result = result.filter((p) => p.category === currentActiveCat);
      }
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

  // 카테고리 라벨 가져오기
  const getCategoryLabel = () => {
    if (currentActiveCat === "all") return "전체";
    if (currentActiveCat === "shampoo_conditioner_cleansing") return "샴푸/컨디셔너/클렌징";
    return CATEGORY_LABELS[currentActiveCat as ProductCategory];
  };

  const formatUnitPrice = (price: number) => {
    return `${Math.round(price)}원/g`;
  };

  return (
    <div className="w-full">

      {/* 검색 결과 표시 */}
      {searchQuery.trim() && (
        <div className="mb-4">
          <p className="text-sm md:text-base text-gray-600">
            <span className="font-semibold text-[#e75251]">"{searchQuery}"</span>
            {currentActiveCat !== "all" && (
              <>
                {" "}
                (
                <span className="font-medium">
                  {getCategoryLabel()}
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
        <p className="text-slate-400 text-sm mt-6">
          {searchQuery.trim()
            ? currentActiveCat !== "all"
              ? `"${searchQuery}"에 대한 ${getCategoryLabel()} 검색 결과가 없습니다.`
              : `"${searchQuery}"에 대한 검색 결과가 없습니다.`
            : currentActiveCat === "all"
              ? "등록된 상품이 없습니다."
              : `${getCategoryLabel()} 카테고리에 등록된 상품이 없습니다.`}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-7">
          {filtered.map((p) => {
            // current_price는 g당 단가
            const unitPricePerG = p.current_price || 0;
            return (
              <button
                key={p.id}
                onClick={() => onPick(p)}
                className="relative bg-[#F2F2F7] rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 md:p-6 flex flex-col items-center min-h-[140px]"
              >
                {/* 브랜드명 */}
                <p className="text-sm font-medium text-[#747474] mb-2 text-center min-h-[1.25rem]">
                  {p.brand || "\u00A0"}
                </p>

                {/* 제품명 */}
                <p 
                  className="text-xs md:text-sm font-medium text-black mb-2 text-center line-clamp-3 min-h-[2.5rem] md:min-h-[3rem] flex items-center justify-center"
                  style={{ wordBreak: 'keep-all' }}
                >
                  {p.name || "상품명 없음"}
                </p>

                {/* 단가 */}
                <p className="text-sm text-[#E04F4E] text-center mt-auto">
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
