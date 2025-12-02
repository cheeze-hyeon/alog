/**
 * CO2 배출량 계산 유틸리티
 * 
 * 계산 기준:
 * - 플라스틱 1kg당 CO2 배출량: 2.09kgCO2eq
 * - 100ml 플라스틱 용기 중량: 18g
 * - 리필 구매 시: 100g 세제 리필 = 100ml 용기 1개 절감 = 18g 플라스틱 절감
 */

// 상수 정의
export const CARBON_EMISSION_PER_KG_PLASTIC = 2.09; // kgCO2eq/kg
export const PLASTIC_CONTAINER_WEIGHT_G = 18; // g (100ml 용기 기준)
export const REFILL_UNIT_G = 100; // g (100g당 용기 1개 절감)

/**
 * 리필 구매량(g)을 기반으로 CO2 절감량(kg)을 계산합니다.
 * 
 * @param refillQuantityG - 리필 구매량 (g 단위)
 * @returns CO2 절감량 (kg 단위)
 * 
 * @example
 * // 100g 리필 구매 시
 * calculateCO2Reduction(100); // 0.03762 kg
 * 
 * // 250g 리필 구매 시
 * calculateCO2Reduction(250); // 0.09405 kg
 */
export function calculateCO2Reduction(refillQuantityG: number): number {
  if (refillQuantityG <= 0) {
    return 0;
  }

  // 1. 리필 구매량(g) → 용기 개수 계산
  const containerCount = refillQuantityG / REFILL_UNIT_G;

  // 2. 절감된 플라스틱(g) 계산
  const plasticReducedG = containerCount * PLASTIC_CONTAINER_WEIGHT_G;

  // 3. CO2 절감량(kg) 계산
  // 플라스틱(g) → kg 변환 후 CO2 배출량 곱하기
  const plasticReducedKg = plasticReducedG / 1000;
  const co2ReductionKg = plasticReducedKg * CARBON_EMISSION_PER_KG_PLASTIC;

  return co2ReductionKg;
}

/**
 * 리필 구매량(g)을 기반으로 절감된 플라스틱 양(g)을 계산합니다.
 * 
 * @param refillQuantityG - 리필 구매량 (g 단위)
 * @returns 절감된 플라스틱 양 (g 단위)
 */
export function calculatePlasticReduction(refillQuantityG: number): number {
  if (refillQuantityG <= 0) {
    return 0;
  }

  const containerCount = refillQuantityG / REFILL_UNIT_G;
  return containerCount * PLASTIC_CONTAINER_WEIGHT_G;
}

