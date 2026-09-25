import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://rickandmortyapi.com/api/character/avatar/**")],
  },
};

export default nextConfig;
