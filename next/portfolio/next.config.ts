import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admin.example.com',
        pathname: '/api/media/**',
      },
      {
        protocol: 'https',
        hostname: 'admin.example.com',
        pathname: '/m/**',
      },
    ],
  },
};

export default nextConfig;
