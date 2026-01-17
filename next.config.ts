import "~/config/env";

import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX();

const config: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        hostname: "github.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Only alias canvas on the server side to avoid conflicts with browser Canvas API
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
      config.externals = [
        ...(config.externals || []),
        "canvas",
        "pdfjs-dist",
      ];
    }

    // Ensure pdfjs-dist is handled correctly
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.m?js$/,
      type: "javascript/auto",
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
};

export default withMDX(config);
