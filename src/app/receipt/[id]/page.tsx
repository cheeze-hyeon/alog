import type { Receipt, ReceiptItem } from "@/types/receipt";
import type { Customer } from "@/types/customer";
import { supabaseServerClient } from "@/lib/supabase-client";
import { REFILL_CATEGORY, CATEGORY_LABELS, type ProductCategory } from "@/types/product";

type ReceiptWithItems = Receipt & {
  items: Array<ReceiptItem & {
    name?: string | null;
    category?: string | null;
  }>;
};

async function getReceipt(id: string): Promise<ReceiptWithItems | null> {
  try {
    const receiptId = parseInt(id, 10);
    if (isNaN(receiptId)) {
      return null;
    }

    // Receipt 조회
    const { data: receipt, error: receiptError } = await supabaseServerClient
      .from("receipt")
      .select("*")
      .eq("id", receiptId)
      .single();

    if (receiptError || !receipt) {
      console.error("Supabase error (receipt):", receiptError);
      return null;
    }

    // ReceiptItem 조회
    const { data: items, error: itemsError } = await supabaseServerClient
      .from("receipt_item")
      .select("*")
      .eq("receipt_id", receiptId);

    if (itemsError) {
      console.error("Supabase error (receipt_item):", itemsError);
      return null;
    }

    // product_id가 있는 경우 product 정보를 별도로 조회
    const itemsWithProduct = await Promise.all(
      (items || []).map(async (item: any) => {
        let productName = null;
        let productCategory = null;
        
        if (item.product_id) {
          const { data: product, error: productError } = await supabaseServerClient
            .from("product")
            .select("id, name, category")
            .eq("id", item.product_id)
            .maybeSingle();

          if (!productError && product) {
            productName = product.name;
            productCategory = product.category;
          }
        }

        return {
          ...item,
          name: productName,
          category: productCategory,
        };
      })
    );

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
      console.error("Supabase error (customer):", error);
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
  
  const receipt = await getReceipt(id);
  if (!receipt) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="max-w-[393px] mx-auto bg-white px-5 py-6">
          <p className="text-center text-black/70">영수증을 찾을 수 없습니다.</p>
        </div>
      </main>
    );
  }

  const customer = await getCustomer(receipt.customer_id ?? null);
  const customerName = customer?.name || "고객";
  
  const visitDate = receipt.visit_date ? formatDateTime(receipt.visit_date) : "";
  const formattedDate = receipt.visit_date ? formatDate(receipt.visit_date) : "";
  
  // 아이템 데이터 변환 및 카테고리별 그룹화
  const allItems = (receipt.items || []).map((item: any) => {
    // 실제 컬럼명 또는 별칭 모두 처리
    const quantity = item.purchase_quantity ?? item["purchase_quantity"] ?? 0;
    const unitPrice = item.purchase_unit_price ?? item["purchase_unit_price"] ?? 0;
    const total = quantity * unitPrice;
    
    // 카테고리 정보 처리
    const categoryKey = item.category as ProductCategory | null;
    const categoryLabel = categoryKey && CATEGORY_LABELS[categoryKey] 
      ? CATEGORY_LABELS[categoryKey] 
      : "기타";
    
    // REFILL_CATEGORY에 속하는지 확인
    const isRefill = categoryKey !== null && REFILL_CATEGORY[categoryKey] !== undefined;
    console.log(isRefill);
    
    return {
      id: item.id,
      name: item.name || "제품명 없음",
      category: isRefill ? "리필" : "상품",
      categoryKey: categoryKey,
      isRefill,
      purchase_quantity: quantity,
      purchase_unit_price: unitPrice,
      total,
    };
  });


  const itemsByCategory = allItems.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof allItems>);

  const totalAmount = receipt.total_amount ?? 0;

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
                    {item.isRefill
                      ? `${item.purchase_quantity}g x ${formatCurrency(item.purchase_unit_price)}/g`
                      : `${item.purchase_quantity}개 x ${formatCurrency(item.purchase_unit_price)}/개`}
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
