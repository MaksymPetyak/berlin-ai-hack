/** @type {import('next').NextConfig} */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  webpack: (config, { isServer }) => {
    // Initialize externals array if it doesn't exist
    config.externals = config.externals || [];

    if (isServer) {
      // Server-side: Add pspdfkit to externals
      config.externals.push('pspdfkit');
    } else {
      // Client-side: Configure pspdfkit as external with proper loading
      config.externals.push({
        pspdfkit: 'PSPDFKit'
      });
    }

    return config;
  },
};

export default nextConfig;
