import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ViewAsBoot } from "@/components/app/SupportView";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "X — همراه هوشمند کنکور",
    template: "%s | X",
  },
  description:
    "اول بفهم کجایی، بعد برس به کسی که این مسیر رو رفته. تعیین سطح هوشمند، تطبیق با مشاور رتبه‌برتر، و ابزارهای مطالعه در یک پلتفرم.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#09111f" },
  ],
};

// Runs before paint to avoid a light/dark flash — reads the stored
// preference (if any) and applies it as data-theme on <html>.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("x-theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-text-700 antialiased">
        {/* next/script, not a raw <script>: React warns about raw script tags
            rendered on the client; beforeInteractive still runs before
            hydration, so there's no light/dark flash. */}
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ViewAsBoot />
        {children}
      </body>
    </html>
  );
}
