import type { EnvironmentStats } from "@/types";

interface EnvironmentSectionProps {
  stats: EnvironmentStats;
}

export default function EnvironmentSection({ stats }: EnvironmentSectionProps) {
  const { refillCount, plasticReductionG, treeReduction, co2ReductionKg } = stats;

  return (
    <div className="w-full bg-white px-4 pt-2 pb-2">
      <div className="max-w-md mx-auto">
        {/* 리필 버튼 */}
        <div className="w-48 h-9 rounded-[10px] bg-[#e04f4e] flex items-center justify-center mb-6 mx-auto">
          <p className="text-[15px] text-white">총 {refillCount}번 리필</p>
        </div>

        {/* 환경 영향 리스트 */}
        <div className="space-y-6">
          {/* 플라스틱 */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <p className="text-[15px] text-black">플라스틱</p>
              <p className="text-[15px] text-black">{plasticReductionG}g 감소</p>
            </div>
            <p className="text-xs text-black/50">500ml 플라스틱 1개(30g) 생산 방지</p>
          </div>

          {/* 나무 */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <p className="text-[15px] text-black">나무</p>
              <p className="text-[15px] text-black">{treeReduction.toFixed(2)} 그루</p>
            </div>
            <p className="text-xs text-black/50">리필 1번 시 약 0.03 그루</p>
          </div>

          {/* CO2 */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <p className="text-[15px] text-black">CO2</p>
              <p className="text-[15px] text-black">{co2ReductionKg.toFixed(1)}kg 감축</p>
            </div>
            <p className="text-xs text-black/50 mb-6">500ml 당 0.68kg 감축 효과</p>
          </div>
        </div>

        {/* 구분선 */}
        <div className="w-full h-[1px] bg-[#959595]/50 my-6" />
      </div>
    </div>
  );
}