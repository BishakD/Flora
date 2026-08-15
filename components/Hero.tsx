"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookingBar } from "./BookingBar";
import { BrandMark } from "./BrandMark";

function BrandIntro({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 2700);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div className="loader-cloud fixed inset-0 z-[120] grid place-items-center overflow-hidden bg-[#8FA8BB] text-flora-cream" initial={{ opacity: 1 }} exit={{ opacity: 0, filter: "blur(10px)" }} transition={{ duration: 0.46, ease: [0.76, 0, 0.24, 1] }} aria-hidden="true">
      <div className="absolute inset-0 opacity-55">{Array.from({ length: 18 }, (_, index) => <span key={index} className="loader-speck" style={{ left: `${(index * 37) % 96}%`, top: `${(index * 53) % 91}%`, animationDelay: `${(index % 7) * 180}ms` }} />)}</div>
      <motion.div className="flex flex-col items-center" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: [0, 1, 1], scale: [0.92, 1, 3.8], filter: ["blur(4px)", "blur(0px)", "blur(5px)"] }} transition={{ duration: 2.65, times: [0, 0.68, 1], ease: [0.22, 1, 0.36, 1] }}>
        <BrandMark inverse />
        <span className="mt-3 font-display text-[2.1rem] tracking-[0.08em]">FLORA</span>
        <span className="mt-2 font-sans text-[0.44rem] uppercase tracking-[0.36em]">Firenze</span>
      </motion.div>
    </motion.div>
  );
}

function OpeningNotice({ onClose }: { onClose: () => void }) {
  return (
    <motion.aside className="absolute left-1/2 top-1/2 z-30 w-[min(430px,calc(100%-34px))] -translate-x-1/2 -translate-y-1/2 bg-flora-ivory p-4 text-flora-charcoal shadow-lift" initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.99 }} transition={{ duration: 0.35 }} aria-label="Flora opening notice">
      <div className="ornamental-panel relative grid min-h-[340px] place-items-center border border-flora-line px-8 py-10 text-center">
        <button type="button" onClick={onClose} className="absolute -right-11 -top-6 grid size-9 place-items-center rounded-full border border-flora-cream/65 text-flora-cream" aria-label="Close opening notice">×</button>
        <div>
          <BrandMark className="mx-auto" />
          <p className="mt-6 font-display text-[clamp(1.45rem,4vw,2rem)] uppercase tracking-[0.04em]">Opening date to be announced</p>
          <svg aria-hidden="true" className="mx-auto mt-8 text-flora-blue/35" width="64" height="76" viewBox="0 0 64 76" fill="none"><path d="M31 72C31 43 30 24 40 7M31 55C21 52 15 46 12 37c10-1 18 2 23 9M34 38c11-3 18-9 21-18-10-1-18 2-23 10M37 22c-7-5-10-11-8-18 8 2 13 7 15 15" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
        </div>
      </div>
    </motion.aside>
  );
}

type HeroProps = { poster: string; videoSrc?: string };

export function Hero({ poster, videoSrc }: HeroProps) {
  const reduced = useReducedMotion();
  const hero = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const [intro, setIntro] = useState(!reduced);
  const [notice, setNotice] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const finishIntro = useCallback(() => setIntro(false), []);

  useEffect(() => { if (reduced) setIntro(false); }, [reduced]);
  useEffect(() => {
    if (!intro) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [intro]);
  useEffect(() => {
    if (intro || reduced) return;
    const show = window.setTimeout(() => setNotice(true), 2200);
    const hide = window.setTimeout(() => setNotice(false), 5900);
    return () => { window.clearTimeout(show); window.clearTimeout(hide); };
  }, [intro, reduced]);
  useEffect(() => {
    if (!hero.current || !media.current || reduced) return;
    let cleanup = () => undefined;
    void (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (!hero.current || !media.current) return;
      const tween = gsap.to(media.current, { yPercent: 18, ease: "none", scrollTrigger: { trigger: hero.current, start: "top top", end: "bottom top", scrub: 0.55 } });
      cleanup = () => { tween.scrollTrigger?.kill(); tween.kill(); };
    });
    return () => cleanup();
  }, [reduced]);

  const useVideo = Boolean(videoSrc && !reduced && !videoFailed);
  const delay = reduced ? 0 : 2.58;

  return (
    <>
      <AnimatePresence>{intro ? <BrandIntro onComplete={finishIntro} /> : null}</AnimatePresence>
      <section ref={hero} className="relative mt-[var(--nav-height)] min-h-[calc(100svh-var(--nav-height))] overflow-visible bg-flora-navy" aria-label="Flora in Florence">
        <motion.div ref={media} className="absolute -inset-x-[3%] -inset-y-[6%] will-change-transform" initial={reduced ? false : { opacity: 0, scale: 1.025 }} animate={{ opacity: 1, scale: reduced ? 1 : 1.045 }} transition={{ opacity: { duration: 0.6, delay }, scale: { duration: 12, delay, ease: "linear" } }}>
          {useVideo ? <video className="size-full object-cover" src={videoSrc} poster={poster} autoPlay muted loop playsInline preload="metadata" onError={() => setVideoFailed(true)} aria-label="Flora palazzo film" /> : <Image src={poster} alt="Florence illuminated at blue hour, an editorial placeholder for Flora's future hero film" fill preload sizes="100vw" className="object-cover" />}
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,42,63,.04),rgba(27,42,63,.08)_58%,rgba(27,42,63,.52))]" />
        <AnimatePresence>{notice ? <OpeningNotice onClose={() => setNotice(false)} /> : null}</AnimatePresence>
        <motion.div className="absolute inset-x-0 bottom-[9.5rem] z-10 flex flex-col items-center text-center text-flora-cream" initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: delay + 0.55, ease: [0.22, 1, 0.36, 1] }}>
          <span className="font-display text-[clamp(2.6rem,5.5vw,4.8rem)] tracking-[0.06em] drop-shadow-[0_3px_18px_rgba(27,42,63,.3)]">FLORA</span>
          <span className="mt-2 font-sans text-[0.52rem] uppercase tracking-[0.3em] text-flora-cream/85">A boutique palazzo · Firenze</span>
        </motion.div>
        <motion.div className="absolute inset-x-0 bottom-0 z-20 mx-auto w-[min(1080px,calc(100%-32px))] translate-y-1/2" initial={reduced ? false : { opacity: 0, y: 42 }} animate={{ opacity: 1, y: "50%" }} transition={{ duration: 0.8, delay: delay + 0.85, ease: [0.22, 1, 0.36, 1] }}><BookingBar /></motion.div>
        <motion.div className="absolute bottom-24 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-flora-cream/78 md:flex" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 1.1 }} aria-hidden="true"><span className="grid size-9 place-items-center rounded-full border border-flora-cream/55">↓</span><span className="eyebrow text-[0.48rem]">Scroll down</span></motion.div>
      </section>
    </>
  );
}
