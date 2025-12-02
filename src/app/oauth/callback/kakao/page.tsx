'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function KakaoCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('처리 중...')

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')

      if (error) {
        setStatus('error')
        setMessage('인증에 실패했습니다.')
        return
      }

      if (!code) {
        setStatus('error')
        setMessage('인증 코드가 없습니다.')
        return
      }

      try {
        // API 라우트로 인증 코드 전달
        const response = await fetch(`/api/auth/kakao/callback?code=${code}${state ? `&state=${state}` : ''}`)
        
        if (response.ok) {
          setStatus('success')
          setMessage('로그인에 성공했습니다.')
          // TODO: 세션 설정 후 적절한 페이지로 리다이렉트
          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('인증 처리에 실패했습니다.')
        }
      } catch (err) {
        console.error('Callback error:', err)
        setStatus('error')
        setMessage('오류가 발생했습니다.')
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-lg text-center">
        {status === 'loading' && (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h1 className="text-xl font-bold text-slate-900">카카오 로그인 처리 중</h1>
            <p className="text-slate-600">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-xl font-bold text-slate-900">로그인 성공</h1>
            <p className="text-slate-600">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-xl font-bold text-slate-900">로그인 실패</h1>
            <p className="text-slate-600">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-300 font-semibold"
            >
              로그인 페이지로 돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-lg text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h1 className="text-xl font-bold text-slate-900">로딩 중...</h1>
        </div>
      </div>
    }>
      <KakaoCallbackContent />
    </Suspense>
  )
}

