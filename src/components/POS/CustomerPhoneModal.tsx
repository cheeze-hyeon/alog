"use client";
import { useState, useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (phone: string) => void;
  loading?: boolean;
  initialPhone?: string;
};

function normalize(num: string) {
  return num.replace(/\D/g, "").slice(0, 11);
}

function formatPhone(num: string) {
  const s = normalize(num);
  if (s.startsWith("02")) {
    if (s.length > 9) return `${s.slice(0, 2)}-${s.slice(2, 6)}-${s.slice(6, 10)}`;
    if (s.length > 5) return `${s.slice(0, 2)}-${s.slice(2, 6)}-${s.slice(6)}`;
    if (s.length > 2) return `${s.slice(0, 2)}-${s.slice(2)}`;
    return s;
  }
  if (s.length > 7) return `${s.slice(0, 3)}-${s.slice(3, 7)}-${s.slice(7, 11)}`;
  if (s.length > 3) return `${s.slice(0, 3)}-${s.slice(3)}`;
  return s;
}

export default function CustomerPhoneModal({
  open,
  onClose,
  onSave,
  loading = false,
  initialPhone,
}: Props) {
  const [phone, setPhone] = useState(initialPhone || "");
  const [displayValue, setDisplayValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const initial = initialPhone || "";
      setPhone(initial);
      setDisplayValue(formatPhone(initial) || "");
      // 모달이 열릴 때 입력 필드에 자동 포커스
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [open, initialPhone]);

  const digits = normalize(phone).length;
  const canSave = digits >= 10 && !loading;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const normalized = normalize(value);
    setPhone(normalized);
    setDisplayValue(formatPhone(normalized));
  };

  const handleSave = () => {
    if (canSave) {
      onSave(phone);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && canSave) {
      handleSave();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          aria-label="닫기"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* 컨텐츠 영역 */}
        <div className="p-6 space-y-6">
          {/* 제목 */}
          <div className="pt-4">
            <h3 className="text-lg font-semibold text-slate-900">고객 전화번호 입력</h3>
          </div>

          {/* 전화번호 입력 필드 */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                전화번호
              </label>
              <input
                ref={inputRef}
                type="tel"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="010-1234-5678"
                className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-center"
              />
              {digits > 0 && digits < 10 && (
                <p className="text-xs text-slate-500 mt-1.5 text-center">
                  전화번호는 최소 10자리 이상 입력해주세요
                </p>
              )}
            </div>

            {/* 저장하기 버튼 */}
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="w-full py-3 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "저장 중..." : "저장하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
