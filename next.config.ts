import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: [
    '127.0.0.1',
    'localhost',
    '192.168.1.53',
    '192.168.1.*',
    '*.local',
    'convicted-ham-mode-realtors.trycloudflare.com',
    '*.trycloudflare.com',
  ],
};

export default nextConfig;
