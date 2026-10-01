import { noIndex } from "@/lib/seo";

// Signed-in area: not for search results.
export const metadata = noIndex;

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
