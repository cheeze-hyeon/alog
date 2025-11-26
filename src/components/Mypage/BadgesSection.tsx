import type { PurchaseItem } from "@/types";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";

interface BadgesSectionProps {
  purchaseItems: PurchaseItem[];
  selectedYear: number;
}

const INITIAL_DISPLAY_COUNT = 5; // 초기에 표시할 항목 수
const LOAD_MORE_COUNT = 5; // 더 불러오기 클릭 시 추가로 표시할 항목 수

export default function BadgesSection({ purchaseItems, selectedYear }: BadgesSectionProps) {
  const [clickedItemId, setClickedItemId] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  
  // 선택된 연도에 해당하는 구매 내역만 필터링
  const filteredItems = useMemo(() => {
    return purchaseItems.filter((item) => {
      // visitDate는 YYYY.MM.DD 형식이므로 연도 추출
      const itemYear = parseInt(item.visitDate.split('.')[0], 10);
      return itemYear === selectedYear;
    });
  }, [purchaseItems, selectedYear]);

  // 연도가 변경되면 displayCount 리셋
  useEffect(() => {
    setDisplayCount(INITIAL_DISPLAY_COUNT);
  }, [selectedYear]);

  // 표시할 항목 수 계산 (날짜별 그룹을 고려)
  const flattenedItems = useMemo(() => {
    return filteredItems;
  }, [filteredItems]);

  const displayedItems = useMemo(() => {
    return flattenedItems.slice(0, displayCount);
  }, [flattenedItems, displayCount]);

  // 표시된 항목들을 다시 날짜별로 그룹화
  const displayedGroupedByDate = useMemo(() => {
    const groups: Record<string, PurchaseItem[]> = {};
    displayedItems.forEach((item) => {
      const dateKey = item.visitDate;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [displayedItems]);

  const hasMore = displayCount < flattenedItems.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + LOAD_MORE_COUNT);
  };

  return (
    <div className="w-full bg-white px-4 pt-1 pb-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[20px] font-bold text-left text-black/70">
            내가 모은 알맹이들
          </p>
          {/* 스탬프 개수 표시 */}
          <div className="relative flex items-center flex-shrink-0 h-[38px]">
            {/* 왼쪽 원형 부분 */}
            <div className="relative w-[38px] h-[38px] flex-shrink-0 z-10">
              <svg
                width="38"
                height="38"
                viewBox="0 0 38 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-[38px] h-[38px]"
              >
                <circle cx="19" cy="19" r="18.5" fill="#EEF9FF" stroke="#747474"></circle>
                <circle cx="19" cy="19" r="15.5" stroke="#747474"></circle>
              </svg>
              {/* 작은 파란색 원의 좌우 중앙에 빨간색과 파란색 아이콘 배치 */}
              {/* 아이콘 그룹을 작은 원의 중심(19px)에 정렬하기 위한 컨테이너 */}
              <div className="absolute left-[19px] -translate-x-1/2 z-20" style={{ top: '8px' }}>
                {/* 빨간 원과 파란 직사각형을 같은 중심선에 정렬 */}
                <div className="relative flex items-center gap-[2px]">
                  {/* 빨간 원 */}
                  <svg
                    width="9"
                    height="9"
                    viewBox="0 0 9 9"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-[9px] h-[9px]"
                  >
                    <circle cx="4.5" cy="4.5" r="4.5" fill="#E04F4E"></circle>
                  </svg>
                  {/* 파란 직사각형 - 빨간 원과 같은 중심선에 정렬, 25도 회전된 다이아몬드 모양, 크기 15% 감소 */}
                  <div className="bg-[#6cb6e0] flex-shrink-0" style={{ transform: 'rotate(25deg)', width: '6.67px', height: '6.67px' }}></div>
                </div>
              </div>
              {/* 스탬프 레이블 - 더 위로 올려서 테두리에 가려지지 않도록 */}
              <p className="absolute left-1/2 -translate-x-1/2 bottom-[8px] text-[7px] text-center lowercase text-black whitespace-nowrap z-10">스탬프</p>
            </div>
            {/* 오른쪽 둥근 직사각형 부분 - 원형과 자연스럽게 연결 */}
            <div className="relative h-[26px] px-3 flex items-center rounded-r-[50px] border border-black/50 border-l-0 bg-white -ml-[2px] self-center">
              <p className="text-[13px] text-black/50 whitespace-nowrap">6개</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-black/50 mb-4">구매 내역 확인</p>

        {/* 구매 내역 리스트 */}
        {filteredItems.length > 0 ? (
          <div className="space-y-0">
            {/* '구매 내역 확인'과 첫 번째 영수증 사이 점선 구분선 */}
            <div className="border-t border-dashed border-[#959595]/30 mb-4" />
            
            {displayedGroupedByDate.map(([date, items], groupIndex) => (
              <div key={date}>
                {/* 날짜 구분선 (첫 번째 그룹이 아닌 경우) */}
                {groupIndex > 0 && (
                  <div className="border-t border-dashed border-[#959595]/30 my-4" />
                )}
                
                {/* 날짜 표시 (각 그룹의 첫 번째 항목 위에 표시) */}
                <div className={`mb-3 ${groupIndex === 0 ? "mt-0" : "mt-0"} flex items-center justify-between`}>
                  <p className="text-[18px] font-bold" style={{ color: "#4D4D4D" }}>
                    {date}
                  </p>
                  <Link
                    href={`/receipt/${items[0].receiptId}`}
                    className="flex items-center justify-center hover:opacity-70 transition-opacity"
                    aria-label="영수증 보기"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                    >
                      <path
                        d="M6 12L10 8L6 4"
                        stroke="#4D4D4D"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
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
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* 더 불러오기 버튼 */}
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-2 rounded-lg border border-[#959595]/50 text-sm text-black/70 hover:bg-gray-50 transition-colors"
                >
                  더 불러오기
                </button>
              </div>
            )}
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