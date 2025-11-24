import { useState, useEffect, useRef } from "react";
import type { Customer, CharacterProgress } from "@/types";

interface HeaderSectionProps {
  customer: Customer;
  characterProgress: CharacterProgress;
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export default function HeaderSection({ customer, characterProgress, selectedYear, onYearChange }: HeaderSectionProps) {
  const [currentYear, setCurrentYear] = useState(selectedYear);
  
  // selectedYear가 외부에서 변경되면 currentYear도 동기화
  useEffect(() => {
    setCurrentYear(selectedYear);
  }, [selectedYear]);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const levelModalRef = useRef<HTMLDivElement>(null);

  // 년도 리스트 생성 (2015년부터 올해까지)
  const currentYearBase = new Date().getFullYear();
  const startYear = 2015;
  const endYear = currentYearBase;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  // 외부 클릭 시 핸들러 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsYearPickerOpen(false);
      }
      if (levelModalRef.current && !levelModalRef.current.contains(event.target as Node)) {
        setIsLevelModalOpen(false);
      }
    };

    if (isYearPickerOpen || isLevelModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isYearPickerOpen, isLevelModalOpen]);

  // 현재는 전화번호를 표시, 나중에 customer.name으로 변경 예정
  const displayName = customer.name || customer.phone || "고객";

  const {
    currentLevel,
    currentGrade,
    nextLevel,
    nextGrade,
    progressPercentage,
    amountToNextLevel,
    amountToNextGrade,
  } = characterProgress;

  return (
    <div className="w-full bg-white px-4 pt-6 pb-2">
      <div className="max-w-md mx-auto">
        {/* 인사말 */}
        <p className="text-[15px] font-bold text-black/70 mb-4 text-center">
          안녕하세요, {displayName}님!
        </p>

        {/* 캐릭터 이미지 영역 */}
        <div className="flex flex-col items-center mb-4">
          {/* 캐릭터 이미지 (등급별 이미지 사용) */}
          <div className="w-[127px] h-[127px] rounded-full bg-white flex items-center justify-center mb-4 shadow-md overflow-hidden">
            <img
              src={`/grade${currentGrade.grade}.png`}
              alt={currentGrade.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 레벨 버튼 */}
          <button
            onClick={() => setIsLevelModalOpen(true)}
            className="px-4 h-[30px] rounded-[20px] border-[0.5px] border-[#e04f4e] flex items-center justify-center mb-4 cursor-pointer hover:bg-[#e04f4e]/5 transition-colors"
          >
            <p className="text-[13px] text-[#e04f4e] whitespace-nowrap">
              Lv.{currentLevel.level} {currentGrade.name}
            </p>
          </button>

          {/* 진행 바 */}
          <div className="w-full max-w-[361px] mb-8">
            <div className="w-full h-[5px] rounded-[30px] bg-[#d9d9d9] relative">
              <div
                className="h-[5px] rounded-[30px] bg-[#e04f4e] transition-all duration-300"
                style={{ width: `${Math.min(100, progressPercentage)}%` }}
              />
            </div>
          </div>

          {/* 년도 선택 */}
          <div className="relative flex items-center justify-center gap-2">
            <button
              onClick={() => {
                const newYear = currentYear - 1;
                setCurrentYear(newYear);
                onYearChange(newYear);
              }}
              className="w-[9px] h-[11px] flex items-center justify-center"
              aria-label="이전 년도"
            >
              <svg
                width="9"
                height="11"
                viewBox="0 0 9 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 5.19617L9 1.52588e-05V10.3923L0 5.19617Z"
                  fill="black"
                  fillOpacity="0.7"
                />
              </svg>
            </button>
            <button
              onClick={() => setIsYearPickerOpen(!isYearPickerOpen)}
              className="flex items-center gap-1 cursor-pointer"
            >
              <span className="w-[55px] h-[14px] flex items-center justify-center text-[15px] font-medium text-black/70">
                {currentYear}
              </span>
              <span className="text-[15px] font-medium text-black/70">년</span>
            </button>
            <button
              onClick={() => {
                const newYear = currentYear + 1;
                setCurrentYear(newYear);
                onYearChange(newYear);
              }}
              className="w-[9px] h-[11px] flex items-center justify-center"
              aria-label="다음 년도"
            >
              <svg
                width="9"
                height="11"
                viewBox="0 0 9 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 5.19617L0 1.52588e-05V10.3923L9 5.19617Z"
                  fill="black"
                  fillOpacity="0.7"
                />
              </svg>
            </button>

            {/* 년도 선택 핸들러 */}
            {isYearPickerOpen && (
              <div
                ref={pickerRef}
                className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white border border-[#959595]/50 rounded-lg shadow-lg z-10 max-h-[200px] overflow-y-auto"
              >
                <div className="p-2">
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setCurrentYear(year);
                        onYearChange(year);
                        setIsYearPickerOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-center text-[15px] font-medium rounded hover:bg-gray-100 transition-colors ${
                        year === currentYear
                          ? "text-[#e04f4e] bg-[#e04f4e]/10"
                          : "text-black/70"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 레벨/등급 상세 모달 */}
      {isLevelModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div
            ref={levelModalRef}
            className="bg-white rounded-2xl p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto"
          >
            {/* 헤더 */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-black">레벨 정보</h2>
              <button
                onClick={() => setIsLevelModalOpen(false)}
                className="text-black/50 hover:text-black text-xl"
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            {/* 현재 레벨/등급 정보 */}
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-white shadow-md">
                <img
                  src={`/grade${currentGrade.grade}.png`}
                  alt={currentGrade.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xl font-bold text-black mb-1">
                Lv.{currentLevel.level} {currentGrade.name}
              </div>
              <div className="text-sm text-black/50">
                누적 구매 금액: {characterProgress.currentAmount.toLocaleString()}원
              </div>
            </div>

            {/* 진행률 */}
            <div className="mb-6">
              <div className="w-full h-[5px] rounded-[30px] bg-[#d9d9d9] relative mb-2">
                <div
                  className="h-[5px] rounded-[30px] bg-[#e04f4e] transition-all duration-300"
                  style={{ width: `${Math.min(100, progressPercentage)}%` }}
                />
              </div>
              <div className="text-xs text-black/50 text-center">
                레벨 진행률: {progressPercentage.toFixed(1)}%
              </div>
            </div>

            {/* 다음 레벨/등급 정보 */}
            <div className="space-y-3">
              {nextLevel && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-black mb-1">다음 레벨</div>
                  <div className="text-sm text-black/70">
                    Lv.{nextLevel.level}까지 {amountToNextLevel.toLocaleString()}원 남음
                  </div>
                </div>
              )}
              {nextGrade && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-black mb-1">다음 등급</div>
                  <div className="flex items-center gap-2 text-sm text-black/70">
                    <img
                      src={`/grade${nextGrade.grade}.png`}
                      alt={nextGrade.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span>
                      {nextGrade.name}까지 {amountToNextGrade.toLocaleString()}원 남음
                    </span>
                  </div>
                </div>
              )}
              {!nextLevel && !nextGrade && (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-sm font-semibold text-[#e04f4e]">
                    최고 레벨에 도달하셨습니다! 🎉
                  </div>
                </div>
              )}
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => setIsLevelModalOpen(false)}
              className="w-full mt-6 py-3 bg-[#e04f4e] text-white rounded-lg font-medium hover:bg-[#d0403e] transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}