import type { Customer, CustomerLoyalty, ProductCategory } from "@/types";
import type { Badge } from "./badge";

export interface EnvironmentStats {
  refillCount: number; // 리필 횟수
  plasticReductionKg: number; // 플라스틱 감축량 (kg) - 더미 데이터 (표시용)
  plasticReductionG: number; // 플라스틱 감축량 (g) - 더미 데이터
  treeReduction: number; // 나무 감축량 (그루) - 더미 데이터
  co2ReductionKg: number; // CO2 감축량 (kg)
}

export interface PurchaseItem {
  id: number;
  date: string; // YYMMDD 형식
  productName: string;
  productCategory: ProductCategory | null;
  price: number;
  isRefill: boolean; // 리필 여부
  type: "refill" | "product"; // 리필 또는 일반 상품
}

export interface CharacterLevel {
  level: number;
  name: string;
  emoji: string;
  minAmount: number; // 최소 구매 금액
  maxAmount: number | null; // 최대 구매 금액 (null이면 무제한)
}

export interface CharacterProgress {
  currentLevel: CharacterLevel;
  nextLevel: CharacterLevel | null;
  currentAmount: number; // 현재 누적 구매 금액
  progressPercentage: number; // 현재 레벨 진행률 (0-100)
  amountToNextLevel: number; // 다음 레벨까지 필요한 금액
}

export interface CustomerMyPageData {
  customer: Customer;
  loyalty: CustomerLoyalty | null;
  stats: EnvironmentStats;
  characterProgress: CharacterProgress;
  badges: Badge[];
  totalPurchaseCount: number; // 총 구매 횟수
  purchaseItems: PurchaseItem[]; // 구매 내역
}
