"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product, ProductCategory, Customer, CartItem } from "@/types";
import CatalogPanel from "@/components/POS/CatalogPanel";
import OrderPanel from "@/components/POS/OrderPanel";
import QuantityModal, { Unit } from "@/components/POS/QuantityModal";
import CustomerPhoneModal from "@/components/POS/CustomerPhoneModal";
import NoCustomerWarningModal from "@/components/POS/NoCustomerWarningModal";
import DataSentSuccessModal from "@/components/POS/DataSentSuccessModal";
import Header from "@/components/POS/Header";

type CartRow = CartItem & { id: string };

function CheckoutContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const customerId = sp.get("customerId");

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCat, setActiveCat] = useState<ProductCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 장바구니
  const [cart, setCart] = useState<CartRow[]>([]);
  const subTotal = useMemo(() => cart.reduce((s, i) => s + i.amount, 0), [cart]);
  const discount = 0;

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<Product | null>(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerModalLoading, setCustomerModalLoading] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [isSendingData, setIsSendingData] = useState(false);

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

  // 🔸 localStorage에서 전화번호 불러오기 (새로고침 대비)
  useEffect(() => {
    try {
      const storedPhone = localStorage.getItem("customerPhone");
      if (storedPhone) {
        setCustomerPhone(storedPhone);
      }
    } catch {
      /* noop */
    }
  }, []);

  // 🔸 상품 선택 시 모달 오픈
  const pickProduct = (p: Product) => {
    setModalTarget(p);
    setModalOpen(true);
  };

  // 🔸 장바구니 추가
  const addToCart = ({ volume, unit }: { volume: number; unit: Unit }) => {
    if (!modalTarget) return;
    const volG = volume; // g 단위
    // current_price는 g당 단가
    const unitPricePerG = modalTarget.current_price || 0;
    const amount = volG * unitPricePerG;
    const row: CartRow = {
      id: `${modalTarget.id}_${Date.now()}`,
      productId: String(modalTarget.id),
      name: modalTarget.name || "상품명 없음",
      volumeG: volG,
      unitPricePerG,
      amount,
    };
    setCart((prev) => [...prev, row]);
  };

  // 🔸 장바구니 아이템 제거
  const removeRow = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));

  // 🔸 고객 전화번호 입력 페이지로 이동 (결제 대체)
  const goToPhoneInput = () => {
    if (cart.length === 0) return alert("장바구니가 비어 있습니다.");

    // 고객 정보(customer) 또는 전화번호(customerPhone)가 없으면 경고 모달 표시
    if (!customer && !customerPhone) {
      setWarningModalOpen(true);
      return;
    }

    // 고객 정보 또는 전화번호가 있으면 바로 진행
    proceedWithPayment();
  };

  // 🔸 결제 진행 (고객 정보 있음 또는 경고 모달에서 확인)
  const proceedWithPayment = () => {
    // 성공 모달 표시 (데이터 전송 전 확인)
    setSuccessModalOpen(true);
  };

  // 🔸 실제 데이터 전송 처리 (성공 모달 확인 버튼 클릭 시)
  const handleSendData = async () => {
    if (cart.length === 0) {
      alert("장바구니가 비어 있습니다.");
      return;
    }

    setIsSendingData(true);
    try {
      let customerIdToUse: string | number | null = null;

      // 1. customer가 있으면 customer.id 사용
      if (customer?.id) {
        customerIdToUse = customer.id;
      } else if (customerPhone) {
        // 2. customerPhone만 있으면 전화번호로 기존 고객 조회 또는 신규 등록
        try {
          // 전화번호로 기존 고객 조회 시도
          const searchResponse = await fetch(
            `/api/pos/customers?phone=${encodeURIComponent(customerPhone)}`,
            {
              method: "GET",
            },
          );

          if (searchResponse.ok) {
            // 기존 고객이 있으면 사용
            const existingCustomer = await searchResponse.json();
            customerIdToUse = existingCustomer.id;
          } else if (searchResponse.status === 404) {
            // 고객이 없으면 신규 고객 등록
            const customerCreateBody = {
              name: null, // 이름 없이 전화번호만으로 등록
              phone: customerPhone,
            };

            // 📋 전송할 고객 생성 데이터 로깅 (프론트엔드)
            console.log("=== 프론트엔드에서 서버로 전송하는 고객 생성 데이터 ===");
            console.log("전송 시간:", new Date().toISOString());
            console.log("전송 데이터:", JSON.stringify(customerCreateBody, null, 2));
            console.log("==================================================");

            const createResponse = await fetch("/api/pos/customers", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(customerCreateBody),
            });

            if (createResponse.ok) {
              const newCustomer = await createResponse.json();
              customerIdToUse = newCustomer.id;
            } else {
              const errorData = await createResponse.json();
              console.error("고객 등록 API 오류:", errorData);
              throw new Error(errorData.error || "고객 등록 실패");
            }
          } else {
            // 다른 오류
            const error = await searchResponse.json();
            throw new Error(error.error || "고객 조회 실패");
          }
        } catch (error: any) {
          console.error("고객 처리 실패:", error);
          alert(error.message || "고객 처리에 실패했습니다. 다시 시도해주세요.");
          setIsSendingData(false);
          setSuccessModalOpen(false);
          return;
        }
      }

      if (!customerIdToUse) {
        alert("고객 정보를 찾을 수 없습니다.");
        setIsSendingData(false);
        return;
      }

      // 3. 결제 데이터 전송
      const paymentBody = {
        customerId: customerIdToUse,
        items: cart,
        totalAmount: subTotal - discount,
      };

      // 📋 전송할 결제 데이터 로깅 (프론트엔드)
      console.log("=== 프론트엔드에서 서버로 전송하는 결제 데이터 ===");
      console.log("전송 시간:", new Date().toISOString());
      console.log("전송 데이터:", JSON.stringify(paymentBody, null, 2));
      console.log(
        "상품 상세:",
        cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          volumeG: item.volumeG,
          unitPricePerG: item.unitPricePerG,
          amount: item.amount,
        })),
      );
      console.log("================================================");

      const response = await fetch("/api/pos/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("=== 결제 API 오류 ===");
        console.error("상태 코드:", response.status);
        console.error("오류 데이터:", JSON.stringify(errorData, null, 2));
        console.error("오류 코드:", errorData.code);
        console.error("오류 메시지:", errorData.error);
        console.error("오류 상세:", errorData.details);
        console.error("오류 힌트:", errorData.hint);
        console.error("====================");

        // 실제 오류 메시지 사용 (더 자세한 정보 포함)
        const errorMessage = errorData.error || errorData.message || "데이터 전송 실패";
        throw new Error(errorMessage);
      }

      // 4. 성공 시 상태 초기화
      setCart([]);
      setCustomerPhone(null);
      setCustomer(null);
      localStorage.removeItem("cart");
      localStorage.removeItem("total");
      localStorage.removeItem("customerPhone");

      // 5. 모달 닫기
      setSuccessModalOpen(false);
    } catch (error: any) {
      console.error("데이터 전송 오류:", error);
      alert(error.message || "데이터 전송 중 오류가 발생했습니다.");
    } finally {
      setIsSendingData(false);
    }
  };

  // 🔸 localStorage에 장바구니 자동 저장 (새로고침 대비)
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // 🔸 전화번호 포맷 함수
  const formatPhone = (num: string) => {
    const normalized = num.replace(/\D/g, "").slice(0, 11);
    if (normalized.startsWith("02")) {
      if (normalized.length > 9)
        return `${normalized.slice(0, 2)}-${normalized.slice(2, 6)}-${normalized.slice(6, 10)}`;
      if (normalized.length > 5)
        return `${normalized.slice(0, 2)}-${normalized.slice(2, 6)}-${normalized.slice(6)}`;
      if (normalized.length > 2) return `${normalized.slice(0, 2)}-${normalized.slice(2)}`;
      return normalized;
    }
    if (normalized.length > 7)
      return `${normalized.slice(0, 3)}-${normalized.slice(3, 7)}-${normalized.slice(7, 11)}`;
    if (normalized.length > 3) return `${normalized.slice(0, 3)}-${normalized.slice(3)}`;
    return normalized;
  };

  // 🔸 고객 전화번호 저장 처리
  const handleCustomerPhoneSave = async (phone: string) => {
    if (phone.length < 10) {
      alert("전화번호 10~11자리를 입력해 주세요.");
      return;
    }

    setCustomerModalLoading(true);
    try {
      // 전화번호 상태에 저장
      setCustomerPhone(phone);

      // localStorage에도 저장 (새로고침 대비)
      localStorage.setItem("customerPhone", phone);

      // 전화번호로 고객 정보 조회 시도
      try {
        const response = await fetch(`/api/pos/customers?phone=${encodeURIComponent(phone)}`);
        if (response.ok) {
          const customerData = await response.json();
          setCustomer(customerData);
        }
        // 고객이 없어도 (404) 문제 없음 - 나중에 등록됨
      } catch (error) {
        // 고객 정보 조회 실패해도 전화번호는 저장
        console.error("고객 정보 조회 실패:", error);
      }

      // 모달 닫기
      setCustomerModalOpen(false);
    } catch (error) {
      alert("오류가 발생했습니다.");
    } finally {
      setCustomerModalLoading(false);
    }
  };

  return (
    <main className="h-screen bg-[#F2F2F7] flex flex-col lg:flex-row overflow-hidden">
      {/* 왼쪽 영역: Header + CatalogPanel */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* 헤더 */}
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        {/* 상품 카탈로그 */}
        <div className="flex-1 min-w-0 overflow-y-auto px-4 md:px-6 lg:px-8 pt-2 md:pt-4 pb-4 md:pb-6 lg:pb-8">
          <CatalogPanel
            products={products}
            activeCat={activeCat}
            onChangeCat={setActiveCat}
            onPick={pickProduct}
            searchQuery={searchQuery}
          />
        </div>
      </div>

      {/* 우측 주문 패널 - 오른쪽 전체 column */}
      <div className="w-full lg:w-[400px] xl:w-[450px] flex-shrink-0 flex flex-col min-h-0">
        <OrderPanel
          customer={customer}
          customerPhone={customerPhone}
          cart={cart}
          onRemove={removeRow}
          subTotal={subTotal}
          discount={discount}
          onPay={goToPhoneInput} // ✅ 결제 대신 고객입력 페이지 이동
          onOpenCustomerModal={() => setCustomerModalOpen(true)}
          formatPhone={formatPhone}
        />
      </div>

      {/* 용량 입력 모달 */}
      <QuantityModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalTarget(null);
        }}
        onConfirm={addToCart}
        unitPrice={modalTarget?.current_price || 0}
      />

      {/* 고객 전화번호 입력 모달 */}
      <CustomerPhoneModal
        open={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onSave={handleCustomerPhoneSave}
        loading={customerModalLoading}
        initialPhone={customerPhone || undefined}
      />

      {/* 고객 정보 없음 경고 모달 */}
      <NoCustomerWarningModal
        open={warningModalOpen}
        onClose={() => setWarningModalOpen(false)}
        onConfirm={() => {
          setWarningModalOpen(false);
          proceedWithPayment();
        }}
      />

      {/* 데이터 전송 성공 모달 */}
      <DataSentSuccessModal
        open={successModalOpen}
        onConfirm={handleSendData}
        loading={isSendingData}
      />
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-100 flex items-center justify-center">
          <div className="text-slate-600">로딩 중...</div>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
