export type BadgeCategory = "purchase" | "refill" | "environment" | "milestone";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // 이모지 또는 아이콘 이름
  category: BadgeCategory;
  unlocked: boolean; // 고객이 획득했는지 여부
  unlockedAt?: Date | string | null; // 획득한 날짜 (선택적)
}

// 더미 배지 데이터 (추후 동적 로직으로 교체 가능)
export const DUMMY_BADGES: Badge[] = [
  {
    id: "first_purchase",
    name: "첫 구매",
    description: "첫 번째 구매를 완료했어요!",
    icon: "🛒",
    category: "purchase",
    unlocked: true,
    unlockedAt: new Date("2024-01-15"),
  },
  {
    id: "refill_master",
    name: "리필러",
    description: "리필 10회 이상 구매",
    icon: "♻️",
    category: "refill",
    unlocked: true,
    unlockedAt: new Date("2024-02-20"),
  },
  {
    id: "eco_guardian",
    name: "환경 지킴이",
    description: "CO2 10kg 이상 절감",
    icon: "🌱",
    category: "environment",
    unlocked: true,
    unlockedAt: new Date("2024-03-10"),
  },
  {
    id: "plastic_saver",
    name: "플라스틱 제로",
    description: "플라스틱 1kg 이상 절감",
    icon: "🌊",
    category: "environment",
    unlocked: false,
  },
  {
    id: "tree_planter",
    name: "나무 심는 사람",
    description: "나무 5그루 이상 절감",
    icon: "🌳",
    category: "environment",
    unlocked: false,
  },
  {
    id: "loyal_customer",
    name: "단골 고객",
    description: "누적 구매 금액 100,000원 이상",
    icon: "⭐",
    category: "milestone",
    unlocked: true,
    unlockedAt: new Date("2024-04-01"),
  },
  {
    id: "early_adopter",
    name: "초기 사용자",
    description: "알맹상점의 초기 고객",
    icon: "🎯",
    category: "milestone",
    unlocked: false,
  },
  {
    id: "green_champion",
    name: "그린 챔피언",
    description: "모든 환경 배지 획득",
    icon: "🏆",
    category: "milestone",
    unlocked: false,
  },
];
