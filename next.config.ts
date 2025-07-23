import type { NextConfig } from "next";

if (!process.env.NEXT_PUBLIC_SUPABASE_IMAGE_DOMAIN) {
  throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_IMAGE_DOMAIN");
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_SUPABASE_IMAGE_DOMAIN,
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
    ],
  },
};


export default nextConfig;
