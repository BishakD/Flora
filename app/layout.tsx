import type { Metadata } from "next";
import { Cormorant_Garamond, Italianno, Montserrat } from "next/font/google";
import { InertialScroll } from "@/components/InertialScroll";
import { Nav } from "@/components/Nav";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const italianno = Italianno({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://flora-palazzo.example"),
  title: {
    default: "Flora | A Boutique Palazzo in Florence",
    template: "%s | Flora Florence",
  },
  description:
    "Flora is an intimate boutique-hotel concept in Florence, imagined as a romantic dialogue between palazzo history and contemporary Italian hospitality.",
  openGraph: {
    title: "Flora — A Boutique Palazzo in Florence",
    description: "A quiet, romantic stay in the historic heart of Florence.",
    images: ["/images/hero-palazzo.jpg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${cormorant.variable} ${italianno.variable} ${montserrat.variable}`}>
      <head>
        {/* Warm up the Supabase connection before any server fetch fires */}
        <link rel="preconnect" href="https://aefyypoishtuaidzjcmb.supabase.co" />
      </head>
      <body suppressHydrationWarning>
        {/* Global SVG clip-path for smooth Florentine arch frames */}
        <svg width="0" height="0" className="absolute pointer-events-none opacity-0" aria-hidden="true">
          <defs>
            <clipPath id="flora-arch-clip" clipPathUnits="objectBoundingBox">
              <path d="M 0.5 0.0308 C 0.632 0.0308 0.74 0.0985 0.74 0.1846 C 0.74 0.2015 0.754 0.2115 0.775 0.2115 L 0.865 0.2115 C 0.93 0.2115 0.98 0.2385 0.98 0.2885 L 0.98 0.9577 Q 0.98 0.9846 0.945 0.9846 L 0.055 0.9846 Q 0.02 0.9846 0.02 0.9577 L 0.02 0.2885 C 0.02 0.2385 0.07 0.2115 0.135 0.2115 L 0.225 0.2115 C 0.246 0.2115 0.26 0.2015 0.26 0.1846 C 0.26 0.0985 0.368 0.0308 0.5 0.0308 Z" />
            </clipPath>
          </defs>
        </svg>

        <InertialScroll />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <Nav />
        {children}
      </body>
    </html>
  );
}
