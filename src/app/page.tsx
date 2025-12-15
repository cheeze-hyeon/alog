import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-4 text-center text-3xl font-bold text-slate-900">
          알록 Alog
        </h1>
        <p className="mb-12 text-center text-slate-600">
          알맹상점의 리필 경험을 기록합니다
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          {/* 운영자용 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#E04F4E" }} />
              <h2 className="text-xl font-semibold text-slate-900">운영자용</h2>
            </div>

            <div className="space-y-4">

              <Link
                href="/pos"
                className="block rounded-lg px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:opacity-80"
                style={{ backgroundColor: "#E04F4E" }}
              >
                POS 시스템
              </Link>
              <Link
                href="/admin/dashboard"
                className="block rounded-lg border px-4 py-3 text-sm font-semibold transition hover:bg-slate-50 active:bg-slate-100"

                style={{ borderColor: "#E04F4E", color: "#E04F4E" }}

              >
                대시보드
              </Link>
            </div>
          </section>

          {/* 소비자용 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#6CB6E0" }} />
              <h2 className="text-xl font-semibold text-slate-900">소비자용</h2>
            </div>

            <div className="space-y-4">
              <Link
                href="/receipt/1020"
                className="block rounded-lg px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:opacity-80"
                style={{ backgroundColor: "#6CB6E0" }}
              >
                스마트 영수증
              </Link>

              <Link
                href="/mypage?phone=01012345678"
                className="block rounded-lg border px-4 py-3 text-sm font-semibold transition hover:bg-slate-50 active:bg-slate-100"
                style={{ borderColor: "#6CB6E0", color: "#6CB6E0" }}
              >
                알맹 히스토리
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
