import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        /* 3D chamber textures. The folder is versioned (v1), so they can be cached forever;
           ship changed textures under a new version folder instead of overwriting. */
        source: "/sadan/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      }
    ];
  }
};

export default nextConfig;
