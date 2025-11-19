"use client";

type Props = {
  open: boolean;
  onConfirm: () => void;
  loading?: boolean;
};

export default function DataSentSuccessModal({ open, onConfirm, loading = false }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="relative w-full max-w-md rounded-[25px] bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 메시지 텍스트 */}
        <div className="px-6 md:px-10 pt-12 md:pt-16 pb-8 md:pb-10">
          <p className="text-xl md:text-2xl font-bold text-center text-black">
            상품이 고객 정보에 저장되었습니다!
          </p>
        </div>

        {/* 확인 버튼 */}
        <div className="px-4 md:px-6 pb-6 md:pb-8">
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex justify-center items-center w-full gap-2 px-4 md:px-6 py-3 md:py-3.5 rounded-[13px] bg-[#e75251] hover:bg-[#d43f3e] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <p className="text-sm md:text-base font-bold text-center text-white">
              {loading ? "전송 중..." : "확인"}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

