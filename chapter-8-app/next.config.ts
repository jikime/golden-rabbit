import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wcpxgcmlnnavaicczxnn.supabase.co', // 여러분의 Supabase 프로젝트 호스트네임으로 변경해야 합니다. (.env.local 파일의 NEXT_PUBLIC_SUPABASE_URL 에서 확인 가능)
        port: '',
        pathname: '/storage/v1/object/public/**', // 보통 스토리지 URL의 이 부분은 공통적입니다.
      },
    ],
  },
};

export default nextConfig;