import type { PurchaseItem } from "@/types";
import { useMemo, useState } from "react";

interface BadgesSectionProps {
  purchaseItems: PurchaseItem[];
}

export default function BadgesSection({ purchaseItems }: BadgesSectionProps) {
  const [clickedItemId, setClickedItemId] = useState<number | null>(null);
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
    <div className="w-full bg-white px-4 pt-2 pb-6">
      <div className="max-w-md mx-auto">
        <p className="text-[20px] font-bold text-left text-black/70 mb-2">
          내가 모은 알맹이들
        </p>
        <p className="text-xs text-black/50 mb-4">구매 내역 확인</p>

        {/* 구매 내역 리스트 */}
        {purchaseItems.length > 0 ? (
          <div className="space-y-0">
            {/* '구매 내역 확인'과 첫 번째 영수증 사이 점선 구분선 */}
            <div className="border-t border-dashed border-[#959595]/30 mb-4" />
            
            {groupedByDate.map(([date, items], groupIndex) => (
              <div key={date}>
                {/* 날짜 구분선 (첫 번째 그룹이 아닌 경우) */}
                {groupIndex > 0 && (
                  <div className="border-t border-dashed border-[#959595]/30 my-4" />
                )}
                
                {/* 날짜 표시 (각 그룹의 첫 번째 항목 위에 표시) */}
                <div className={`mb-3 ${groupIndex === 0 ? "mt-0" : "mt-0"}`}>
                  <p className="text-[18px] font-bold" style={{ color: "#4D4D4D" }}>
                    {date}
                  </p>
                </div>
                {/* 날짜별 그룹 */}
                {items.map((item) => (
                  <div key={item.id}>

                    {/* 구매 항목 */}
                    <div className="py-2">
                      {/* 상단: 제품명, 아이콘, 용량 x 단가, 가격 */}
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0 pr-4">
                          {/* 제품명과 아이콘 */}
                          <div className="flex items-center gap-1.5 mb-1">
                            <p className="text-[15px] font-bold" style={{ color: "#4D4D4D" }}>
                              {item.productName}
                            </p>
                            {/* 리필/일반 상품 아이콘 */}
                            <div className="relative">
                              <button
                                onClick={() => {
                                  setClickedItemId(item.id);
                                  // 2초 후 메시지 숨기기
                                  setTimeout(() => {
                                    setClickedItemId(null);
                                  }, 2000);
                                }}
                                className={`w-3 h-3 flex-shrink-0 rounded cursor-pointer ${
                                  item.isRefill ? "bg-[#E04F4E]" : "bg-[#6cb6e0]"
                                }`}
                                aria-label={item.isRefill ? "리필 상품" : "일반 상품"}
                              />
                              {/* 클릭 시 표시되는 메시지 */}
                              {clickedItemId === item.id && (
                                <div className="absolute left-full ml-1 top-1/2 transform -translate-y-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                                  {item.isRefill ? "이 상품은 리필 상품이에요" : "이 상품은 리필 상품이 아니에요"}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 용량 x 단가 */}
                          <p className="text-xs text-black/50">
                            {item.quantity.toLocaleString()}g x {item.unitPrice.toLocaleString()}원/g
                          </p>
                        </div>

                        {/* 가격 (오른쪽 정렬) */}
                        <div className="flex-shrink-0">
                          <p className="text-[15px] text-black/70 whitespace-nowrap">
                            {item.price.toLocaleString()}원
                          </p>
                        </div>
                      </div>

                      {/* 하단: 플라스틱 감축 메시지 (리필 상품인 경우) */}
                      {item.isRefill && (
                        <div className="flex items-start gap-1">
                          <span className="text-xs mt-0.5">💡</span>
                          <p className="text-xs leading-relaxed" style={{ color: "#E04F4E" }}>
                            알맹상점은 지금 해당 상품으로{" "}
                            <span className="font-bold">
                              플라스틱을 {item.plasticReductionG.toLocaleString()}g
                            </span>{" "}
                            줄이고 있어요!
                          </p>
                        </div>
                      )}
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