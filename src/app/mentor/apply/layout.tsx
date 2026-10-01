import { pageMetadata } from "@/lib/seo";

// Public page inside the otherwise private /mentor area.
export const metadata = {
  ...pageMetadata(
    "مشاور شو",
    "اگر رتبه‌برتر کنکور هستی، مشاور ماتریس شو: رتبه‌ات با کارنامه احراز می‌شه، خودت ظرفیت و زمان‌هات رو تعیین می‌کنی و درآمد ماهانه داری.",
    "/mentor/apply",
  ),
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
