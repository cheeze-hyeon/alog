import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production 빌드에서 소스맵 비활성화 (eval 사용 방지)
  productionBrowserSourceMaps: false,
  
  // CSP 헤더 설정 (선택사항 - 서버에서 CSP를 설정하지 않는 경우)
  // headers: async () => {
  //   return [
  //     {
  //       source: '/:path*',
  //       headers: [
  //         {
  //           key: 'Content-Security-Policy',
  //           value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default nextConfig;
