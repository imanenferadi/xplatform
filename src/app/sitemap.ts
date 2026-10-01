import type { MetadataRoute } from "next";
import { mentors, newsArticles } from "@/lib/mock-data";
import { SITE_URL } from "@/lib/seo";

// Public pages only. Approved mentors who register later live in the
// browser demo store, so they appear here once there is a real database.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (
    path: string,
    priority: number,
    changeFrequency: "daily" | "weekly" | "monthly" = "weekly",
  ) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1, "daily"),
    page("/mentors", 0.9, "daily"),
    page("/pricing", 0.8),
    ...mentors.map((m) => page(`/mentors/${m.id}`, 0.7)),
    page("/news", 0.6, "daily"),
    ...newsArticles.map((a) => page(`/news/${a.slug}`, 0.5, "monthly")),
    page("/help", 0.5, "monthly"),
    page("/mentor/apply", 0.5, "monthly"),
    page("/privacy", 0.3, "monthly"),
  ];
}
