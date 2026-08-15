"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function Footer() {
  const [status, setStatus] = useState("");

  return (
    <footer id="contact" className="bg-flora-cream text-flora-cream">
      <div className="relative z-10 mx-auto aspect-[1.9] w-[min(900px,calc(100%-40px))] overflow-hidden border-[14px] border-flora-ivory shadow-soft sm:border-[18px]">
        <Image src="/images/florence-night.jpg" alt="A warmly illuminated Florentine facade at night, editorial placeholder" fill sizes="(min-width: 900px) 900px, 94vw" className="object-cover" />
      </div>

      <div className="textured -mt-[clamp(4rem,10vw,7rem)] bg-flora-powder px-5 pb-16 pt-[clamp(7rem,16vw,12rem)]">
        <div className="mx-auto max-w-[1080px]">
          <p className="text-center font-sans text-[0.58rem] uppercase tracking-[0.12em] text-flora-cream/92">FLORA · [FLORA PALAZZO ADDRESS] · FIRENZE · [RESERVATIONS PHONE] · [RESERVATIONS EMAIL]</p>
          <div className="mt-16 grid items-end gap-12 lg:grid-cols-[1fr_auto]">
            <form className="max-w-2xl" onSubmit={(event) => { event.preventDefault(); setStatus("Newsletter demo only — no subscription was created."); }}>
              <label htmlFor="newsletter" className="font-display text-[clamp(2rem,4vw,3.5rem)] uppercase leading-none tracking-[0.03em]">Subscribe to our newsletter</label>
              <div className="mt-7 flex border-b border-flora-cream/65">
                <input id="newsletter" suppressHydrationWarning required type="email" className="min-h-12 flex-1 bg-transparent py-2 outline-none placeholder:text-flora-cream/62" placeholder="Your email" />
                <button type="submit" className="eyebrow px-4">Subscribe <span aria-hidden="true">→</span></button>
              </div>
              <label className="mt-5 flex max-w-xl items-start gap-3 font-sans text-[0.55rem] leading-relaxed tracking-[0.07em] text-flora-cream/80"><input required type="checkbox" className="mt-1 accent-flora-navy" />I agree to receive editorial news once the final privacy policy and mailing provider are connected.</label>
              {status ? <p className="mt-4 text-sm" role="status">{status}</p> : null}
            </form>
            <div className="text-center lg:text-left">
              <p className="font-display text-2xl">Follow us</p>
              <div className="mt-4 flex justify-center gap-3 lg:justify-start">
                <span className="grid size-11 place-items-center rounded-full border border-flora-cream/55 font-sans text-xs" aria-label="Instagram link placeholder">IG</span>
                <span className="grid size-11 place-items-center rounded-full border border-flora-cream/55 font-sans text-xs" aria-label="Pinterest link placeholder">PI</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="legal" className="bg-flora-espresso px-5 py-6">
        <div className="mx-auto flex max-w-[1080px] flex-col justify-between gap-5 font-sans text-[0.52rem] uppercase tracking-[0.12em] text-flora-cream/68 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Flora — concept website. Property facts and contacts to be supplied.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2"><Link href="/#legal" className="hover:text-flora-cream">Privacy policy [to add]</Link><Link href="/#legal" className="hover:text-flora-cream">Cookies [to add]</Link><Link href="/#palace" className="hover:text-flora-cream">Sitemap</Link></div>
        </div>
      </div>
    </footer>
  );
}
