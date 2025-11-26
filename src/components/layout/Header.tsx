'use client'

import { ChevronRight } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
        <div className="flex items-center gap-2">
          <ChevronRight size={20} className="text-gray-400" />
        </div>
      </div>
    </header>
  )
}

