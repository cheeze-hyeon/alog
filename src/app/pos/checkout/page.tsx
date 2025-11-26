"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product, ProductCategory, Customer, CartItem } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import CatalogPanel from "@/components/POS/CatalogPanel";
import OrderPanel from "@/components/POS/OrderPanel";
import QuantityModal, { Unit } from "@/components/POS/QuantityModal";
import CustomerPhoneModal from "@/components/POS/CustomerPhoneModal";
import NoCustomerWarningModal from "@/components/POS/NoCustomerWarningModal";
import DataSentSuccessModal from "@/components/POS/DataSentSuccessModal";
import CategorySidebar from "@/components/POS/CategorySidebar";

type CartRow = CartItem & { id: string };

function CheckoutContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const customerId = sp.get("customerId");

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCat, setActiveCat] = useState<
    ProductCategory | "all" | "shampoo_conditioner_cleansing"
  >("all");
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

  // 🔸 로고 클릭 시 초기화 처리
  const handleLogoClick = () => {
    // 고객 정보 초기화
    setCustomer(null);
    setCustomerPhone(null);
    // 장바구니 초기화
    setCart([]);
    // localStorage 초기화
    localStorage.removeItem("customerPhone");
    localStorage.removeItem("cart");
    localStorage.removeItem("total");
    // 검색어 초기화 (선택사항)
    setSearchQuery("");
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
    <main className="h-screen bg-[#F2F2F7] flex flex-row overflow-hidden">
      {/* 왼쪽 영역: 헤더 + 사이드바 + CatalogPanel */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* 헤더 - 왼쪽 영역만 */}
        <div className="w-full bg-[#F2F2F7] px-4 md:px-8 pt-6 md:pt-8 pb-2 md:pb-4 flex items-center gap-4 md:gap-6 lg:gap-8">
          {/* 왼쪽: 로고 + 상점명 + 날짜 */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* 로고 */}
            <button
              onClick={handleLogoClick}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="초기화"
            >
              <img
                src="/almang_logo.png"
                alt="알맹상점 로고"
                className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover shadow-sm"
              />
            </button>

            {/* 상점명 + 날짜 */}
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-bold text-black">알맹상점</h1>
              <p className="text-sm md:text-base text-black">
                {new Date().toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </p>
            </div>
          </div>

          {/* 검색창 */}
          <div className="flex-1 md:max-w-[28rem] lg:max-w-[32rem] ml-auto">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="상품 검색"
                  className="w-full px-4 py-3.5 pl-10 pr-10 rounded-lg bg-white border-2 border-[#e75251] text-sm text-[#e75251] placeholder:text-[#e75251] placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#e75251] focus:border-[#e75251] transition-all"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#e75251] pointer-events-none"
                  fill="none"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.16667 9.16667C4.16667 6.40917 6.40917 4.16667 9.16667 4.16667C11.9242 4.16667 14.1667 6.40917 14.1667 9.16667C14.1667 11.9242 11.9242 14.1667 9.16667 14.1667C6.40917 14.1667 4.16667 11.9242 4.16667 9.16667ZM17.2558 16.0775L14.4267 13.2475C15.3042 12.1192 15.8333 10.705 15.8333 9.16667C15.8333 5.49083 12.8425 2.5 9.16667 2.5C5.49083 2.5 2.5 5.49083 2.5 9.16667C2.5 12.8425 5.49083 15.8333 9.16667 15.8333C10.705 15.8333 12.1192 15.3042 13.2475 14.4267L16.0775 17.2558C16.24 17.4183 16.4533 17.5 16.6667 17.5C16.88 17.5 17.0933 17.4183 17.2558 17.2558C17.5817 16.93 17.5817 16.4033 17.2558 16.0775Z"
                    fill="#E75251"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center text-[#e75251] hover:text-[#d43f3e] transition-colors"
                    aria-label="검색어 지우기"
                  >
                    <svg
                      className="w-full h-full"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 헤더 아래: 사이드바 + CatalogPanel을 독립적인 둥근 사각형으로 */}
        <div className="flex-1 flex flex-row min-w-0 min-h-0 overflow-hidden pt-2 md:pt-3 pb-4 md:pb-6 px-4 md:px-6 lg:px-8 gap-0">
          {/* 카테고리 사이드바 - 독립적인 둥근 사각형 */}
          <div className="flex-shrink-0 rounded-lg shadow-lg overflow-hidden">
            <CategorySidebar activeCat={activeCat} onChangeCat={setActiveCat} />
          </div>

          {/* CatalogPanel - 독립적인 둥근 사각형 */}
          <div className="flex-1 min-w-0 min-h-0 overflow-hidden bg-white rounded-lg shadow-lg flex flex-col">
            {/* 카테고리 이름 - 고정 */}
            <div className="flex-shrink-0 pt-4 md:pt-6 pb-4 md:pb-6 px-4 md:px-6 lg:px-8 flex items-center gap-3 md:gap-4">
              {/* 빨간색 세로 바 */}
              <div className="w-1 h-6 md:h-8 bg-[#E75251] rounded-full flex-shrink-0"></div>
              <h2 className="text-2xl md:text-3xl font-semibold text-black">
                {activeCat === "all"
                  ? "전체"
                  : activeCat === "shampoo_conditioner_cleansing"
                    ? "샴푸/컨디셔너/클렌징"
                    : CATEGORY_LABELS[activeCat as ProductCategory]}
              </h2>
            </div>
            {/* 상품 그리드 - 스크롤 가능 */}
            <div className="flex-1 min-w-0 min-h-0 overflow-y-auto px-4 md:px-6 lg:px-8 pb-4 md:pb-6 lg:pb-8">
              <CatalogPanel
                products={products}
                activeCat={activeCat}
                onChangeCat={setActiveCat}
                onPick={pickProduct}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 우측 주문 패널 - 화면의 1/4 너비만 차지 */}
      <div className="w-1/4 flex-shrink-0 flex flex-col min-h-0 h-full">
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
