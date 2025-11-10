import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase 초기화 실패: 환경 변수가 설정되지 않았습니다. `.env.local`에서 URL과 키를 확인하세요.",
  );
}

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
});
