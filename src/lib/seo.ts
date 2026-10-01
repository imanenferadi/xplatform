import type { Metadata } from "next";
import { BRAND } from "./brand";

// Set NEXT_PUBLIC_SITE_URL in production; it makes share links and the
// sitemap absolute.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_TAGLINE = "همراه هوشمند کنکور";
export const SITE_DESCRIPTION =
  "مشاورت رو خودت انتخاب کن، از بین رتبه‌برترهای کنکور. رتبه‌ی همه‌ی مشاورها با کارنامه احراز شده؛ جلسه‌ی آشنایی رایگان، برنامه‌ی هفتگی از خود مشاور، و ضمانت ۷ روزه‌ی بازگشت وجه.";

const SHARE_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: `${BRAND} — مشاورت رو خودت انتخاب کن`,
};

/** Panels and flows that need a signed-in user: keep them out of search results. */
export const noIndex: Metadata = { robots: { index: false, follow: false } };

/** Per-page title, description and share card (the share image comes from the root opengraph-image). */
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${BRAND}`,
      description,
      url: path,
      type: "website",
    },
    twitter: { title: `${title} | ${BRAND}`, description },
  };
}
