import type { PurchaseItem } from "@/types";
import { useMemo } from "react";

interface BadgesSectionProps {
  purchaseItems: PurchaseItem[];
}

export default function BadgesSection({ purchaseItems }: BadgesSectionProps) {
  // 날짜별로 그룹화
  const groupedByDate = useMemo(() => {
    const groups: Record<string, PurchaseItem[]> = {};
    purchaseItems.forEach((item) => {
      const dateKey = item.visitDate; // YYYY.MM.DD 형식
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });
    // 날짜순 정렬 (최신순)
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [purchaseItems]);

  return (
    <div className="w-full bg-white px-4 py-6">
      <div className="max-w-md mx-auto">
        <p className="text-[15px] font-semibold text-left text-black/70 mb-2">
          내가 모은 알맹이들
        </p>
        <p className="text-xs text-black/50 mb-6">구매 내역 확인</p>

        {/* 구매 내역 리스트 */}
        {purchaseItems.length > 0 ? (
          <div className="space-y-0">
            {groupedByDate.map(([date, items], groupIndex) => (
              <div key={date}>
                {/* 날짜별 그룹 */}
                {items.map((item, itemIndex) => (
                  <div key={item.id}>
                    {/* 날짜 구분선 (첫 번째 항목이거나 이전 그룹과 다른 날짜인 경우) */}
                    {itemIndex === 0 && groupIndex > 0 && (
                      <div className="border-t border-dashed border-[#959595]/30 my-4" />
                    )}

                    {/* 구매 항목 */}
                    <div className="flex items-start justify-between py-2">
                      <div className="flex-1 min-w-0 pr-4">
                        {/* 제품명과 아이콘 */}
                        <div className="flex items-center gap-1.5 mb-1">
                          <p className="text-[15px] text-black/70">
                            {item.productName}
                          </p>
                          {/* 리필/일반 상품 아이콘 */}
                          <div
                            className={`w-3 h-3 flex-shrink-0 ${
                              item.isRefill ? "bg-[#E04F4E]" : "bg-[#6cb6e0]"
                            }`}
                          />
                        </div>

                        {/* 용량 x 단가 */}
                        <p className="text-xs text-black/50 mb-1">
                          {item.quantity.toLocaleString()}g x {item.unitPrice.toLocaleString()}원/g
                        </p>

                        {/* 플라스틱 감축 메시지 (리필 상품인 경우 항상 표시) */}
                        {item.isRefill && (
                          <div className="flex items-start gap-1">
                            <span className="text-xs mt-0.5">💡</span>
                            <p className="text-xs text-black/50 leading-relaxed">
                              알맹상점은 지금 해당 상품으로 플라스틱을{" "}
                              {item.plasticReductionG.toLocaleString()}g 줄이고 있어요!
                            </p>
                          </div>
                        )}
                      </div>

                      {/* 가격 (오른쪽 정렬) */}
                      <div className="flex-shrink-0">
                        <p className="text-[15px] text-black/70 whitespace-nowrap">
                          {item.price.toLocaleString()}원
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full py-12 flex items-center justify-center">
            <p className="text-sm text-black/50">아직 구매한 상품이 없어요</p>
          </div>
        )}
      </div>
    </div>
  );
}