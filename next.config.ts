import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "current-rms.s3.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
