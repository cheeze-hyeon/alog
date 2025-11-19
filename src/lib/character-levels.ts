import type { CharacterLevel, CharacterProgress, CharacterGrade } from "@/types/mypage";

// 등급 정의
export const CHARACTER_GRADES: CharacterGrade[] = [
  {
    grade: 1,
    name: "새싹",
    emoji: "🌱",
    minAmount: 0,
    maxAmount: 50000,
  },
  {
    grade: 2,
    name: "잎새",
    emoji: "🍃",
    minAmount: 50000,
    maxAmount: 200000,
  },
  {
    grade: 3,
    name: "나무",
    emoji: "🌳",
    minAmount: 200000,
    maxAmount: 1000000,
  },
  {
    grade: 4,
    name: "지구",
    emoji: "🌍",
    minAmount: 1000000,
    maxAmount: null,
  },
];

// 레벨 동적 생성 함수
function generateLevels(): CharacterLevel[] {
  const levels: CharacterLevel[] = [];

  // 등급 1: Lv.1 (0~50,000원)
  levels.push({
    level: 1,
    grade: 1,
    name: "새싹",
    emoji: "🌱",
    minAmount: 0,
    maxAmount: 50000,
  });

  // 등급 2: Lv.2~4 (50,000~200,000원, 5만원 단위)
  for (let i = 2; i <= 4; i++) {
    const minAmount = 50000 + (i - 2) * 50000;
    const maxAmount = minAmount + 50000;
    levels.push({
      level: i,
      grade: 2,
      name: "잎새",
      emoji: "🍃",
      minAmount,
      maxAmount: i === 4 ? 200000 : maxAmount,
    });
  }

  // 등급 3: Lv.5~8 (200,000~1,000,000원, 20만원 단위)
  for (let i = 5; i <= 8; i++) {
    const minAmount = 200000 + (i - 5) * 200000;
    const maxAmount = minAmount + 200000;
    levels.push({
      level: i,
      grade: 3,
      name: "나무",
      emoji: "🌳",
      minAmount,
      maxAmount: i === 8 ? 1000000 : maxAmount,
    });
  }

  // 등급 4: Lv.9+ (1,000,000원 이상, 30만원 단위, 무제한)
  // 최대 50개 레벨까지 생성 (필요시 조정)
  for (let i = 9; i <= 58; i++) {
    const minAmount = 1000000 + (i - 9) * 300000;
    levels.push({
      level: i,
      grade: 4,
      name: "지구",
      emoji: "🌍",
      minAmount,
      maxAmount: minAmount + 300000,
    });
  }

  return levels;
}

export const CHARACTER_LEVELS = generateLevels();

/**
 * 누적 구매 금액을 기반으로 캐릭터 레벨과 진행 상황을 계산합니다.
 */
export function calculateCharacterProgress(
  accumulatedPurchaseAmount: number,
): CharacterProgress {
  // 현재 레벨 찾기
  let currentLevel: CharacterLevel = CHARACTER_LEVELS[0];
  let currentLevelIndex = -1;

  for (let i = 0; i < CHARACTER_LEVELS.length; i++) {
    const level = CHARACTER_LEVELS[i];
    if (
      accumulatedPurchaseAmount >= level.minAmount &&
      (level.maxAmount === null || accumulatedPurchaseAmount < level.maxAmount)
    ) {
      currentLevel = level;
      currentLevelIndex = i;
      break;
    }
  }

  // 마지막 레벨을 넘어선 경우
  if (accumulatedPurchaseAmount >= CHARACTER_LEVELS[CHARACTER_LEVELS.length - 1].minAmount) {
    currentLevel = CHARACTER_LEVELS[CHARACTER_LEVELS.length - 1];
    currentLevelIndex = CHARACTER_LEVELS.length - 1;
  }

  // 현재 등급 찾기
  let currentGrade: CharacterGrade = CHARACTER_GRADES[0];
  for (const grade of CHARACTER_GRADES) {
    if (
      accumulatedPurchaseAmount >= grade.minAmount &&
      (grade.maxAmount === null || accumulatedPurchaseAmount < grade.maxAmount)
    ) {
      currentGrade = grade;
      break;
    }
  }

  // 마지막 등급을 넘어선 경우
  if (
    accumulatedPurchaseAmount >= CHARACTER_GRADES[CHARACTER_GRADES.length - 1].minAmount
  ) {
    currentGrade = CHARACTER_GRADES[CHARACTER_GRADES.length - 1];
  }

  // 다음 레벨 찾기
  const nextLevel =
    currentLevelIndex >= 0 && currentLevelIndex < CHARACTER_LEVELS.length - 1
      ? CHARACTER_LEVELS[currentLevelIndex + 1]
      : null;

  // 다음 등급 찾기
  const currentGradeIndex = CHARACTER_GRADES.findIndex((g) => g.grade === currentGrade.grade);
  const nextGrade =
    currentGradeIndex >= 0 && currentGradeIndex < CHARACTER_GRADES.length - 1
      ? CHARACTER_GRADES[currentGradeIndex + 1]
      : null;

  // 현재 레벨 진행률 계산
  let progressPercentage = 100;
  let amountToNextLevel = 0;

  if (nextLevel && currentLevel.maxAmount !== null) {
    const currentLevelRange = currentLevel.maxAmount - currentLevel.minAmount;
    const progressInLevel = accumulatedPurchaseAmount - currentLevel.minAmount;
    progressPercentage = Math.min(100, Math.max(0, (progressInLevel / currentLevelRange) * 100));
    amountToNextLevel = Math.max(0, nextLevel.minAmount - accumulatedPurchaseAmount);
  }

  // 다음 등급까지 필요한 금액 계산
  let amountToNextGrade = 0;
  if (nextGrade) {
    amountToNextGrade = Math.max(0, nextGrade.minAmount - accumulatedPurchaseAmount);
  }

  return {
    currentLevel,
    currentGrade,
    nextLevel,
    nextGrade,
    currentAmount: accumulatedPurchaseAmount,
    progressPercentage: Math.round(progressPercentage * 10) / 10,
    amountToNextLevel,
    amountToNextGrade,
  };
}
