export interface CartItem {
  productId: string;
  name: string;
  volumeG: number; // 실제 수량 (g 또는 개)
  unitPricePerG: number; // 단가 (원/g 또는 원/개)
  amount: number;
  pricingUnit: "g" | "ea"; // 가격 단위
}
