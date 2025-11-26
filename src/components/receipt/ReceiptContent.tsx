"use client";

import { useState } from "react";
import ProductDetailModal from "@/components/ProductDetailModal";
import { useRouter } from "next/navigation";

type ReceiptItem = {
  id: number;
  product_id: number | null;
  name: string;
  category: string;
  categoryKey: string | null;
  isRefill: boolean;
  purchase_quantity: number;
  purchase_unit_price: number;
  total: number;
};

type Props = {
  customerName: string;
  formattedDate: string;
  visitDate: string;
  itemsByCategory: Record<string, ReceiptItem[]>;
  totalAmount: number;
};

function formatCurrency(krw: number) {
  return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(krw);
}

export default function ReceiptContent({
  customerName,
  formattedDate,
  visitDate,
  itemsByCategory,
  totalAmount,
}: Props) {
  const router = useRouter();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (productId: number | null) => {
    if (productId) {
      setSelectedProductId(productId);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
  };

  return (
    <>
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="max-w-[393px] mx-auto bg-white px-5 py-6 flex flex-col gap-6">
          {/* 상단 헤더 */}
          <div className="flex justify-end">
            <button className="text-[13px] text-black/50 border border-black/30 rounded-lg px-3 py-1">
              영수증 이미지로 저장
            </button>
          </div>

          {/* 빨간 원 + 날짜 */}
          <div className="flex flex-col items-center gap-3 mt-4">
            <div className="flex items-center gap-2">
              {/* 빨간 원 (파란색 테두리) */}
              <svg
                width={57}
                height={57}
                viewBox="0 0 57 57"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="28.5" cy="28.5" r="28.5" fill="#E04F4E" />
              </svg>
              {/* 하늘색 정사각형 (회전) */}
              <div className="w-[53px] h-[53px] bg-[#6cb6e0] -rotate-12" />
            </div>
            <p className="text-[15px] font-semibold text-center">
              {formattedDate} {customerName} 님의 소비 내역이에요!
            </p>
            <p className="text-[13px] text-black/70 text-center">{visitDate}</p>
          </div>

          {/* dashed line */}
          <div className="border-b border-dashed border-[#959595]" />

          {/* 카테고리별 아이템 렌더링 */}
          {Object.entries(itemsByCategory).map(([category, items], categoryIndex) => (
            <div key={category}>
              {/* 카테고리 헤더 */}
              <div className="flex justify-between text-[15px] text-black/70">
                <span>{category}</span>
                <span>금액</span>
              </div>

              {/* 카테고리별 아이템들 */}
              {items.map((item, itemIndex) => (
                <div key={item.id} className="mb-4">
                  <div className={`flex flex-col gap-1 ${itemIndex === 0 ? "pt-4" : ""}`}>
                    <div className="flex justify-between text-[15px]">
                      <span>{item.name}</span>
                      <span>{formatCurrency(item.total)}</span>
                    </div>
                    <p className="text-xs text-black/50">
                      {item.isRefill
                        ? `${item.purchase_quantity}g x ${formatCurrency(item.purchase_unit_price)}/g`
                        : `${item.purchase_quantity}개 x ${formatCurrency(item.purchase_unit_price)}/개`}
                    </p>
                    <button
                      onClick={() => handleOpenModal(item.product_id)}
                      className="w-full border border-[#959595]/50 rounded-xl py-2 mt-3 text-[#e04f4e] text-[13px] hover:bg-[#e04f4e]/5 transition-colors"
                    >
                      상품 상세 정보 확인
                    </button>
                  </div>
                </div>
              ))}

              {/* 카테고리 간 구분선 (마지막 카테고리가 아닐 경우) */}
              {categoryIndex < Object.keys(itemsByCategory).length - 1 && (
                <div className="border-b border-[#959595]/50 mb-4 mt-8" />
              )}
            </div>
          ))}
          {/* 합계 */}
          <div>
            <div className="border-b border-[#959595]/50 " />
            <div className="flex justify-between text-[15px] font-medium mt-4">
              <span>합계</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <div className="border-b border-[#959595]/50 my-4" />
          </div>
        </div>

        {/* Floating 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 z-50 pb-4 px-6">
          <div className="max-w-[393px] mx-auto">
            <button className="w-full bg-[#e04f4e] rounded-2xl py-4 text-center text-white text-[15px] font-semibold "
            onClick={() => router.push(`/mypage?phone=01012345678`)}
            >
              나의 알맹 히스토리 더 보기
            </button>
          </div>
        </div>
      </main>

      {/* 상품 상세 모달 */}
      <ProductDetailModal
        open={isModalOpen}
        onClose={handleCloseModal}
        productId={selectedProductId}
      />
    </>
  );
}

