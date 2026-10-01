import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const columns = [
  {
    title: "محصول",
    links: [
      { label: "چرا ماتریس", href: "/#features" },
      { label: "تعرفه‌ها", href: "/#pricing" },
      { label: "مشاوران", href: "/mentors" },
    ],
  },
  {
    title: "همکاری",
    links: [
      { label: "مشاور شو", href: "/mentor/apply" },
      { label: "مدارس و آموزشگاه‌ها", href: "/school" },
      { label: "اخبار کنکور", href: "/news" },
    ],
  },
  {
    title: "پشتیبانی",
    links: [
      { label: "راهنما و سؤالات متداول", href: "/help" },
      { label: "تماس با پشتیبانی", href: "/support" },
      { label: "قوانین و حریم خصوصی", href: "/privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 md:grid-cols-[1.2fr_2fr] md:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-text-500">
            دستیار هوشمند مطالعه و کنکور — مشاور رتبه‌برتر واقعی، به‌علاوه‌ی
            ابزار هوشمند.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {columns.map((c) => (
            <div key={c.title}>
              <h4 className="mb-3 text-sm font-semibold text-text-900">
                {c.title}
              </h4>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-text-500 hover:text-text-900"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-text-500">
        © ۱۴۰۵ تمامی حقوق برای ماتریس محفوظ است.
      </div>
    </footer>
  );
}
