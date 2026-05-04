import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "current-rms.s3.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.rentant.co.uk",
        pathname: "/media/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/rentals/:slug*",
        destination: "https://shop.accelrentals.com/categories",
        permanent: true,
      },
      {
        source: "/search",
        destination: "https://shop.accelrentals.com/categories",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
