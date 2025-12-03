import CustomerDetailClient from './CustomerDetailClient'
import { getCustomer, getCustomerReceipts, getCustomerDetail } from './actions'

// 동적 렌더링 강제 (실시간 데이터를 위해)
export const dynamic = 'force-dynamic'

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customerId = parseInt(id, 10)

  if (isNaN(customerId)) {
    return (
      <div className="space-y-6 bg-white">
        <div className="p-8 text-center text-gray-500">유효하지 않은 고객 ID입니다.</div>
      </div>
    )
  }

  const [customer, receipts, customerDetail] = await Promise.all([
    getCustomer(customerId),
    getCustomerReceipts(customerId),
    getCustomerDetail(customerId),
  ])

  if (!customer) {
    return (
      <div className="space-y-6 bg-white">
        <div className="p-8 text-center text-gray-500">고객을 찾을 수 없습니다.</div>
      </div>
    )
  }

  if (!customerDetail) {
    return (
      <div className="space-y-6 bg-white">
        <div className="p-8 text-center text-gray-500">고객 정보를 불러올 수 없습니다.</div>
      </div>
    )
  }

  return (
    <CustomerDetailClient
      customer={customer}
      receipts={receipts}
      customerDetail={customerDetail}
    />
  )
}
