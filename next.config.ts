import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        // Backend de production
        protocol: 'https',
        hostname: 'edoctor-api.onrender.com',
        pathname: '/**',
      },
      {
        // Backend local en développement
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/**',
      },
      {
        // Backend local hostname alternatif
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
