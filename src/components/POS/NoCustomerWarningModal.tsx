"use client";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function NoCustomerWarningModal({ open, onClose, onConfirm }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[387px] rounded-[25px] bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 메시지 텍스트 */}
        <div className="px-10 md:px-12 pt-12 md:pt-14 pb-24 md:pb-28">
          <p className="text-lg md:text-xl lg:text-[25px] font-medium text-center text-black leading-tight">
            고객 정보 없이 결제 내역을 전송할까요?
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 px-4 md:px-5 flex gap-3 md:gap-4 justify-between items-center">
          {/* 아니요 버튼 */}
          <button
            type="button"
            onClick={onClose}
            className="flex justify-center items-center flex-1 max-w-[172px] gap-2 px-4 md:px-6 py-3 md:py-3.5 rounded-[13px] bg-[#ccc] hover:bg-[#bbb] active:scale-95 transition-all"
          >
            <p className="text-sm md:text-base font-bold text-center text-neutral-50">아니요</p>
          </button>

          {/* 예 버튼 */}
          <button
            type="button"
            onClick={onConfirm}
            className="flex justify-center items-center flex-1 max-w-[172px] gap-2 px-4 md:px-6 py-3 md:py-3.5 rounded-[13px] bg-[#e75251] hover:bg-[#d43f3e] active:scale-95 transition-all"
          >
            <p className="text-sm md:text-base font-bold text-center text-neutral-50">예</p>
          </button>
        </div>
      </div>
    </div>
  );
}

