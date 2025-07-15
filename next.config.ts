import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "wazilrest-wordpress.xwk85y.easypanel.host",
      },
      {
        protocol: "https",
        hostname: "wazilrest-strapi.xwk85y.easypanel.host",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
     {
        protocol: "https",
        hostname: "content.wazilrest.com",
      },
    ],
  },
};

export default nextConfig;
