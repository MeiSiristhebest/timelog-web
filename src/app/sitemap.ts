import type { MetadataRoute } from "next";
import { routes } from "@/lib/routes";
import { getSiteUrl } from "@/lib/site";

const STATIC_ROUTES = [routes.login] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const siteUrl = getSiteUrl();

  return STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === routes.login ? 0.6 : 0.4,
  }));
}
