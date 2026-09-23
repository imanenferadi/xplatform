import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { Badge } from "@/components/ui/Badge";
import { newsArticles } from "@/lib/mock-data";

export function generateStaticParams() {
  return newsArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = newsArticles.find((a) => a.slug === slug);
  return { title: article?.title ?? "اخبار" };
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = newsArticles.find((a) => a.slug === slug);
  if (!article) notFound();

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-[720px] px-4 py-12 md:px-8 md:py-16">
          <Link href="/news" className="mb-6 flex items-center gap-1.5 text-sm text-text-500 hover:text-text-900">
            <ArrowRight size={16} />
            بازگشت به اخبار
          </Link>

          <div className="mb-3 flex items-center gap-2">
            <Badge tone="info">{article.category}</Badge>
            <span className="text-xs text-text-500">{article.date}</span>
          </div>

          <h1 className="mb-6 text-2xl font-bold text-text-900 md:text-[32px]">{article.title}</h1>

          <p className="text-base leading-[2] text-text-700">{article.body}</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
