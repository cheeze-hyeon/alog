import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
      <div className="w-full max-w-xl space-y-6 rounded-2xl bg-white p-10 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-slate-900">알맹상점 · 빠른 이동</h1>
        <div className="grid gap-3">
          <Link
            href="/receipt/1010"
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            소비자용 영수증 예시
          </Link>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            관리자 대시보드
          </Link>
          <Link
            href="/pos"
            className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-500"
          >
            POS 시스템
          </Link>
          <Link
            href="/mypage?phone=01012345678"
            className="inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-500"
          >
            마이페이지
          </Link>
        </div>
      </div>
    </main>
  );
}
