"use client";

import type { ProductCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";

type ExtendedCategory = ProductCategory | "all" | "shampoo_conditioner_cleansing";

interface CategorySidebarProps {
  activeCat: ProductCategory | "all" | "shampoo_conditioner_cleansing";
  onChangeCat: (cat: ProductCategory | "all" | "shampoo_conditioner_cleansing") => void;
}

export default function CategorySidebar({ activeCat, onChangeCat }: CategorySidebarProps) {
  // 통합할 카테고리 그룹
  const GROUPED_CATEGORIES = ["shampoo", "conditioner", "cleansing"] as const;

  // 통합 카테고리를 제외한 나머지 카테고리
  const otherCategories = Object.keys(CATEGORY_LABELS).filter(
    (key) => !GROUPED_CATEGORIES.includes(key as any),
  ) as ProductCategory[];

  // 통합 카테고리가 활성화되었는지 확인 (세 카테고리 중 하나라도 활성화된 경우)
  const isGroupedActive =
    activeCat === "shampoo_conditioner_cleansing" || GROUPED_CATEGORIES.includes(activeCat as any);

  return (
    <aside className="w-[184px] h-full bg-[#E75251] flex flex-col items-center py-1.5 sm:py-2 md:py-2.5 lg:py-3 overflow-hidden">
      <div className="w-full flex flex-col gap-0.5 sm:gap-1 md:gap-1.5">
        {/* 전체 */}
        <button
          onClick={() => onChangeCat("all")}
          className={`w-full py-1 sm:py-1.5 md:py-2 pr-4 text-xs sm:text-sm md:text-base font-semibold text-left transition-colors ${
            activeCat === "all"
              ? "bg-white text-black ml-3 pl-4 rounded-l-lg rounded-r-none"
              : "bg-transparent text-white hover:bg-white/10 px-4 rounded-lg"
          }`}
        >
          전체
        </button>

        {/* 통합 카테고리: 샴푸/컨디셔너/클렌징 */}
        <button
          onClick={() => onChangeCat("shampoo_conditioner_cleansing")}
          className={`w-full py-1 sm:py-1.5 md:py-2 pr-4 text-xs sm:text-sm md:text-base font-semibold text-left transition-colors ${
            isGroupedActive
              ? "bg-white text-black ml-3 pl-4 rounded-l-lg rounded-r-none"
              : "bg-transparent text-white hover:bg-white/10 px-4 rounded-lg"
          }`}
        >
          샴푸/컨디셔너/클렌징
        </button>

        {/* 나머지 카테고리 목록 */}
        {otherCategories.map((key) => {
          const isActive = activeCat === key;
          return (
            <button
              key={key}
              onClick={() => onChangeCat(key as ProductCategory)}
              className={`w-full py-1 sm:py-1.5 md:py-2 pr-4 text-xs sm:text-sm md:text-base font-semibold text-left transition-colors ${
                isActive
                  ? "bg-white text-black ml-3 pl-4 rounded-l-lg rounded-r-none"
                  : "bg-transparent text-white hover:bg-white/10 px-4 rounded-lg"
              }`}
            >
              {CATEGORY_LABELS[key]}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
