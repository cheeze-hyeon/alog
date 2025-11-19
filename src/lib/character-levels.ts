import type { CharacterLevel, CharacterProgress } from "@/types/mypage";

// 캐릭터 레벨 정의 (구매 금액 기반)
export const CHARACTER_LEVELS: CharacterLevel[] = [
  {
    level: 1,
    name: "새싹",
    emoji: "🌱",
    minAmount: 0,
    maxAmount: 10000,
  },
  {
    level: 2,
    name: "잎새",
    emoji: "🍃",
    minAmount: 10001,
    maxAmount: 50000,
  },
  {
    level: 3,
    name: "나무",
    emoji: "🌳",
    minAmount: 50001,
    maxAmount: 100000,
  },
  {
    level: 4,
    name: "숲",
    emoji: "🌲",
    minAmount: 100001,
    maxAmount: 200000,
  },
  {
    level: 5,
    name: "지구",
    emoji: "🌍",
    minAmount: 200001,
    maxAmount: null,
  },
];

/**
 * 누적 구매 금액을 기반으로 캐릭터 레벨과 진행 상황을 계산합니다.
 */
export function calculateCharacterProgress(
  accumulatedPurchaseAmount: number,
): CharacterProgress {
  // 현재 레벨 찾기
  const currentLevelIndex = CHARACTER_LEVELS.findIndex((level, index) => {
    const nextLevel = CHARACTER_LEVELS[index + 1];
    if (nextLevel) {
      return (
        accumulatedPurchaseAmount >= level.minAmount &&
        accumulatedPurchaseAmount < nextLevel.minAmount
      );
    } else {
      // 마지막 레벨인 경우
      return accumulatedPurchaseAmount >= level.minAmount;
    }
  });

  const currentLevel =
    currentLevelIndex >= 0
      ? CHARACTER_LEVELS[currentLevelIndex]
      : CHARACTER_LEVELS[0];

  // 다음 레벨 찾기
  const nextLevel =
    currentLevelIndex >= 0 && currentLevelIndex < CHARACTER_LEVELS.length - 1
      ? CHARACTER_LEVELS[currentLevelIndex + 1]
      : null;

  // 현재 레벨 진행률 계산
  let progressPercentage = 100;
  let amountToNextLevel = 0;

  if (nextLevel) {
    const currentLevelRange = nextLevel.minAmount - currentLevel.minAmount;
    const progressInLevel = accumulatedPurchaseAmount - currentLevel.minAmount;
    progressPercentage = Math.min(100, Math.max(0, (progressInLevel / currentLevelRange) * 100));
    amountToNextLevel = Math.max(0, nextLevel.minAmount - accumulatedPurchaseAmount);
  }

  return {
    currentLevel,
    nextLevel,
    currentAmount: accumulatedPurchaseAmount,
    progressPercentage: Math.round(progressPercentage * 10) / 10, // 소수점 첫째 자리까지
    amountToNextLevel,
  };
}
