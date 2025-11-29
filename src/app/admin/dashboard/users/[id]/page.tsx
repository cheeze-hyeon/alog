'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import { getBaseUrl } from '@/lib/env'
import { CHARACTER_LEVELS } from '@/lib/character-levels'
import type { Customer } from '@/types/customer'

type ReceiptData = {
  receiptId: number
  visitDate: string | null
  price: number
  purchaseDetails: string
}

type CustomerDetail = {
  level: number
  levelName: string
  totalVisits: number
  stampCount: number
  refillAmountMl: number
  productPurchaseCount: number
}

// 캐릭터 이미지 컴포넌트 (이미지 로드 실패 시 이모지 표시)
function CharacterImage({ imagePath, altText, emoji }: { imagePath: string; altText: string; emoji: string }) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return <div className="text-6xl">{emoji}</div>
  }

  return (
    <img
      src={imagePath}
      alt={altText}
      className="w-full h-full object-contain p-2"
      onError={() => setImageError(true)}
    />
  )
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [receipts, setReceipts] = useState<ReceiptData[]>([])
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showStampModal, setShowStampModal] = useState(false)
  const [stampInput, setStampInput] = useState('')

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params
      setCustomerId(resolvedParams.id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (!customerId) return

    async function fetchData() {
      try {
        setLoading(true)

        // 고객 정보 조회
        const customerRes = await fetch(`${getBaseUrl()}/api/admin/customers`, { cache: 'no-store' })
        if (customerRes.ok) {
          const customers: Customer[] = await customerRes.json()
          const foundCustomer = customers.find((c) => c.id === parseInt(customerId, 10))
          if (foundCustomer) {
            setCustomer(foundCustomer)
          }
        }

        // 영수증 목록 조회
        const receiptsRes = await fetch(
          `${getBaseUrl()}/api/admin/customers/${customerId}/receipts`,
          { cache: 'no-store' }
        )
        if (receiptsRes.ok) {
          const receiptsData: ReceiptData[] = await receiptsRes.json()
          setReceipts(receiptsData)
        }

        // 고객 상세 정보 조회 (레벨, 방문 횟수, 도장 개수 등)
        const detailRes = await fetch(
          `${getBaseUrl()}/api/admin/customers/${customerId}/detail`,
          { cache: 'no-store' }
        )
        if (detailRes.ok) {
          const detailData: CustomerDetail = await detailRes.json()
          setCustomerDetail(detailData)
          setStampInput(detailData.stampCount.toString())
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [customerId])

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
  }

  // 레벨에 따른 캐릭터 정보 가져오기
  const getCharacterInfo = (level: number) => {
    const levelInfo = CHARACTER_LEVELS.find((l) => l.level === level) || CHARACTER_LEVELS[0]
    const grade = levelInfo.grade

    // 등급에 따른 스타일 설정
    const gradeStyles = {
      1: { // 꼬마알맹 (1단계) - 랜덤
        bgGradient: 'from-pink-100 to-pink-200',
        borderColor: 'border-pink-300',
        emoji: '🌱',
        images: [
          '/characters/stage1_1.png', // 기본 캐릭터
          '/characters/stage1_2.png', // 아티스트 변형 (베레모 + 붓)
        ],
      },
      2: { // 유아알맹 (2단계)
        bgGradient: 'from-blue-100 to-blue-200',
        borderColor: 'border-blue-300',
        emoji: '🍃',
        images: ['/characters/stage2_1.png'],
      },
      3: { // 어린알맹 (3단계)
        bgGradient: 'from-green-100 to-green-200',
        borderColor: 'border-green-300',
        emoji: '🌳',
        images: ['/characters/stage3_1.png'],
      },
      4: { // 학생알맹 (4단계)
        bgGradient: 'from-purple-100 to-purple-200',
        borderColor: 'border-purple-300',
        emoji: '🌲',
        images: ['/characters/stage4_1.png'],
      },
      5: { // 어른알맹 (5단계)
        bgGradient: 'from-yellow-100 to-yellow-200',
        borderColor: 'border-yellow-300',
        emoji: '🌍',
        images: ['/characters/stage5_1.png'],
      },
    }

    const style = gradeStyles[grade as keyof typeof gradeStyles] || gradeStyles[1]
    
    // Lv.1의 경우 랜덤으로 이미지 선택 (고객 ID 기반으로 일관성 유지)
    let imagePath = style.images[0]
    if (grade === 1 && style.images.length > 1 && customerId) {
      // 고객 ID를 기반으로 랜덤 선택 (같은 고객은 항상 같은 이미지)
      const randomIndex = parseInt(customerId) % style.images.length
      imagePath = style.images[randomIndex]
    }

    return {
      bgGradient: style.bgGradient,
      borderColor: style.borderColor,
      emoji: style.emoji,
      imagePath,
      altText: levelInfo.name,
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 bg-white">
        <div className="p-8 text-center text-gray-500">로딩 중...</div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="space-y-6 bg-white">
        <div className="p-8 text-center text-gray-500">고객을 찾을 수 없습니다.</div>
      </div>
    )
  }

  const handleStampSave = async () => {
    const newStampCount = parseInt(stampInput, 10)
    if (isNaN(newStampCount) || !customerDetail || !customerId) return

    try {
      const res = await fetch(
        `${getBaseUrl()}/api/admin/customers/${customerId}/stamps`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stampCount: newStampCount }),
        }
      )

      if (res.ok) {
        setCustomerDetail({
          ...customerDetail,
          stampCount: newStampCount,
        })
        setShowStampModal(false)
      } else {
        alert('도장 개수 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error saving stamp count:', error)
      alert('도장 개수 저장 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="space-y-6 bg-white">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          ← 뒤로가기
        </button>
        <PageHeader 
          title={`고객 정보 - ${customer.name || '이름 없음'}`}
          description={`전화번호: ${customer.phone || '-'} | 카카오 ID: ${customer.kakao_id || '-'}`}
        />
      </div>

      {/* Customer Info Card */}
      {customerDetail && (() => {
        const characterInfo = getCharacterInfo(customerDetail.level)
        return (
          <div className="space-y-6">
            {/* Level Card */}
            <Card>
              <div className="flex items-center gap-6">
                {/* Character Image */}
                <div className="flex-shrink-0">
                  <div className={`w-32 h-32 bg-gradient-to-br ${characterInfo.bgGradient} rounded-full flex items-center justify-center border-4 ${characterInfo.borderColor} shadow-lg relative overflow-hidden`}>
                    {/* 캐릭터 이미지 - 이미지가 없으면 이모지 표시 */}
                    <CharacterImage 
                      imagePath={characterInfo.imagePath}
                      altText={characterInfo.altText}
                      emoji={characterInfo.emoji}
                    />
                  </div>
                </div>
                
                {/* Level Info */}
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      Lv.{customerDetail.level}
                    </span>
                    <span className="text-xl font-semibold text-gray-700">
                      {customerDetail.levelName}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    방문 {customerDetail.totalVisits}회 · 리필 {customerDetail.refillAmountMl}ml · 상품 {customerDetail.productPurchaseCount}개
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">총 방문 횟수</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {customerDetail.totalVisits}
                    <span className="text-lg font-normal text-gray-500 ml-1">회</span>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-500">도장 개수</div>
                    <button
                      onClick={() => setShowStampModal(true)}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      수정
                    </button>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {customerDetail.stampCount}
                    <span className="text-lg font-normal text-gray-500 ml-1">개</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )
      })()}

      {/* Stamp Modal */}
      {showStampModal && customerDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">도장 개수 수정</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  도장 개수
                </label>
                <input
                  type="number"
                  value={stampInput}
                  onChange={(e) => setStampInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowStampModal(false)
                    setStampInput(customerDetail.stampCount.toString())
                  }}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleStampSave}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Sales Table */}
      <Card title="최근 판매 내역">
        {receipts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">판매 내역이 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">방문 날짜</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">영수증 번호</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">가격</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">구매 내역</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr key={receipt.receiptId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {formatDate(receipt.visitDate)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{receipt.receiptId}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {receipt.price.toLocaleString()}원
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {receipt.purchaseDetails || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

