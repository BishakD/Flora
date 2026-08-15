"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BookingBar } from "./BookingBar";
import { BrandMark } from "./BrandMark";

function BrandIntro({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 1760);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="botanical fixed inset-0 z-[120] grid place-items-center bg-flora-blue text-flora-cream"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
      transition={{ duration: 0.62, ease: [0.76, 0, 0.24, 1] }}
      aria-hidden="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: [0, 1, 1], scale: [0.92, 1, 1.42] }}
        transition={{ duration: 1.7, times: [0, 0.58, 1], ease: [0.22, 1, 0.36, 1] }}
      >
        <BrandMark label inverse className="text-flora-cream" />
      </motion.div>
    </motion.div>
  );
}

type HeroProps = {
  poster: string;
  videoSrc?: string;
};

export function Hero({ poster, videoSrc }: HeroProps) {
  const reduced = useReducedMotion();
  const hero = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const [intro, setIntro] = useState(!reduced);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    if (reduced) setIntro(false);
  }, [reduced]);

  useEffect(() => {
    if (!intro) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [intro]);

  useEffect(() => {
    if (!hero.current || !media.current || reduced) return;
    let cleanup = () => undefined;

    void (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (!hero.current || !media.current) return;
      const tween = gsap.to(media.current, {
        yPercent: 20,
        ease: "none",
        scrollTrigger: { trigger: hero.current, start: "top top", end: "bottom top", scrub: 0.5 },
      });
      cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => cleanup();
  }, [reduced]);

  const useVideo = Boolean(videoSrc && !reduced && !videoFailed);
  const entranceDelay = reduced ? 0 : 1.48;

  return (
    <>
      <AnimatePresence>{intro ? <BrandIntro onComplete={() => setIntro(false)} /> : null}</AnimatePresence>
      <section ref={hero} className="relative mt-[var(--nav-height)] min-h-[max(760px,calc(100svh-var(--nav-height)))] overflow-visible bg-flora-navy" aria-label="Flora in Florence">
        <motion.div
          ref={media}
          className="absolute -inset-x-[3%] -inset-y-[5%] will-change-transform"
          initial={reduced ? false : { opacity: 0, scale: 1.035 }}
          animate={{ opacity: 1, scale: reduced ? 1 : 1.055 }}
          transition={{ opacity: { duration: 0.9, delay: entranceDelay }, scale: { duration: 11, delay: entranceDelay, ease: "linear" } }}
        >
          {useVideo ? (
            <video
              className="size-full object-cover"
              src={videoSrc}
              poster={poster}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onError={() => setVideoFailed(true)}
              aria-label="Flora palazzo film"
            />
          ) : (
            <Image src={poster} alt="Florence illuminated at blue hour, an editorial placeholder for Flora's future hero film" fill priority sizes="100vw" className="object-cover" />
          )}
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,42,63,0.05)_12%,rgba(27,42,63,0.18)_50%,rgba(27,42,63,0.68)_100%)]" />

        <div className="relative z-10 flex min-h-[max(760px,calc(100svh-var(--nav-height)))] flex-col items-center justify-center px-5 pb-32 pt-20 text-center text-flora-cream md:pb-28">
          <motion.p
            className="eyebrow mb-5 text-flora-cream/80"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: entranceDelay + 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            A boutique palazzo · Florence, Italy
          </motion.p>
          <motion.h1
            className="font-display text-[clamp(5rem,15vw,11.5rem)] font-normal leading-[0.72] tracking-[-0.045em] drop-shadow-[0_8px_28px_rgba(27,42,63,0.24)]"
            initial={reduced ? false : { opacity: 0, y: 28, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.05, delay: entranceDelay + 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            Flora
          </motion.h1>
          <motion.p
            className="mt-8 max-w-md font-body text-[clamp(1.1rem,2.3vw,1.5rem)] leading-relaxed text-flora-cream/88"
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: entranceDelay + 0.95, ease: [0.22, 1, 0.36, 1] }}
          >
            A restored palazzo, imagined as a quiet love letter to Florence.
          </motion.p>
        </div>

        <motion.div
          className="absolute inset-x-0 bottom-0 z-20 mx-auto w-[min(1180px,calc(100%-28px))] translate-y-1/2"
          initial={reduced ? false : { opacity: 0, y: 46 }}
          animate={{ opacity: 1, y: "50%" }}
          transition={{ duration: 0.9, delay: entranceDelay + 1.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <BookingBar />
        </motion.div>

        <motion.div
          className="absolute bottom-28 left-7 z-10 hidden items-center gap-3 text-flora-cream/75 md:flex"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: entranceDelay + 1.5 }}
          aria-hidden="true"
        >
          <span className="h-10 w-px bg-flora-cream/55" />
          <span className="eyebrow text-[0.52rem] [writing-mode:vertical-rl]">Scroll slowly</span>
        </motion.div>
      </section>
    </>
  );
}
