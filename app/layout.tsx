import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import { getOrCreateUser, userStats } from "@/lib/data";
import { claimableRoots } from "@/lib/rewards";
import { pageBackground } from "@/data/shop";
import ThemeScene from "@/components/theme-scene";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "WordForge — Forge Your Vocabulary",
  description: "Grow an erudite vocabulary one word tree at a time.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WordForge",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "WordForge — Forge Your Vocabulary",
    description: "Grow an erudite vocabulary one word tree at a time.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f59e0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const user = getOrCreateUser();
  const stats = userStats(user.id);
  const treeRewards = claimableRoots(user.id).length;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="relative min-h-full flex flex-col">
        <div aria-hidden className="fixed inset-0 -z-20" style={{ background: pageBackground(user.background) }} />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <ThemeScene backgroundId={user.background} avatar={user.avatar} />
        </div>
        <Nav dueCount={stats.due} coins={user.coins} treeRewards={treeRewards} />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-24 pt-8">{children}</main>
      </body>
    </html>
  );
}
