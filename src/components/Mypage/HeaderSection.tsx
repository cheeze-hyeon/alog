import { useState } from "react";
import type { Customer, CharacterProgress } from "@/types";

interface HeaderSectionProps {
  customer: Customer;
  characterProgress: CharacterProgress;
}

export default function HeaderSection({ customer, characterProgress }: HeaderSectionProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // 현재는 전화번호를 표시, 나중에 customer.name으로 변경 예정
  const displayName = customer.name || customer.phone || "고객";

  const { currentLevel, progressPercentage } = characterProgress;

  return (
    <div className="w-full bg-white px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* 인사말 */}
        <p className="text-[15px] font-bold text-black/70 mb-4 text-center">
          안녕하세요, {displayName}님!
        </p>

        {/* 캐릭터 이미지 영역 */}
        <div className="flex flex-col items-center mb-4">
          {/* 캐릭터 이미지 (임시로 이모지 사용, 추후 실제 이미지로 교체 가능) */}
          <div className="w-[127px] h-[127px] rounded-full bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center mb-4 shadow-md">
            <div className="text-6xl">🌱</div>
          </div>

          {/* 레벨 버튼 */}
          <div className="w-20 h-[30px] rounded-[20px] border-[0.5px] border-[#e04f4e] flex items-center justify-center mb-4">
            <p className="text-[13px] text-[#e04f4e]">Lv.{currentLevel.level} {currentLevel.name}</p>
          </div>

          {/* 진행 바 */}
          <div className="w-full max-w-[361px] mb-2">
            <div className="w-full h-[5px] rounded-[30px] bg-[#d9d9d9] relative">
              <div
                className="h-[5px] rounded-[30px] bg-[#e04f4e] transition-all duration-300"
                style={{ width: `${Math.min(100, progressPercentage)}%` }}
              />
            </div>
          </div>

          {/* 년도 선택 */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setCurrentYear(currentYear - 1)}
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
                  d="M9 5.19617L0 1.52588e-05V10.3923L9 5.19617Z"
                  fill="black"
                  fillOpacity="0.7"
                />
              </svg>
            </button>
            <p className="w-[55px] h-3.5 text-[15px] font-medium text-black/70 text-center">
              {currentYear}년
            </p>
            <button
              onClick={() => setCurrentYear(currentYear + 1)}
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
                  d="M0 5.19617L9 1.52588e-05V10.3923L0 5.19617Z"
                  fill="black"
                  fillOpacity="0.7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}