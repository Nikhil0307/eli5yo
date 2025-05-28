// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ... your other configurations
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
