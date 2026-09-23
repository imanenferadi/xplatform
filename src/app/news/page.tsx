import Link from "next/link";
import { Newspaper } from "lucide-react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { newsArticles } from "@/lib/mock-data";

export const metadata = { title: "اخبار" };

export default function NewsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-[800px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-10 flex items-center gap-2">
            <Newspaper size={22} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-text-900 md:text-[32px]">اخبار</h1>
          </div>

          <div className="space-y-4">
            {newsArticles.map((a) => (
              <Link key={a.slug} href={`/news/${a.slug}`}>
                <Card interactive>
                  <CardContent>
                    <div className="mb-2 flex items-center gap-2">
                      <Badge tone="info">{a.category}</Badge>
                      <span className="text-xs text-text-500">{a.date}</span>
                    </div>
                    <h2 className="mb-1.5 font-bold text-text-900">{a.title}</h2>
                    <p className="text-sm leading-[1.75] text-text-500">{a.excerpt}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
