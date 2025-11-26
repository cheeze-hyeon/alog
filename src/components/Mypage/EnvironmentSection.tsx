import type { EnvironmentStats, PurchaseItem } from "@/types";
import { useMemo } from "react";

interface EnvironmentSectionProps {
  stats: EnvironmentStats;
  purchaseItems: PurchaseItem[];
  selectedYear: number;
}

export default function EnvironmentSection({ stats, purchaseItems, selectedYear }: EnvironmentSectionProps) {
  const { refillCount, plasticReductionG, treeReduction, co2ReductionKg } = stats;

  // 선택된 연도의 고유 영수증 개수 계산
  const visitCount = useMemo(() => {
    const yearItems = purchaseItems.filter((item) => {
      const itemYear = parseInt(item.visitDate.split('.')[0], 10);
      return itemYear === selectedYear;
    });
    
    // 고유한 receiptId의 개수
    const uniqueReceiptIds = new Set(yearItems.map((item) => item.receiptId));
    return uniqueReceiptIds.size;
  }, [purchaseItems, selectedYear]);

  return (
    <div className="w-full bg-white px-4 pt-2 pb-2">
      <div className="max-w-md mx-auto">
        {/* 방문 버튼 */}
        <div className="w-48 h-9 rounded-[10px] bg-[#e04f4e] flex items-center justify-center mb-6 mx-auto">
          <p className="text-[15px] text-white">총 {visitCount}번 방문</p>
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
            <div className="flex items-start gap-1 mt-2">
              <span className="text-xs mt-0.5">💡</span>
              <p className="text-xs leading-relaxed" style={{ color: "#E04F4E" }}>
                알맹상점은 올해 플라스틱을 <span className="font-bold">125,000g</span> 줄이고 있어요!
              </p>
            </div>
          </div>

          {/* 나무 */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <p className="text-[15px] text-black">나무</p>
              <p className="text-[15px] text-black">{treeReduction.toFixed(2)} 그루</p>
            </div>
            <p className="text-xs text-black/50">리필 1번 시 약 0.03 그루</p>
            <div className="flex items-start gap-1 mt-2">
              <span className="text-xs mt-0.5">💡</span>
              <p className="text-xs leading-relaxed" style={{ color: "#E04F4E" }}>
                알맹상점은 올해 나무를 <span className="font-bold">142그루</span> 아꼈어요!
              </p>
            </div>
          </div>

          {/* CO2 */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <p className="text-[15px] text-black">CO2</p>
              <p className="text-[15px] text-black">{co2ReductionKg.toFixed(1)}kg 감축</p>
            </div>
            <p className="text-xs text-black/50">500ml 당 0.68kg 감축 효과</p>
            <div className="flex items-start gap-1 mt-2">
              <span className="text-xs mt-0.5">💡</span>
              <p className="text-xs leading-relaxed" style={{ color: "#E04F4E" }}>
                알맹상점은 올해 CO2를 <span className="font-bold">3,240kg</span> 감축했어요!
              </p>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="w-full h-[1px] bg-[#959595]/50 my-6" />
      </div>
    </div>
  );
}