"use client";

import type { ProductCategory } from "@/types";

type ExtendedCategory = ProductCategory | "all";

interface CategorySidebarProps {
  activeCat: ProductCategory | "all";
  onChangeCat: (cat: ProductCategory | "all") => void;
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

export default function CategorySidebar({ activeCat, onChangeCat }: CategorySidebarProps) {
  return (
    <aside className="w-[184px] h-full bg-[#E75251] flex flex-col items-center py-4 md:py-6 overflow-hidden scrollbar-hide">
      <div className="w-full flex flex-col gap-2 md:gap-3">
        {/* 전체 */}
        <button
          onClick={() => onChangeCat("all")}
          className={`w-full py-2 md:py-3 pr-4 text-sm md:text-base font-semibold text-left transition-colors ${
            activeCat === "all"
              ? "bg-white text-black ml-3 pl-4 rounded-l-lg rounded-r-none"
              : "bg-transparent text-white hover:bg-white/10 px-4 rounded-lg"
          }`}
        >
          전체
        </button>

        {/* 카테고리 목록 */}
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
          const isActive = activeCat === key;
          return (
            <button
              key={key}
              onClick={() => onChangeCat(key as ProductCategory)}
              className={`w-full py-2 md:py-3 pr-4 text-sm md:text-base font-semibold text-left transition-colors ${
                isActive
                  ? "bg-white text-black ml-3 pl-4 rounded-l-lg rounded-r-none"
                  : "bg-transparent text-white hover:bg-white/10 px-4 rounded-lg"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

