import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'hrwhfkpdzopxpyiqyupr.supabase.co', // supabase storage domain
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
