import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/mentor/apply"],
        disallow: [
          "/admin",
          "/dashboard",
          "/mentor/",
          "/parent",
          "/school",
          "/supervisor",
          "/profile",
          "/chat",
          "/support",
          "/session",
          "/booking",
          "/onboarding",
          "/placement",
          "/matching",
          "/checkout",
          "/pay",
          "/invoice",
          "/login",
          "/api",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
