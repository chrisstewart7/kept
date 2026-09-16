import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { DOCS } from "@/content/docs";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/explore",
    "/payments",
    "/analytics",
    "/launch",
    "/flow",
    "/kept",
    "/docs",
    "/legal/terms",
    "/legal/privacy",
    "/legal/disclosures",
  ].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "hourly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  const docRoutes = DOCS.filter((d) => d.slug !== "overview").map((d) => ({
    url: `${SITE_URL}/docs/${d.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));
  return [...staticRoutes, ...docRoutes];
}
