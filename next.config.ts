// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Your other Next.js configurations can go here
  // For example: reactStrictMode: true,

  // Add allowedDevOrigins here, at the top level
  allowedDevOrigins: ["http://localhost:3000", "http://192.168.29.241:3000"], // Add your dev machine's IP if accessing from another device
};

export default nextConfig;
