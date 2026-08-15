"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

type ScrollRevealTextProps = {
  children: string;
  className?: string;
  dark?: boolean;
};

export function ScrollRevealText({ children, className = "", dark = false }: ScrollRevealTextProps) {
  const root = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const words = children.split(/\s+/);

  useEffect(() => {
    if (!root.current || reduced) return;

    let cleanup = () => undefined;

    void (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (!root.current) return;

      const wordNodes = root.current.querySelectorAll<HTMLElement>("[data-reveal-word]");
      const desktop = window.matchMedia("(min-width: 768px)").matches;

      if (desktop) {
        gsap.set(wordNodes, { opacity: 0.12, filter: "blur(2.8px)" });
        const tween = gsap.to(wordNodes, {
          opacity: 1,
          filter: "blur(0px)",
          stagger: 0.055,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top 78%",
            end: "bottom 38%",
            scrub: 0.45,
            invalidateOnRefresh: true,
          },
        });
        cleanup = () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      } else {
        gsap.set(wordNodes, { opacity: 0.14, filter: "blur(2px)", y: 4 });
        const tween = gsap.to(wordNodes, {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          duration: 0.45,
          stagger: 0.028,
          ease: "power2.out",
          scrollTrigger: {
            trigger: root.current,
            start: "top 84%",
            once: true,
          },
        });
        cleanup = () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      }
    });

    return () => cleanup();
  }, [children, reduced]);

  return (
    <p ref={root} className={`${dark ? "text-flora-cream" : "text-flora-charcoal"} ${className}`}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} data-reveal-word className="inline-block will-change-[opacity,filter]">
          {word}
          {index < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </p>
  );
}

type SectionTitleScriptProps = {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
};

export function SectionTitleScript({ children, className = "", as = "h2" }: SectionTitleScriptProps) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={`script-title ${className}`}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.65 }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}

export function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 30 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

type MotionImageProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
};

export function ParallaxImage({
  src,
  alt,
  className = "",
  imageClassName = "",
  sizes = "100vw",
  priority = false,
}: MotionImageProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!wrap.current || !image.current || reduced) return;
    let cleanup = () => undefined;

    void (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (!wrap.current || !image.current) return;

      const parallax = gsap.fromTo(
        image.current,
        { yPercent: -6, scale: 1.02 },
        {
          yPercent: 6,
          scale: 1.045,
          ease: "none",
          scrollTrigger: { trigger: wrap.current, start: "top bottom", end: "bottom top", scrub: 0.6 },
        },
      );
      cleanup = () => {
        parallax.scrollTrigger?.kill();
        parallax.kill();
      };
    });

    return () => cleanup();
  }, [reduced]);

  return (
    <div ref={wrap} className={`relative overflow-hidden ${className}`}>
      <div ref={image} className="absolute -inset-[8%] will-change-transform">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${imageClassName}`} />
      </div>
    </div>
  );
}

export function BlurRevealImage({
  src,
  alt,
  className = "",
  imageClassName = "",
  sizes = "(min-width: 768px) 42vw, 92vw",
}: MotionImageProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!wrap.current || !image.current || reduced) return;
    let cleanup = () => undefined;

    void (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (!wrap.current || !image.current) return;

      gsap.set(image.current, { filter: "blur(14px)", opacity: 0.72, scale: 1.055 });
      const reveal = gsap.to(image.current, {
        filter: "blur(0px)",
        opacity: 1,
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top 92%",
          end: "top 48%",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });
      cleanup = () => {
        reveal.scrollTrigger?.kill();
        reveal.kill();
      };
    });

    return () => cleanup();
  }, [reduced]);

  return (
    <div ref={wrap} className={`relative overflow-hidden ${className}`}>
      <div ref={image} className="absolute inset-0 will-change-[filter,transform,opacity]">
        <Image src={src} alt={alt} fill sizes={sizes} className={`object-cover ${imageClassName}`} />
      </div>
    </div>
  );
}
