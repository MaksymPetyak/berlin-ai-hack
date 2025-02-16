/** @type {import('next').NextConfig} */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent PSPDFKit from being bundled on the server
      config.externals = [...config.externals, 'pspdfkit'];
    }
    return config;
  },
};

export default nextConfig;
