import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production 빌드에서 eval 사용 방지 (CSP 오류 해결)
  webpack: (config, { dev, isServer }) => {
    // Production 빌드에서는 source map을 'source-map'으로 설정하거나 비활성화
    if (!dev && !isServer) {
      config.devtool = false; // 또는 'source-map' 사용 가능
    }
    return config;
  },
  // Production 빌드 최적화
  productionBrowserSourceMaps: false, // Production에서 소스맵 비활성화
};

export default nextConfig;
