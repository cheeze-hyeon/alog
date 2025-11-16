export type ProductCategory =
  | "shampoo" // 샴푸
  | "conditioner" // 컨디셔너
  | "body_handwash" // 바디워시/핸드워시
  | "lotion_oil" // 로션/오일
  | "cream_balm_gel_pack" // 크림/밤/젤/팩
  | "cleansing" // 클렌징 제품
  | "detergent" // 세제
  | "snack_drink_base" // 간식 및 음료 베이스
  | "cooking_ingredient" // 요리용 식재료
  | "tea"; // 차류

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
