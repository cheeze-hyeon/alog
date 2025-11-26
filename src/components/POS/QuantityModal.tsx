"use client";
import { useEffect, useState, useRef } from "react";

export type Unit = "g" | "ea";

export default function QuantityModal({
  open,
  onClose,
  onConfirm,
  unitPrice,
  pricingUnit = "g",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (v: { volume: number; unit: Unit }) => void;
  unitPrice: number;
  pricingUnit?: "g" | "ea";
}) {
  const [vol, setVol] = useState<number>(0);
  const [displayValue, setDisplayValue] = useState<string>("0");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setVol(0);
      setDisplayValue("0");
      // 모달이 열릴 때 입력 필드에 자동 포커스
      setTimeout(() => {
        inputRef.current?.focus();
        // 포커스 시 빈 값으로 표시
        setDisplayValue("");
        inputRef.current?.select();
      }, 100);
    }
  }, [open]);

  // 키보드 이벤트 처리
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
              } else if (e.key === "Enter") {
                if (vol > 0) {
                  onConfirm({ volume: vol, unit: pricingUnit });
                  onClose();
                }
              }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, vol, onConfirm, onClose]);

  if (!open) return null;
  const price = vol * (unitPrice || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">용량 입력</h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 수량 입력 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {pricingUnit === "ea" ? "개수" : "용량"} ({pricingUnit === "ea" ? "개" : "g"})
            </label>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={displayValue}
              onChange={(e) => {
                const value = e.target.value;
                // 빈 값이거나 숫자만 허용
                if (value === "" || /^\d+$/.test(value)) {
                  setDisplayValue(value);
                  const numValue = value === "" ? 0 : Number(value);
                  setVol(numValue);
                }
              }}
              onFocus={(e) => {
                // 포커스 시 값이 "0"이면 빈 문자열로
                if (displayValue === "0") {
                  setDisplayValue("");
                  setVol(0);
                }
                e.target.select();
              }}
              onBlur={(e) => {
                // blur 시 빈 값이면 "0"으로 복원
                if (e.target.value === "") {
                  setDisplayValue("0");
                  setVol(0);
                } else {
                  // 숫자가 아닌 경우 숫자로 변환
                  const numValue = Number(e.target.value) || 0;
                  setDisplayValue(numValue.toString());
                  setVol(numValue);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (vol > 0) {
                    onConfirm({ volume: vol, unit: pricingUnit });
                    onClose();
                  }
                } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                  e.preventDefault();
                }
              }}
              className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-right"
              placeholder={pricingUnit === "ea" ? "개수를 입력하세요" : "용량을 입력하세요"}
            />
            <p className="text-xs text-slate-500 mt-1.5">
              숫자를 직접 입력해주세요
            </p>
          </div>

          {/* 예상 금액 */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">예상 금액</span>
              <span className="text-xl font-semibold text-slate-900">
                {price.toLocaleString()}원
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {unitPrice.toLocaleString()}원/{pricingUnit === "ea" ? "개" : "g"} × {vol.toLocaleString()}{pricingUnit === "ea" ? "개" : "g"}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-6 py-2.5 hover:bg-slate-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => {
              onConfirm({ volume: vol, unit: pricingUnit });
              onClose();
            }}
            disabled={vol <= 0}
            className="rounded-lg bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            담기
          </button>
        </div>
      </div>
    </div>
  );
}
