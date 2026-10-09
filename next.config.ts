import { readdirSync } from "node:fs";
import type { NextConfig } from "next";

/* the article slugs are the file names in content/articles (same rule as isArticleFile there) */
const articleSlugs = readdirSync("content/articles")
  .filter((f) => f.endsWith(".md") && !f.startsWith("_") && f !== "README.md")
  .map((f) => f.slice(0, -3));

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
      ...articleSlugs.map((slug) => ({ source: `/${slug}`, destination: `/articles/${slug}`, permanent: true })),
      { source: "/features", destination: "/how-we-work#modules", permanent: true },
      { source: "/roadmap", destination: "/how-we-work#roadmap", permanent: true }
    ];
  }
};

export default nextConfig;
