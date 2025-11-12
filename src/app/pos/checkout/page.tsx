"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product, ProductCategory, Customer, CartItem } from "@/types";
import SidebarDummy from "@/components/POS/SidebarDummy";
import CatalogPanel from "@/components/POS/CatalogPanel";
import OrderPanel from "@/components/POS/OrderPanel";
import QuantityModal, { Unit } from "@/components/POS/QuantityModal";

type CartRow = CartItem & { id: string };

function CheckoutContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const customerId = sp.get("customerId");

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCat, setActiveCat] = useState<ProductCategory>("shampoo");

  // 장바구니
  const [cart, setCart] = useState<CartRow[]>([]);
  const subTotal = useMemo(() => cart.reduce((s, i) => s + i.amount, 0), [cart]);
  const discount = 0;

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<Product | null>(null);

  // 🔸 고객 + 상품 불러오기
  useEffect(() => {
    (async () => {
      try {
        const promises = [fetch(`/api/pos/products`).then((r) => r.json())];

        // customerId가 있을 때만 고객 정보 조회
        if (customerId) {
          promises.push(
            fetch(`/api/pos/customers?id=${customerId}`).then((r) => (r.ok ? r.json() : null)),
          );
        }

        const results = await Promise.all(promises);
        setProducts(results[0]);

        // customerId가 있으면 고객 정보 설정
        if (customerId && results[1]) {
          setCustomer(results[1]);
        }
      } catch {
        /* noop */
      }
    })();
  }, [customerId]);

  // 🔸 상품 선택 시 모달 오픈
  const pickProduct = (p: Product) => {
    setModalTarget(p);
    setModalOpen(true);
  };

  // 🔸 장바구니 추가
  const addToCart = ({ volume, unit }: { volume: number; unit: Unit }) => {
    if (!modalTarget) return;
    const volMl = volume; // g/ml 동일 단가 가정
    // current_price는 전체 가격이므로, ml당 단가를 계산 (임시로 1000ml 기준)
    // 실제로는 데이터베이스에 ml당 단가를 저장하거나 별도 계산 로직 필요
    const unitPricePerMl = modalTarget.current_price ? modalTarget.current_price / 1000 : 0;
    const amount = volMl * unitPricePerMl;
    const row: CartRow = {
      id: `${modalTarget.id}_${Date.now()}`,
      productId: String(modalTarget.id),
      name: modalTarget.name || "상품명 없음",
      volumeMl: volMl,
      unitPricePerMl,
      amount,
    };
    setCart((prev) => [...prev, row]);
  };

  // 🔸 장바구니 아이템 제거
  const removeRow = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));

  // 🔸 고객 전화번호 입력 페이지로 이동 (결제 대체)
  const goToPhoneInput = () => {
    if (cart.length === 0) return alert("장바구니가 비어 있습니다.");
    // 장바구니 데이터를 localStorage에 저장
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("total", String(subTotal - discount));

    // 고객 전화번호 입력 페이지로 이동
    router.push(`/pos/customer`);
  };

  // 🔸 localStorage에 장바구니 자동 저장 (새로고침 대비)
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-[1200px] xl:max-w-[1400px] p-4">
        <div className="grid grid-cols-12 gap-4">
          {/* 좌측 더미 사이드바 */}
          <SidebarDummy />

          {/* 중앙 상품 카탈로그 */}
          <CatalogPanel
            products={products}
            activeCat={activeCat}
            onChangeCat={setActiveCat}
            onPick={pickProduct}
          />

          {/* 우측 주문 패널 */}
          <OrderPanel
            customer={customer}
            cart={cart}
            onRemove={removeRow}
            subTotal={subTotal}
            discount={discount}
            onPay={goToPhoneInput} // ✅ 결제 대신 고객입력 페이지 이동
          />
        </div>
      </div>

      {/* 용량 입력 모달 */}
      <QuantityModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalTarget(null);
        }}
        onConfirm={addToCart}
        defaultUnit="g"
        unitPrice={modalTarget?.current_price ? modalTarget.current_price / 1000 : 0}
      />
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-600">로딩 중...</div>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
