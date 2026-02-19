import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Define o limite para 10MB
    },
  },
};

export default nextConfig;

