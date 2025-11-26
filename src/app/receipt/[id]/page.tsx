import type { Receipt, ReceiptItem } from "@/types/receipt";
import type { Customer } from "@/types/customer";
import { supabaseServerClient } from "@/lib/supabase-client";
import { REFILL_CATEGORY, CATEGORY_LABELS, type ProductCategory } from "@/types/product";
import ReceiptContent from "@/components/receipt/ReceiptContent";

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
    
    return {
      id: item.id,
      product_id: item.product_id ?? null,
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
    <ReceiptContent
      customerName={customerName}
      formattedDate={formattedDate}
      visitDate={visitDate}
      itemsByCategory={itemsByCategory}
      totalAmount={totalAmount}
    />
  );
}
