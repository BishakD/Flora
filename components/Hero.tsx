"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
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

type HeroProps = { poster: string; videoSrc?: string };

export function Hero({ poster, videoSrc }: HeroProps) {
  const reduced = useReducedMotion();
  const hero = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const [intro, setIntro] = useState(!reduced);
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
      <section ref={hero} className="relative mt-[var(--nav-height)] min-h-[calc(100svh-var(--nav-height))] overflow-hidden bg-flora-navy" aria-label="Flora in Florence">
        <motion.div ref={media} className="absolute -inset-x-[3%] -inset-y-[6%] will-change-transform" initial={reduced ? false : { opacity: 0, scale: 1.025 }} animate={{ opacity: 1, scale: reduced ? 1 : 1.045 }} transition={{ opacity: { duration: 0.6, delay }, scale: { duration: 12, delay, ease: "linear" } }}>
          {useVideo ? <video className="size-full object-cover" src={videoSrc} poster={poster} autoPlay muted loop playsInline preload="metadata" onError={() => setVideoFailed(true)} aria-label="Flora palazzo film" /> : <Image src={poster} alt="Florence illuminated at blue hour, an editorial placeholder for Flora's future hero film" fill preload sizes="100vw" className="object-cover" />}
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,42,63,.04),rgba(27,42,63,.08)_58%,rgba(27,42,63,.52))]" />
        <motion.div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-flora-cream" initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: delay + 0.55, ease: [0.22, 1, 0.36, 1] }}>
          <span className="font-display text-[clamp(2.6rem,5.5vw,4.8rem)] tracking-[0.06em] drop-shadow-[0_3px_18px_rgba(27,42,63,.3)]">FLORA</span>
          <span className="mt-2 font-sans text-[0.52rem] uppercase tracking-[0.3em] text-flora-cream/85">A boutique palazzo · Firenze</span>
        </motion.div>
        <motion.div className="absolute bottom-10 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-flora-cream/78 md:flex" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 1.1 }} aria-hidden="true"><span className="grid size-9 place-items-center rounded-full border border-flora-cream/55">↓</span><span className="eyebrow text-[0.48rem]">Scroll down</span></motion.div>
      </section>
    </>
  );
}
