import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase 초기화 실패: 환경 변수가 설정되지 않았습니다. `.env.local`에서 URL과 키를 확인하세요.",
  );
}

// 개발 환경에서 SSL 검증 문제 해결을 위한 커스텀 fetch
const customFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
  // 개발 환경에서만 SSL 검증 비활성화
  if (process.env.NODE_ENV === 'development') {
    // Node.js 환경에서는 https 모듈을 사용하여 SSL 검증 우회
    if (typeof window === 'undefined') {
      const https = require('https');
      const agent = new https.Agent({
        rejectUnauthorized: false,
      });
      
      // fetch 옵션에 agent 추가 (Node.js 18+ fetch는 agent를 직접 지원하지 않으므로
      // 다른 방법이 필요할 수 있습니다)
    }
  }
  
  return fetch(url, options);
};

/**
 * Supabase 클라이언트는 브라우저와 서버 모두에서 사용 가능합니다.
 * 다만, 민감한 서비스 키는 절대 클라이언트 번들에 포함하지 말고
 * 서버 전용 환경 변수(`SUPABASE_SERVICE_ROLE_KEY` 등)를 활용하세요.
 *
 * ⚠️ RLS(Row Level Security)는 기본적으로 활성화하는 것을 권장합니다.
 *     - 각 테이블에 대해 정책을 수립하고, 인증된 사용자별 접근 권한을 제한하세요.
 *     - 초기 스키마 설계 단계에서 RLS 정책을 정의하면 운영 중 보안 이슈를 줄일 수 있습니다.
 */
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
  },
  // 개발 환경에서 SSL 검증 문제가 있는 경우
  // global: {
  //   fetch: customFetch, // Supabase JS v2에서는 직접 fetch 옵션 지원이 제한적
  // },
});

/**
 * 서버 사이드에서만 사용하는 Supabase 클라이언트입니다.
 * Service Role Key를 사용하여 RLS(Row Level Security)를 우회합니다.
 * 
 * ⚠️ 이 클라이언트는 절대 클라이언트 번들에 포함되면 안 됩니다.
 *     서버 사이드 API Route에서만 사용하세요.
 */
export const supabaseServerClient = (() => {
  // 서버 사이드에서만 실행
  if (typeof window !== 'undefined') {
    throw new Error('supabaseServerClient는 서버 사이드에서만 사용할 수 있습니다.');
  }

  // Service Role Key가 없으면 Anon Key를 사용 (경고 메시지와 함께)
  const key = supabaseServiceRoleKey || supabaseAnonKey;
  
  if (!supabaseServiceRoleKey) {
    console.warn(
      '⚠️ SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. ' +
      'RLS 정책으로 인해 서버 사이드 작업이 실패할 수 있습니다. ' +
      'Service Role Key를 설정하거나 Supabase에서 RLS 정책을 확인하세요.'
    );
  }

  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
})();
