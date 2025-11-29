import { supabaseServerClient } from '@/lib/supabase-client'
import type { Product as SupabaseProduct } from '@/types/product'
import { CATEGORY_LABELS } from '@/types/product'

// products/page.tsx에서 사용하는 Product 타입
export type Product = {
  id: number
  name: string
  category: string
  price: number
  stock: number
  sales: number
  revenue: number
  type: '리필' | '일반'
  status: '판매중' | '품절' | '단종'
}

interface GetProductsOptions {
  search?: string
}

interface GetProductsResult {
  data: Product[]
  error: string | null
}

// Supabase Product를 Admin Product로 변환
async function transformProduct(
  product: SupabaseProduct & { is_refill?: boolean },
  salesData: Map<number, { sales: number; revenue: number }>
): Promise<Product> {
  // is_refill 필드 사용
  const isRefill = product.is_refill === true
  
  // 판매량과 매출 데이터 가져오기
  const salesInfo = salesData.get(product.id) || { sales: 0, revenue: 0 }
  
  // 카테고리 라벨 변환
  const categoryLabel = product.category 
    ? (CATEGORY_LABELS[product.category as keyof typeof CATEGORY_LABELS] || product.category)
    : '기타'
  
  return {
    id: product.id,
    name: product.name || '이름 없음',
    category: categoryLabel,
    price: product.current_price || 0,
    stock: 0, // Supabase에 stock 필드가 없으므로 기본값 0
    sales: salesInfo.sales,
    revenue: salesInfo.revenue,
    type: isRefill ? '리필' : '일반',
    status: '판매중', // 기본값
  }
}

export async function getProducts(options: GetProductsOptions = {}): Promise<GetProductsResult> {
  try {
    // 상품 목록 조회 (is_refill 포함)
    let query = supabaseServerClient
      .from('product')
      .select('id, name, category, current_price, is_refill')
      .order('id', { ascending: true })

    // 검색어가 있으면 필터링
    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,category.ilike.%${options.search}%`)
    }

    const { data: products, error: productsError } = await query

    if (productsError) {
      console.error('Supabase error:', productsError)
      return { data: [], error: productsError.message }
    }

    if (!products || products.length === 0) {
      return { data: [], error: null }
    }

    // 모든 receipt_item 조회하여 판매량과 매출 계산
    const { data: receiptItems, error: itemsError } = await supabaseServerClient
      .from('receipt_item')
      .select('product_id, purchase_quantity, purchase_unit_price')

    if (itemsError) {
      console.error('Supabase error (receipt_items):', itemsError)
    }

    // 상품별 판매량과 매출 집계
    const salesData = new Map<number, { sales: number; revenue: number }>()
    
    receiptItems?.forEach((item: any) => {
      if (!item.product_id) return
      
      const productId = item.product_id
      const quantity = item.purchase_quantity || 0
      const unitPrice = item.purchase_unit_price || 0
      const revenue = quantity * unitPrice

      if (salesData.has(productId)) {
        const existing = salesData.get(productId)!
        existing.sales += 1 // 판매 건수
        existing.revenue += revenue
      } else {
        salesData.set(productId, {
          sales: 1,
          revenue: revenue,
        })
      }
    })

    // 각 상품을 변환
    const transformedProducts = await Promise.all(
      products.map((product) => transformProduct(product, salesData))
    )

    return { data: transformedProducts, error: null }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { data: [], error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' }
  }
}

export async function deleteProduct(id: number): Promise<{ error: string | null }> {
  try {
    const { error } = await supabaseServerClient
      .from('product')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' }
  }
}


