import type { NextConfig } from "next";
import { articles } from "./content/articles";

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
  },
  /* setuk.org served the guides at the root and had separate features and roadmap pages;
     keep those addresses (and their search ranking) working */
  async redirects() {
    return [
      ...articles.map((a) => ({ source: `/${a.slug}`, destination: `/articles/${a.slug}`, permanent: true })),
      { source: "/features", destination: "/how-we-work#modules", permanent: true },
      { source: "/roadmap", destination: "/how-we-work#roadmap", permanent: true }
    ];
  }
};

export default nextConfig;
