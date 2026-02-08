import "~/config/env";

import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX();

// Use STATIC_EXPORT=true for GitHub Pages deployment
// Use default (no env var) for self-hosted Node.js with CMS
const isStaticExport = process.env.STATIC_EXPORT === "true";

const config: NextConfig = {
  // Static export for GitHub Pages, standalone for Docker
  ...(isStaticExport ? { output: "export" } : { output: "standalone" }),
  basePath: isStaticExport ? "/fereshteh_website" : "",
  assetPrefix: isStaticExport ? "/fereshteh_website" : "",
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: false,
  images: {
    // Only unoptimize for static export (GitHub Pages)
    // Docker deployment will have full optimization
    unoptimized: isStaticExport,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        hostname: "github.com",
      },
    ],
  },
  // Add compression for production
  compress: true,
  // Configure experimental features for file uploads
  experimental: {
    // Increase body size limit for API routes (20MB)
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  // Optimize headers for caching
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Only alias canvas on the server side to avoid conflicts with browser Canvas API
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
      config.externals = [...(config.externals || []), "canvas", "pdfjs-dist"];
    }

    // Ensure pdfjs-dist is handled correctly
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    const mjsPattern = /\.m?js$/;
    config.module.rules.push({
      test: mjsPattern,
      type: "javascript/auto",
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
};

export default withMDX(config);
