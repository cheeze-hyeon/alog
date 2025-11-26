import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 빌드 시에는 환경 변수가 없을 수 있으므로, 런타임에만 체크
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  if (!supabaseUrl || !supabaseAnonKey) {
    // 빌드 시에는 경고만 출력하고 계속 진행
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn(
        '⚠️ Supabase 환경 변수가 설정되지 않았습니다. 프로덕션 환경에서는 환경 변수를 설정해주세요.'
      );
    } else {
      throw new Error(
        "Supabase 초기화 실패: 환경 변수가 설정되지 않았습니다. `.env.local`에서 URL과 키를 확인하세요.",
      );
    }
  }
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
// 환경 변수가 없을 때를 대비한 더미 클라이언트 생성 함수
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // 더미 클라이언트 반환 (타입 에러 방지)
    return createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: { persistSession: false, detectSessionInUrl: false },
    });
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
};

export const supabaseClient = createSupabaseClient();

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

  // 환경 변수가 없으면 더미 클라이언트 반환
  if (!supabaseUrl) {
    console.warn('⚠️ Supabase URL이 설정되지 않았습니다. 더미 클라이언트를 반환합니다.');
    return createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  // Service Role Key가 없으면 Anon Key를 사용 (경고 메시지와 함께)
  const key = supabaseServiceRoleKey || supabaseAnonKey;
  
  if (!supabaseServiceRoleKey && supabaseAnonKey) {
    console.warn(
      '⚠️ SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. ' +
      'RLS 정책으로 인해 서버 사이드 작업이 실패할 수 있습니다. ' +
      'Service Role Key를 설정하거나 Supabase에서 RLS 정책을 확인하세요.'
    );
  }

  if (!key) {
    console.warn('⚠️ Supabase 키가 설정되지 않았습니다. 더미 클라이언트를 반환합니다.');
    return createClient(supabaseUrl, 'placeholder-key', {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
})();
