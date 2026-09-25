import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio.example.com"),
  title: {
    default: "Портфолио full-stack разработчика",
    template: "%s | Портфолио разработчика",
  },
  description: "Демонстрационное портфолио full-stack разработчика на Next.js, TypeScript и Docker.",
  keywords: ["full-stack разработчик", "Next.js", "TypeScript", "Docker", "портфолио"],
  authors: [{ name: "Portfolio Developer", url: "https://portfolio.example.com" }],
  creator: "Portfolio Developer",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: "Портфолио разработчика",
    title: "Full-stack разработка и инфраструктура",
    description: "Проекты на стыке интерфейсов, API, серверной инфраструктуры и эксплуатации.",
  },
  twitter: {
    card: "summary",
    title: "Full-stack разработка и инфраструктура",
    description: "Проекты на стыке интерфейсов, API, серверной инфраструктуры и эксплуатации.",
  },
  robots: { index: true, follow: true },
};

const personStructuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Portfolio Developer",
  url: "https://portfolio.example.com",
  jobTitle: "Full-stack разработчик",
  sameAs: ["https://github.com/your-username/"],
  knowsAbout: ["Full-stack разработка", "Next.js", "TypeScript", "Docker", "Серверная инфраструктура", "Техническая поддержка"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personStructuredData) }}
        />
        <a
          href="#main-content"
          className="fixed left-4 top-3 z-[60] -translate-y-20 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-transform focus:translate-y-0"
        >
          Перейти к содержимому
        </a>
        <ThemeProvider>
          <AnimatedBackground />
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1 outline-none">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
