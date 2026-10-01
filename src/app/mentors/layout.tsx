import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { pageMetadata } from "@/lib/seo";

// `title.template` keeps «| Matriss» on every profile under /mentors; a plain
// string title here would drop the template inherited from the root layout.
export const metadata: Metadata = {
  ...pageMetadata(
    "مشاوران رتبه‌برتر",
    "فهرست مشاورهای رتبه‌برتر کنکور با رتبه، دانشگاه، سبک مشاوره، امتیاز و ظرفیت خالی. رتبه‌ی همه با کارنامه احراز شده و جلسه‌ی آشنایی رایگانه.",
    "/mentors",
  ),
  title: { default: "مشاوران رتبه‌برتر", template: `%s | ${BRAND}` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
