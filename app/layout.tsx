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
      <body suppressHydrationWarning>
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
