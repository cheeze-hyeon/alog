"use client";

import { useState, useEffect } from "react";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const [localQuery, setLocalQuery] = useState(searchQuery);

  // 외부에서 searchQuery가 변경되면 로컬 상태도 동기화
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    onSearchChange(value);
  };

  const handleClear = () => {
    setLocalQuery("");
    onSearchChange("");
  };

  return (
    <header className="w-full bg-[#F2F2F7] px-4 md:px-8 py-4 md:py-6">
      <div className="flex items-center gap-4 md:gap-6 lg:gap-8">
        {/* 왼쪽: 로고 + 상점명 + 날짜 */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* 로고 */}
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-red-500 via-blue-500 to-white flex items-center justify-center">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white"></div>
            </div>
          </div>

          {/* 상점명 + 날짜 */}
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold text-black">알맹상점</h1>
            <p className="text-sm md:text-base text-black">{dateStr}</p>
          </div>
        </div>

        {/* 검색창 */}
        <div className="flex-1 md:max-w-[28rem] lg:max-w-[32rem] ml-auto">
          <div className="relative">
            <input
              type="text"
              value={localQuery}
              onChange={handleInputChange}
              placeholder="상품명, 브랜드로 검색"
              className="w-full px-4 py-2.5 md:py-3 pl-10 pr-10 rounded-lg bg-[#E3E3E8] border-0 text-sm md:text-base text-[#e75251] placeholder:text-[#e75251] placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#e75251] focus:border-transparent transition-all"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[#e75251] pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {localQuery && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center text-[#e75251] hover:text-[#d43f3e] transition-colors"
                aria-label="검색어 지우기"
              >
                <svg
                  className="w-full h-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
