import type { Receipt } from "@/types/receipt";
import type { Customer } from "@/types/customer";
import { supabaseServerClient } from "@/lib/supabase-client";

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
    const receiptId = parseInt(id, 10);
    if (isNaN(receiptId)) {
      console.error("Invalid receipt ID:", id);
      return null;
    }

    // Receipt 조회
    const { data: receipt, error: receiptError } = await supabaseServerClient
      .from("receipt")
      .select("*")
      .eq("id", receiptId)
      .single();

    if (receiptError) {
      console.error("Supabase error (receipt):", {
        message: receiptError.message,
        details: receiptError.details,
        hint: receiptError.hint,
        code: receiptError.code,
        fullError: JSON.stringify(receiptError, null, 2),
      });
      return null;
    }

    if (!receipt) {
      console.error("Receipt not found for ID:", receiptId);
      return null;
    }

    // ReceiptItem 조회 (product 정보 포함)
    const { data: items, error: itemsError } = await supabaseServerClient
      .from("receipt_item")
      .select(
        `
        *,
        product:product_id (
          id,
          name
        )
      `,
      )
      .eq("receipt_id", receiptId);

    if (itemsError) {
      console.error("Supabase error (receipt_item):", {
        message: itemsError.message,
        details: itemsError.details,
        hint: itemsError.hint,
        code: itemsError.code,
        fullError: JSON.stringify(itemsError, null, 2),
      });
      return null;
    }

    // product 정보를 각 item에 추가
    const itemsWithProduct = (items || []).map((item: any) => ({
      ...item,
      name: item.product?.name || null,
    }));

    return {
      ...(receipt as Receipt),
      items: itemsWithProduct,
    };
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return null;
  }
}

async function getCustomer(customerId: number | null): Promise<Customer | null> {
  if (!customerId) return null;
  try {
    const { data, error } = await supabaseServerClient
      .from("customer")
      .select("*")
      .eq("id", customerId)
      .single();

    if (error) {
      console.error("Supabase error (customer):", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: JSON.stringify(error, null, 2),
      });
      return null;
    }

    if (!data) {
      console.error("Customer not found for ID:", customerId);
      return null;
    }

    return data as Customer;
  } catch (error) {
    console.error("Error fetching customer:", error);
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
  
  // TODO: API가 작동하면 아래 주석을 해제하고 더미 데이터 부분을 제거하세요
  // const receipt = await getReceipt(id);
  // const customer = await getCustomer(receipt.customer_id ?? null);
  // const customerName = customer?.name || "고객";
  // 
  // // 카테고리별로 그룹화 (product의 category 필드 사용)
  // const allItems = receipt.items.map(item => ({
  //   ...item,
  //   category: item.category || "기타", // product의 category 필드 사용
  // }));
  // const itemsByCategory = allItems.reduce((acc, item) => {
  //   const category = item.category || "기타";
  //   if (!acc[category]) {
  //     acc[category] = [];
  //   }
  //   acc[category].push(item);
  //   return acc;
  // }, {} as Record<string, typeof allItems>);

  // 더미 데이터
  const customerName = "다운";
  const visitDate = "2025-11-01 15:07:21";
  const formattedDate = "11월 1일";
  
  // 더미 아이템 데이터 (카테고리 포함)
  const allItems = [
    {
      id: 1,
      name: "아꾸아 트리플 베리어 선크림",
      category: "리필",
      purchase_quantity_ml: 200,
      purchase_unit_price_원_per_ml: 100,
      total: 20000,
    },
    {
      id: 2,
      name: "남오일로 벌레퇴치",
      category: "리필",
      purchase_quantity_ml: 50,
      purchase_unit_price_원_per_ml: 60,
      total: 3000,
    },
    {
      id: 3,
      name: "자연한알 오리지널(해물) 코인육수",
      category: "상품",
      purchase_quantity_ml: 1,
      purchase_unit_price_원_per_ml: 350,
      total: 1750,
    },
  ];

  // 카테고리별로 그룹화
  const itemsByCategory = allItems.reduce((acc, item) => {
    const category = item.category || "기타";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof allItems>);

  const totalAmount = 24750;

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
            {formattedDate} {customerName} 님의 소비 내역이에요!
          </p>
          <p className="text-[13px] text-black/70">{visitDate}</p>
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
                    {category === "리필" 
                      ? `${item.purchase_quantity_ml}ml x ${formatCurrency(item.purchase_unit_price_원_per_ml)}/ml`
                      : `${item.purchase_quantity_ml}개 x ${formatCurrency(item.purchase_unit_price_원_per_ml)}/개`}
                  </p>
                  <button className="w-full border border-[#959595]/50 rounded-xl py-2 mt-3 text-[#e04f4e] text-[13px]">
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
          <button className="w-full bg-[#e04f4e] rounded-2xl py-4 text-center text-white text-[15px] font-semibold ">
            나의 알맹 히스토리 더 보기
          </button>
        </div>
      </div>
    </main>
  );
}
