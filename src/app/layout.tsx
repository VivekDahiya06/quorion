import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

/* eslint-disable @next/next/no-page-custom-font -- App Router fonts are loaded globally here. */

export const metadata: Metadata = {
  title: "Quorion — Studio quotation desk",
  description:
    "Build a thoughtful creative-services quotation with a live INR estimate and downloadable PDF.",
  openGraph: {
    title: "Quorion — Studio quotation desk",
    description:
      "Build a thoughtful creative-services quotation with a live INR estimate and downloadable PDF.",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", "font-sans")}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Space+Grotesk:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
