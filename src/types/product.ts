// PostgreSQL ENUM과 동일한 순서로 정의
export const PRODUCT_CATEGORIES = [
  /**
   * refill products
   */
  "snack_drink_base",
  "detergent",
  "lotion_oil",
  "cream_balm_gel_pack",
  "tea",
  "body_handwash",
  "cleansing",
  "cooking_ingredient",
  "conditioner",
  "shampoo",
  /**
   * general categories
   */
  "stationery",
  "bathroom",
  "cleaning",
  "kitchen",
  "others",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const REFILL_CATEGORY: Partial<Record<ProductCategory, string>> = {
  shampoo: "샴푸",
  conditioner: "컨디셔너",
  cleansing: "클렌징 제품",
  lotion_oil: "로션/오일",
  cream_balm_gel_pack: "크림/밤/젤/팩",
  detergent: "세제",
  body_handwash: "바디워시/핸드워시",
  cooking_ingredient: "요리용 식재료",
  snack_drink_base: "간식 및 음료 베이스",
  tea: "차류",
};

// TODO: 일반 상품 카테고리 반영 필요
export const GENERAL_CATEGORY: Partial<Record<ProductCategory, string>> = {
  stationery: "문구류",
  bathroom: "욕실용품",
  cleaning: "청소용품",
  kitchen: "주방용품",
  others: "기타",
};

// 모든 카테고리 라벨 통합
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  ...REFILL_CATEGORY,
  ...GENERAL_CATEGORY,
} as Record<ProductCategory, string>;

export type Product = {
  id: number;
  name: string | null;
  short_description: string | null;
  brand: string | null;
  ingredients: string | null;
  environmental_contribution: string | null;
  category: string | null;
  current_price: number | null;
  current_carbon_emission: number | null;
};
