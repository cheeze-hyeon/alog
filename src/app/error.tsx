"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <main className="min-h-screen bg-slate-100 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">오류가 발생했습니다</h2>
            <p className="text-slate-600 mb-6">
              {error.message || "예상치 못한 오류가 발생했습니다."}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={reset}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
              >
                다시 시도
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
              >
                홈으로
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}



