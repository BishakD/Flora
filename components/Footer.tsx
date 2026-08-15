"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "./BrandMark";

export function Footer() {
  const [status, setStatus] = useState("");

  return (
    <footer id="contact" className="text-flora-cream">
      <div className="relative min-h-[420px] overflow-hidden">
        <Image src="/images/florence-night.jpg" alt="A warmly illuminated Florentine street at night, editorial placeholder" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-flora-navy/50" />
        <div className="relative z-10 mx-auto flex min-h-[420px] w-[min(100%-36px,980px)] flex-col items-center justify-center py-20 text-center">
          <BrandMark inverse className="text-flora-cream" />
          <p className="eyebrow mt-6 text-flora-cream/70">Flora · Firenze</p>
          <h2 className="mt-4 font-display text-[clamp(2.8rem,7vw,6rem)] leading-[0.92]">A palazzo to return to</h2>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-flora-cream/85">[FLORA PALAZZO ADDRESS], Florence, Italy · [RESERVATIONS PHONE] · [RESERVATIONS EMAIL]</p>
        </div>
      </div>

      <div className="textured bg-flora-blue px-5 py-14">
        <div className="mx-auto grid max-w-6xl items-end gap-10 lg:grid-cols-[1fr_auto]">
          <form
            className="max-w-2xl"
            onSubmit={(event) => {
              event.preventDefault();
              setStatus("Newsletter demo only — no subscription was created.");
            }}
          >
            <label htmlFor="newsletter" className="font-display text-[clamp(2rem,4vw,3.4rem)] leading-none">Subscribe to our newsletter</label>
            <div className="mt-6 flex border-b border-flora-cream/55">
              <input id="newsletter" required type="email" className="min-h-12 flex-1 bg-transparent py-2 text-flora-cream outline-none placeholder:text-flora-cream/55" placeholder="Your email address" />
              <button type="submit" className="eyebrow px-4">Subscribe <span aria-hidden="true">→</span></button>
            </div>
            <label className="mt-5 flex max-w-xl items-start gap-3 font-sans text-[0.58rem] leading-relaxed tracking-[0.07em] text-flora-cream/75">
              <input required type="checkbox" className="mt-1 accent-flora-navy" />
              I agree to receive editorial news once the final privacy policy and mailing provider are connected.
            </label>
            {status ? <p className="mt-4 text-sm" role="status">{status}</p> : null}
          </form>
          <div>
            <p className="font-display text-2xl">Follow us</p>
            <div className="mt-4 flex gap-3">
              <span className="grid size-11 place-items-center rounded-full border border-flora-cream/45 font-sans text-xs" aria-label="Instagram link placeholder">IG</span>
              <span className="grid size-11 place-items-center rounded-full border border-flora-cream/45 font-sans text-xs" aria-label="Pinterest link placeholder">PI</span>
            </div>
          </div>
        </div>
      </div>

      <div id="legal" className="bg-flora-espresso px-5 py-7">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 font-sans text-[0.55rem] uppercase tracking-[0.12em] text-flora-cream/65 md:flex-row md:items-center">
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
