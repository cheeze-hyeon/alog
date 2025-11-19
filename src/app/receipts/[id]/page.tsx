import type { Receipt } from "@/types/receipt";
import type { Customer } from "@/types/customer";
import { getBaseUrl } from "@/lib/env";

type ReceiptWithItems = Receipt & {
  items: Array<{
    id: number;
    product_id: number | null;
    purchase_quantity_ml: number | null;
    purchase_unit_price_원_per_ml: number | null;
    name?: string;
  }>;
};

async function getReceipt(id: string): Promise<ReceiptWithItems | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/receipts/${id}`, { cache: "no-store" });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      const errorData = await res.json().catch(() => ({}));
      console.error("API error:", errorData);
      return null;
    }
    
    const data = await res.json();
    
    // 응답에 error 필드가 있는 경우
    if (data && typeof data === "object" && "error" in data) {
      console.error("API 응답에 에러 포함:", data.error);
      return null;
    }
    
    // 응답이 null이거나 유효하지 않은 경우
    if (!data || typeof data !== "object") {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return null;
  }
}

async function getCustomer(customerId: number | null): Promise<Customer | null> {
  if (!customerId) return null;
  try {
    const res = await fetch(`${getBaseUrl()}/api/pos/customers?id=${customerId}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function formatCurrency(krw: number) {
  return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(krw);
}

function formatDate(dateString: string | Date | null): string {
  if (!dateString) return "";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
}

function formatDateTime(dateString: string | Date | null): string {
  if (!dateString) return "";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const receipt = await getReceipt(id);

  // 영수증이 없을 경우
  if (!receipt || typeof receipt !== "object" || !("id" in receipt)) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="max-w-[393px] mx-auto bg-white px-5 py-6 flex flex-col gap-6 items-center justify-center min-h-[400px]">
          <p className="text-[15px] text-black/70">영수증을 찾을 수 없습니다.</p>
          <p className="text-[13px] text-black/50">ID: {id}</p>
        </div>
      </main>
    );
  }

  const customer = await getCustomer(receipt.customer_id ?? null);
  const customerName = customer?.name || "고객";

  // TODO: 리필/상품 구분 - 카테고리별로 구분 필요
  // 현재는 모든 아이템을 리필 섹션에 표시
  const refillItems = receipt.items || [];
  const productItems: typeof receipt.items = [];

  return (
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
  <div className="w-[57px] h-[57px] rounded-full bg-[#E04F4E]" />
  <p className="text-[15px] font-semibold">
    {formatDate(receipt.visit_date)} {customerName} 님의 소비 내역이에요!
  </p>
  <p className="text-[13px] text-black/70">{formatDateTime(receipt.visit_date)}</p>
</div>

{/* dashed line */}
<div className="border-b border-dashed border-[#959595]" />

{/* 리필 파트 */}
{refillItems.length > 0 && (
  <>
    <div className="flex justify-between text-[15px] text-black/70">
      <span>리필</span>
      <span>금액</span>
    </div>

    {refillItems.map((item) => {
      const quantity = item.purchase_quantity_ml || 0;
      const unitPrice = item.purchase_unit_price_원_per_ml || 0;
      const total = quantity * unitPrice;
      
      return (
        <div key={item.id} className="flex flex-col gap-1 pt-4">
          <div className="flex justify-between text-[15px]">
            <span>{item.name || "상품명 없음"}</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <p className="text-xs text-black/50">
            {quantity}ml x {formatCurrency(unitPrice)}/ml
          </p>

          <button className="w-full border border-[#959595]/50 rounded-xl py-2 mt-3 text-[#e04f4e] text-[13px]">
            상품 상세 정보 확인
          </button>
        </div>
      );
    })}
  </>
)}

{/* 상품 파트 */}
{productItems.length > 0 && (
  <>
    {refillItems.length > 0 && <div className="border-b border-[#959595]/50" />}
    
    <div className="flex justify-between text-[15px] text-black/70">
      <span>상품</span>
      <span>금액</span>
    </div>

    {productItems.map((item) => {
      const quantity = item.purchase_quantity_ml || 0;
      const unitPrice = item.purchase_unit_price_원_per_ml || 0;
      const total = quantity * unitPrice;
      
      return (
        <div key={item.id} className="flex flex-col gap-1">
          <div className="flex justify-between text-[15px]">
            <span>{item.name || "상품명 없음"}</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <p className="text-xs text-black/50">
            {quantity}개 x {formatCurrency(unitPrice)}/개
          </p>

          <button className="w-full border border-[#959595]/50 rounded-xl py-2 mt-3 text-[#e04f4e] text-[13px]">
            상품 상세 정보 확인
          </button>
        </div>
      );
    })}
  </>
)}

<div>
  <div className="border-b border-[#959595]/50" />

  <div className="flex justify-between text-[15px] font-medium mt-4 mb-4">
    <span>합계</span>
    <span>{formatCurrency(receipt.total_amount || 0)}</span>
  </div>
  <div className="border-b border-[#959595]/50" />
</div>

{/* 최하단 버튼 */}
<button className="w-full bg-[#e04f4e] rounded-2xl py-4 text-center text-white text-[15px] font-semibold mt-6">
  나의 알맹 히스토리 더 보기
</button>
      </div>
    </main>
  );
}
