import Link from "next/link";
import { getBaseUrl } from "@/lib/env";
import type { Product } from "@/types/product";
import type { Customer } from "@/types/customer";
import type { CustomerLoyalty } from "@/types/customer_loyalty";

type Metrics = {
  totalCustomers: number;
  totalRevenue: number;
  totalRefills: number;
  co2SavedKg: number;
};

type Sales = { labels: string[]; values: number[] };

type AdminProduct = Product;

type AdminCustomer = Customer & {
  loyalty?: CustomerLoyalty;
};

async function getMetrics(): Promise<Metrics> {
  const fallback: Metrics = {
    totalCustomers: 0,
    totalRevenue: 0,
    totalRefills: 0,
    co2SavedKg: 0,
  };
  try {
    const res = await fetch(`${getBaseUrl()}/api/admin/metrics`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return res.json();
  } catch {
    return fallback;
  }
}

async function getSales(): Promise<Sales> {
  const fallback: Sales = {
    labels: ["올리브 샴푸", "에코 세제"],
    values: [7200000, 5400000],
  };
  try {
    const res = await fetch(`${getBaseUrl()}/api/admin/sales`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return res.json();
  } catch {
    return fallback;
  }
}

async function getProducts(): Promise<AdminProduct[]> {
  const fallback: AdminProduct[] = [];
  try {
    const res = await fetch(`${getBaseUrl()}/api/admin/products`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return res.json();
  } catch {
    return fallback;
  }
}

async function getCustomers(): Promise<AdminCustomer[]> {
  const fallback: AdminCustomer[] = [];
  try {
    const res = await fetch(`${getBaseUrl()}/api/admin/customers`, { cache: "no-store" });
    if (!res.ok) return fallback;
    const customers: Customer[] = await res.json();
    // TODO: customer_loyalty 정보도 함께 조회해야 함
    return customers.map((c) => ({ ...c, loyalty: undefined }));
  } catch {
    return fallback;
  }
}

function formatCurrency(krw: number) {
  return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(krw);
}

export default async function AdminDashboardPage() {
  const [metrics, sales, products, customers]: [Metrics, Sales, AdminProduct[], AdminCustomer[]] =
    await Promise.all([getMetrics(), getSales(), getProducts(), getCustomers()]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">관리자 대시보드</h1>
        <p className="text-sm text-slate-600">누적 데이터 기반 KPI와 분석을 제공합니다.</p>
      </header>

      {/* KPI */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-slate-500">총 고객 수</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{metrics.totalCustomers}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-slate-500">총 매출</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatCurrency(metrics.totalRevenue)}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-slate-500">리필 횟수</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{metrics.totalRefills}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-slate-500">CO₂ 감축량(kg)</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{metrics.co2SavedKg}</p>
        </div>
      </section>

      {/* 판매 분석 */}
      <section className="mt-8 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">판매 분석</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
          {sales.labels.map((label: string, idx: number) => (
            <div key={label} className="rounded-lg border p-4">
              <p className="text-sm text-slate-600">{label}</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {formatCurrency(sales.values[idx])}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 상품 관리 */}
      <section className="mt-8 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">상품 관리</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="px-2 py-2">상품명</th>
                <th className="px-2 py-2">카테고리</th>
                <th className="px-2 py-2">가격</th>
                <th className="px-2 py-2">탄소 배출량</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: AdminProduct) => (
                <tr key={p.id} className="border-t">
                  <td className="px-2 py-2">{p.name || "상품명 없음"}</td>
                  <td className="px-2 py-2">{p.category || "-"}</td>
                  <td className="px-2 py-2">
                    {p.current_price ? formatCurrency(p.current_price) : "-"}
                  </td>
                  <td className="px-2 py-2">
                    {p.current_carbon_emission !== null
                      ? `${p.current_carbon_emission.toFixed(3)} kg`
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 고객 목록 */}
      <section className="mt-8 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">고객 목록</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="px-2 py-2">고객</th>
                <th className="px-2 py-2">이름</th>
                <th className="px-2 py-2">가입일</th>
                <th className="px-2 py-2">카카오 ID</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c: AdminCustomer) => (
                <tr key={c.id} className="border-t">
                  <td className="px-2 py-2">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="text-emerald-700 hover:underline"
                    >
                      {c.id}
                    </Link>
                  </td>
                  <td className="px-2 py-2">{c.name || "-"}</td>
                  <td className="px-2 py-2">
                    {c.created_at
                      ? new Date(c.created_at).toLocaleString("ko-KR")
                      : "-"}
                  </td>
                  <td className="px-2 py-2">{c.kakao_id || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
