"use client";

import type { Customer, CartItem } from "@/types";

type CartRow = CartItem & { id: string };

export default function OrderPanel({
  customer,
  customerPhone,
  cart,
  onRemove,
  subTotal,
  discount = 0,
  onPay,
  onOpenCustomerModal,
  formatPhone,
}: {
  customer: Customer | null;
  customerPhone: string | null;
  cart: CartRow[];
  onRemove: (id: string) => void;
  subTotal: number;
  discount?: number;
  onPay: () => void;
  onOpenCustomerModal?: () => void;
  formatPhone: (phone: string) => string;
}) {
  const formatUnitPrice = (price: number) => {
    return `${Math.round(price)}원/g`;
  };

  return (
    <div className="w-full h-full bg-white shadow-sm flex flex-col">
      {/* 헤더 */}
      <div className="px-6 md:px-8 pt-4 md:pt-6 pb-1">
        <div className="flex justify-between items-center">
          <p className="text-base font-semibold text-black">품목</p>
          <p className="text-base font-semibold text-black mr-1">가격</p>
        </div>
      </div>
      {/* 상단 구분선 */}
      <div className="border-t border-black mx-4 md:mx-6 mt-2"></div>

      {/* 장바구니 아이템들 */}
      <div className="flex-1 px-4 md:px-6 py-4 space-y-4 overflow-y-auto min-h-0">
        {cart.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">
            왼쪽에서 상품을 선택해 담아주세요.
          </p>
        ) : (
          cart.map((row, index) => (
            <div
              key={row.id}
              className="w-full min-h-[88px] p-3 rounded-[10px] bg-[#f2f2f7] relative flex items-center"
            >
              {/* 제품명 + 가격 정보 - 수직 중앙 정렬 */}
              <div className="flex-1 flex flex-col justify-center gap-0.5 min-w-0">
                {/* 제품명 */}
                <p className="text-base md:text-[17px] font-medium text-black pr-8">{row.name}</p>

                {/* 단가(왼쪽) + 무게+가격(오른쪽) */}
                <div className="flex justify-between items-center w-full">
                  {/* 단가 */}
                  <span className="text-sm md:text-[15px] font-medium text-[#e04f4e]">
                    {formatUnitPrice(row.unitPricePerG)}
                  </span>

                  {/* 무게 + 가격 */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm md:text-[15px] font-medium text-[#959595]">
                      {row.volumeG}g
                    </span>
                    <span className="text-base md:text-[17px] font-medium text-black">
                      {Math.round(row.amount).toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>

              {/* 삭제 버튼 - 카드 위로 약간 올림 */}
              <button
                onClick={() => onRemove(row.id)}
                className="absolute right-2 -top-3 w-7 h-7 md:w-[29px] md:h-[29px] flex items-center justify-center z-10"
              >
                <svg
                  width="29"
                  height="29"
                  viewBox="0 0 29 29"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  <circle cx="14.5" cy="14.5" r="10.875" fill="#E04F4E" />
                  <path d="M9.0625 14.5H19.9375" stroke="white" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* 고객 정보 입력 버튼 또는 전화번호 표시 */}
      <div className="px-4 md:px-6 pb-4">
        {customerPhone ? (
          <button
            onClick={onOpenCustomerModal}
            className="flex justify-center items-center w-full gap-2 p-3.5 rounded-lg bg-[#E3E3E8] hover:bg-[#d4d4d9] active:scale-95 transition-all border-0"
          >
            <p className="text-sm md:text-base font-medium text-black/60">
              {formatPhone(customerPhone)}
            </p>
          </button>
        ) : (
          <button
            onClick={onOpenCustomerModal}
            className="flex justify-center items-center w-full gap-2 p-3.5 rounded-lg bg-[#70bce8] text-white hover:bg-[#5aa8d0] transition-colors"
            style={{ boxShadow: "0px 8px 24px 0 rgba(192,230,252,0.5)" }}
          >
            <p className="text-sm font-semibold">고객 정보 입력</p>
          </button>
        )}
      </div>

      {/* 하단 구분선 */}
      <div className="border-t border-black mx-4 md:mx-6"></div>

      {/* 할인 + 총액 */}
      <div className="px-4 md:px-6 py-4 space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-base md:text-lg font-bold text-black">할인</p>
          <p className="text-base md:text-lg font-medium text-black">{discount.toLocaleString()}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-base md:text-lg font-bold text-black">총액</p>
          <p className="text-base md:text-lg font-medium text-black">
            {(subTotal - discount).toLocaleString()}원
          </p>
        </div>
      </div>

      {/* 버튼들 */}
      <div className="px-4 md:px-6 pb-4 md:pb-6">
        {/* 데이터 전송하기 버튼 */}
        <button
          onClick={onPay}
          disabled={cart.length === 0}
          className="flex justify-center items-center w-full gap-2 p-3.5 rounded-lg bg-[#e75251] text-white hover:bg-[#d43f3e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ boxShadow: "0px 8px 24px 0 rgba(234,124,105,0.3)" }}
        >
          <p className="text-sm font-semibold">데이터 전송하기</p>
        </button>
      </div>
    </div>
  );
}
