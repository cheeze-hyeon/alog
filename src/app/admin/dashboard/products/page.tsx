'use client'

import { useState, useEffect, useTransition } from 'react'
import Card from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import SearchBar from '@/components/ui/SearchBar'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import { PRODUCT_CATEGORIES, CATEGORY_LABELS } from '@/types/product'
import { getProducts, addProduct, deleteProduct, type AdminProduct } from './actions'

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    short_description: '',
    brand: '',
    ingredients: '',
    environmental_contribution: '',
    category: 'detergent',
    current_price: '',
    current_carbon_emission: '',
    is_refill: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts(searchQuery || undefined)
      setProducts(data)
    } catch (error) {
      console.error('Error:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // 검색어 변경 시 다시 가져오기
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        fetchProducts()
      })
    }, 300) // 300ms 디바운스

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleDelete = async (id: number) => {
    if (!confirm('정말 이 상품을 삭제하시겠습니까?')) {
      return
    }

    try {
      const result = await deleteProduct(id)
      if (!result.success) {
        alert(result.error || '삭제 중 오류가 발생했습니다.')
        return
      }

      // 목록에서 제거
      setProducts(prev => prev.filter(p => p.id !== id))
      alert('상품이 삭제되었습니다.')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleAddProduct = async () => {
    // 필수 필드 검증
    if (!formData.name || !formData.current_price) {
      alert('상품명과 가격은 필수 입력 항목입니다.')
      return
    }

    try {
      setSubmitting(true)

      const productData = {
        name: formData.name,
        short_description: formData.short_description || null,
        brand: formData.brand || null,
        ingredients: formData.ingredients || null,
        environmental_contribution: formData.environmental_contribution || null,
        category: formData.category,
        current_price: parseFloat(formData.current_price),
        current_carbon_emission: formData.current_carbon_emission 
          ? parseFloat(formData.current_carbon_emission) 
          : null,
        is_refill: formData.is_refill,
      }

      const result = await addProduct(productData)
      if (!result.success) {
        alert(result.error || '상품 추가 중 오류가 발생했습니다.')
        return
      }

      // 성공 시 모달 닫고 목록 새로고침
      setShowAddModal(false)
      setFormData({
        name: '',
        short_description: '',
        brand: '',
        ingredients: '',
        environmental_contribution: '',
        category: 'detergent',
        current_price: '',
        current_carbon_emission: '',
        is_refill: false,
      })
      fetchProducts()
      alert('상품이 추가되었습니다.')
    } catch (error) {
      console.error('Error adding product:', error)
      alert('상품 추가 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <div className="space-y-6 bg-white">
      {/* Header */}
      <PageHeader 
        title="상품 관리"
        description="상품 목록을 확인하고 관리하세요."
        action={
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            <span className="font-medium">상품 추가</span>
          </button>
        }
      />

      {/* Search and Filter */}
      <SearchBar 
        placeholder="상품 이름, 카테고리로 검색..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Products Table */}
      <Card>
        {loading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? '검색 결과가 없습니다.' : '상품 데이터가 없습니다.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">상품명</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">카테고리</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">가격</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">재고</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">판매량</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">매출</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">타입</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">상태</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">작업</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-900">{product.id}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{product.category || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{product.price.toLocaleString()}원</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{product.stock}개</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{product.sales || 0}건</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{(product.revenue || 0).toLocaleString()}원</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        product.type === '리필' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {product.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === '판매중' 
                          ? 'bg-green-100 text-green-800' 
                          : product.status === '품절'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-blue-50 rounded text-blue-600 transition-colors">
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 상품 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">상품 추가</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* 상품명 (필수) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상품명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="상품명을 입력하세요"
                />
              </div>

              {/* 간단 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  간단 설명
                </label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="간단한 설명을 입력하세요"
                />
              </div>

              {/* 브랜드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  브랜드
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="브랜드명을 입력하세요"
                />
              </div>

              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* 가격 (필수) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  가격 (g당 단가, 원) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.current_price}
                  onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* 리필 여부 */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_refill}
                    onChange={(e) => setFormData({ ...formData, is_refill: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">리필 상품</span>
                </label>
              </div>

              {/* 성분 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  성분
                </label>
                <textarea
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="성분 정보를 입력하세요"
                />
              </div>

              {/* 친환경 정보 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  친환경 정보
                </label>
                <textarea
                  value={formData.environmental_contribution}
                  onChange={(e) => setFormData({ ...formData, environmental_contribution: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="친환경 기여 정보를 입력하세요"
                />
              </div>

              {/* 탄소 배출량 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  탄소 배출량 (kg/g)
                </label>
                <input
                  type="number"
                  value={formData.current_carbon_emission}
                  onChange={(e) => setFormData({ ...formData, current_carbon_emission: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  step="0.0001"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setFormData({
                    name: '',
                    short_description: '',
                    brand: '',
                    ingredients: '',
                    environmental_contribution: '',
                    category: 'detergent',
                    current_price: '',
                    current_carbon_emission: '',
                    is_refill: false,
                  })
                }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                취소
              </button>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


