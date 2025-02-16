/** @type {import('next').NextConfig} */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  swcMinify: false,
  typescript: {
    ignoreBuildErrors: true
  },
  transpilePackages: ['pspdfkit'],
  eslint: {
    ignoreDuringBuilds: true
  },
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

    // Modify optimization settings
    config.optimization = {
      ...config.optimization,
      minimize: false,
      sideEffects: false
    };

    return config;
  },
};

export default nextConfig;
