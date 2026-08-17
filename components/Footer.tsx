"use client";

import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer id="contact" className="bg-flora-cream text-flora-cream">
      {/* Hero image */}
      <div className="relative z-10 mx-auto aspect-[1.9] w-[min(900px,calc(100%-40px))] overflow-hidden border-[14px] border-flora-ivory shadow-soft sm:border-[18px]">
        <Image
          src="/images/florence-night.jpg"
          alt="A warmly illuminated Florentine facade at night, editorial placeholder"
          fill
          sizes="(min-width: 900px) 900px, 94vw"
          className="object-cover"
        />
      </div>

      {/* Main footer band */}
      <div className="textured -mt-[clamp(4rem,10vw,7rem)] bg-flora-powder px-5 pb-20 pt-[clamp(7rem,16vw,12rem)]">
        <div className="mx-auto max-w-[1080px] flex flex-col items-center gap-12">

          {/* Contact line */}
          <p className="text-center font-sans text-[0.58rem] uppercase tracking-[0.12em] text-flora-cream/92">
            FLORA · [FLORA PALAZZO ADDRESS] · FIRENZE · [RESERVATIONS PHONE] · [RESERVATIONS EMAIL]
          </p>

          {/* Wordmark divider */}
          <p className="font-display text-[clamp(2.5rem,6vw,5rem)] uppercase leading-none tracking-[0.06em] text-center select-none">
            Flora
          </p>

          {/* Social / Follow */}
          <div className="flex flex-col items-center gap-5">
            <p className="font-display text-2xl">Follow us</p>
            <div className="flex justify-center gap-3">
              <span
                className="grid size-11 place-items-center rounded-full border border-flora-cream/55 font-sans text-xs"
                aria-label="Instagram link placeholder"
              >
                IG
              </span>
              <span
                className="grid size-11 place-items-center rounded-full border border-flora-cream/55 font-sans text-xs"
                aria-label="Pinterest link placeholder"
              >
                PI
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Legal bar */}
      <div id="legal" className="bg-flora-espresso px-5 py-6">
        <div className="mx-auto flex max-w-[1080px] flex-col justify-between gap-5 font-sans text-[0.52rem] uppercase tracking-[0.12em] text-flora-cream/68 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Flora — concept website. Property facts and contacts to be supplied.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/#legal" className="hover:text-flora-cream">Privacy policy [to add]</Link>
            <Link href="/#legal" className="hover:text-flora-cream">Cookies [to add]</Link>
            <Link href="/#palace" className="hover:text-flora-cream">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
