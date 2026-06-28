import type { MetadataRoute } from "next";

// Static sitemap for the six public, statically-generated routes.
// Kept as an explicit array (not derived) so the file is trivial to audit
// against the deployed routes. The canonical host is the custom domain
// `v1.aitransforms.ir`; the default Vercel URL is intentionally not listed.
const BASE_URL = "https://v1.aitransforms.ir" as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/fa`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/ar`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/apply`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/fa/apply`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/ar/apply`, changeFrequency: "monthly", priority: 0.7 },
  ];
}
