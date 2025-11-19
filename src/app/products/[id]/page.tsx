import type { Product } from "@/types/product";
import { getBaseUrl } from "@/lib/env";

async function getProduct(id: string): Promise<Product> {
  const fallback: Product = {
    id: parseInt(id, 10) || 0,
    name: "상품명 없음",
    short_description: null,
    brand: null,
    ingredients: null,
    environmental_contribution: null,
    category: null,
    current_price: null,
    current_carbon_emission: null,
  };
  try {
    const res = await fetch(`${getBaseUrl()}/api/products/${id}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return res.json();
  } catch {
    return fallback;
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{product.name || "상품명 없음"}</h1>
        {product.short_description && (
          <p className="text-sm text-slate-500 mt-1">{product.short_description}</p>
        )}
        {product.current_price && (
          <p className="text-lg font-semibold text-rose-600 mt-2">
            {product.current_price.toLocaleString()}원
          </p>
        )}
      </header>

      <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        {product.ingredients ? (
          <div>
            <p className="text-sm font-semibold text-slate-900">성분</p>
            <p className="mt-1 text-sm text-slate-600">{product.ingredients}</p>
          </div>
        ) : null}

        {product.environmental_contribution ? (
          <div>
            <p className="text-sm font-semibold text-slate-900">친환경 정보</p>
            <p className="mt-1 text-sm text-slate-600">{product.environmental_contribution}</p>
          </div>
        ) : null}

        {product.current_carbon_emission !== null && (
          <div>
            <p className="text-sm font-semibold text-slate-900">탄소 배출량</p>
            <p className="mt-1 text-sm text-slate-600">
              {product.current_carbon_emission.toFixed(3)} kg CO₂
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
