import type { MetadataRoute } from "next";

// Allow all crawlers across the whole site and point them at the sitemap.
// Host matches the canonical custom domain used by the sitemap.
const BASE_URL = "https://v1.aitransforms.ir" as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
