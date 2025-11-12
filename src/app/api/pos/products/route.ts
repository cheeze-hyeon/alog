import { NextResponse } from "next/server";

// TODO: Supabase 연동으로 교체
const mockProducts = [
  {
    id: "prd_olive",
    name: "올리브 샴푸",
    stockMl: 12000,
    unitPricePerMl: 20,
    status: "on",
    category: "shampoo",
  },
  {
    id: "prd_detergent",
    name: "에코 세제",
    stockMl: 8000,
    unitPricePerMl: 20,
    status: "on",
    category: "detergent",
  },
  {
    id: "prd_conditioner",
    name: "헤어 컨디셔너",
    stockMl: 10000,
    unitPricePerMl: 25,
    status: "on",
    category: "shampoo",
  },
  {
    id: "prd_shamp_rosemary",
    name: "아로마티카 로즈마리 스칼프 스케일링 샴푸",
    stockMl: 12000,
    unitPricePerMl: 30,
    status: "on",
    category: "shampoo",
  },
  {
    id: "prd_shamp_scalp",
    name: "아로마티카 유칼립투스 스칼프 클래 리파잉 샴푸",
    stockMl: 9000,
    unitPricePerMl: 18,
    status: "on",
    category: "shampoo",
  },
  {
    id: "prd_shamp_cypress",
    name: "아로마티카 사이프러스 리프레싱 샴푸",
    stockMl: 8500,
    unitPricePerMl: 25,
    status: "on",
    category: "shampoo",
  },
  {
    id: "prd_body_001",
    name: "내추럴 바디워시",
    stockMl: 10000,
    unitPricePerMl: 20,
    status: "on",
    category: "body_handwash",
  },
  {
    id: "prd_hand_001",
    name: "마일드 핸드워시",
    stockMl: 8000,
    unitPricePerMl: 15,
    status: "on",
    category: "body_handwash",
  },
  {
    id: "prd_lotion_001",
    name: "라이트 로션",
    stockMl: 6000,
    unitPricePerMl: 28,
    status: "on",
    category: "lotion_oil",
  },
  {
    id: "prd_oil_001",
    name: "퓨어 스윗아몬드 오일",
    stockMl: 5000,
    unitPricePerMl: 40,
    status: "on",
    category: "lotion_oil",
  },
  {
    id: "prd_cream_001",
    name: "수분 크림",
    stockMl: 7000,
    unitPricePerMl: 32,
    status: "on",
    category: "cream_balm_gel_pack",
  },
  {
    id: "prd_gel_001",
    name: "카밍 젤",
    stockMl: 7000,
    unitPricePerMl: 22,
    status: "on",
    category: "cream_balm_gel_pack",
  },
  {
    id: "prd_cleanse_001",
    name: "약산성 클렌저",
    stockMl: 9000,
    unitPricePerMl: 24,
    status: "on",
    category: "cleansing",
  },
  {
    id: "prd_detergent_001",
    name: "닥터브로너스 퓨어 캐스틸 솝",
    stockMl: 15000,
    unitPricePerMl: 30,
    status: "on",
    category: "detergent",
  },
];

// 상품 목록 조회
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const all = mockProducts.filter((p) => p.status === "on" && p.stockMl > 0);
  const filtered = category ? all.filter((p) => p.category === category) : all;
  return NextResponse.json(filtered);
}
