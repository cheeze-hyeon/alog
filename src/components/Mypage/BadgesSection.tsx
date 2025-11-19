import type { PurchaseItem, ProductCategory } from "@/types";

interface BadgesSectionProps {
  purchaseItems: PurchaseItem[];
}

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  shampoo: "샴푸",
  conditioner: "컨디셔너",
  body_handwash: "바디워시/핸드워시",
  lotion_oil: "로션/오일",
  cream_balm_gel_pack: "크림/밤/젤/팩",
  cleansing: "클렌징 제품",
  detergent: "세제",
  snack_drink_base: "식품", // 간식 및 음료 베이스를 "식품"으로 표시
  cooking_ingredient: "식품", // 요리용 식재료도 "식품"으로 표시
  tea: "차류",
};

export default function BadgesSection({ purchaseItems }: BadgesSectionProps) {
  // 상품명에서 카테고리 추출 또는 제품명 그대로 사용
  const getProductDisplayName = (item: PurchaseItem) => {
    if (item.productCategory && CATEGORY_LABELS[item.productCategory]) {
      const label = CATEGORY_LABELS[item.productCategory];
      // 긴 이름은 짧게 축약 (예: "크림/밤/젤/팩" -> "크림")
      if (label.includes("/")) {
        return label.split("/")[0];
      }
      return label;
    }
    // 상품명에서 "리필" 접두사 제거하고, 긴 이름은 앞부분만 추출
    let name = item.productName.replace(/^리필\s*/, "");
    // "선크림" 같은 경우 상품명에 포함될 수 있음
    if (name.includes("선크림") || name.includes("선 크림")) {
      return "선크림";
    }
    if (name.includes("로션")) {
      return "로션";
    }
    // 기본적으로 상품명을 그대로 반환 (최대 4글자로 제한)
    return name.length > 4 ? name.substring(0, 4) : name;
  };

  return (
    <div className="w-full bg-white px-4 py-6">
      <div className="max-w-md mx-auto">
        <p className="text-[15px] font-semibold text-left text-black/70 mb-4">
          내가 모은 알맹이들
        </p>

        {/* 구매 내역 그리드 */}
        {purchaseItems.length > 0 ? (
          <div className="grid grid-cols-4 gap-3">
            {purchaseItems.map((item) => (
              <div
                key={item.id}
                className="w-20 h-[100px] rounded-[20px] bg-white border-[0.5px] border-[#959595]/80 relative"
                style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.25))" }}
              >
                {/* 날짜 */}
                <p className="absolute left-[52px] top-[10px] text-[8px] text-left text-black/50">
                  {item.date}
                </p>

                {/* 배경 원형/사각형 */}
                {item.type === "refill" ? (
                  <div className="absolute left-[12.5px] top-[30px] w-[55px] h-[55px] rounded-full bg-[#E04F4E] flex items-center justify-center">
                    <p className="text-[10px] text-white absolute top-[-5px] left-[8px]">리필</p>
                    <p className="text-[15px] font-medium text-white">
                      {getProductDisplayName(item)}
                    </p>
                  </div>
                ) : (
                  <div className="absolute left-[12.5px] top-[30px] w-[53px] h-[53px] rounded-[10px] bg-[#6cb6e0] flex items-center justify-center">
                    <p className="text-[10px] text-white absolute top-[-5px] left-[9px]">상품</p>
                    <p className="text-[15px] font-medium text-white">
                      {getProductDisplayName(item)}
                    </p>
                  </div>
                )}

                {/* 가격 */}
                <p className="absolute left-[11px] top-[80px] text-[10px] text-left text-black/70">
                  {item.price.toLocaleString()}원
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-[243px] rounded-[20px] bg-white border-[0.5px] border-[#959595]/80 flex items-center justify-center">
            <p className="text-sm text-black/50">아직 구매한 상품이 없어요</p>
          </div>
        )}
      </div>
    </div>
  );
}