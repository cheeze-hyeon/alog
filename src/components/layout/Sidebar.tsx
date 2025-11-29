'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuCategories = [
  {
    category: '매출',
    items: [
      { href: '/admin/dashboard', label: '대시보드' },
    ],
  },
  {
    category: '고객',
    items: [
      { href: '/admin/dashboard/users', label: '고객 정보' },
    ],
  },
  {
    category: '상품',
    items: [
      { href: '/admin/dashboard/products', label: '상품 관리' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      {/* 로고 영역 */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <span className="text-xl font-bold">알맹</span>
        </div>
      </div>

      {/* 메뉴 영역 */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {menuCategories.map((category) => (
          <div key={category.category} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
              {category.category}
            </h3>
            <ul className="space-y-1">
              {category.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}

