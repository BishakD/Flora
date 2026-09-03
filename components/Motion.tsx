"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
        gsap.set(wordNodes, { opacity: 0.14, y: 2 });
        const tween = gsap.to(wordNodes, {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top 78%",
            end: "bottom 38%",
            scrub: 0.45,
            invalidateOnRefresh: true,
            onEnter: () => gsap.set(wordNodes, { willChange: "opacity, transform" }),
            onLeave: () => gsap.set(wordNodes, { willChange: "auto" }),
            onEnterBack: () => gsap.set(wordNodes, { willChange: "opacity, transform" }),
            onLeaveBack: () => gsap.set(wordNodes, { willChange: "auto" }),
          },
        });
        cleanup = () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      } else {
        gsap.set(wordNodes, { opacity: 0.14, y: 4 });
        const tween = gsap.to(wordNodes, {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.028,
          ease: "power2.out",
          scrollTrigger: {
            trigger: root.current,
            start: "top 84%",
            once: true,
            onEnter: () => gsap.set(wordNodes, { willChange: "opacity, transform" }),
          },
          onComplete: () => {
            gsap.set(wordNodes, { willChange: "auto" });
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
        <span key={`${word}-${index}`} data-reveal-word className="inline-block">
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
  const ink = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ink.current || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    const title = ink.current;
    gsap.set(title, { clipPath: "inset(0 100% 0 0)" });
    const tween = gsap.to(title, {
      clipPath: "inset(0 0% 0 0)",
      ease: "none",
      scrollTrigger: {
        trigger: title,
        start: "top bottom",
        end: "center center",
        scrub: true,
        invalidateOnRefresh: true,
        onEnter: () => gsap.set(title, { willChange: "clip-path" }),
        onLeave: () => gsap.set(title, { willChange: "auto" }),
        onEnterBack: () => gsap.set(title, { willChange: "clip-path" }),
        onLeaveBack: () => gsap.set(title, { willChange: "auto" }),
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [children, reduced]);

  return (
    <Tag
      className={`script-title relative ${className}`}
    >
      <span className="script-swash" aria-hidden="true" />
      <span ref={ink} className="relative z-[1] block">{children}</span>
    </Tag>
  );
}

export function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      data-reveal-section
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
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
    gsap.registerPlugin(ScrollTrigger);

    const tween = gsap.fromTo(
      image.current,
      { yPercent: -6, scale: 1.02, opacity: 0.72 },
      {
        yPercent: 6,
        scale: 1.045,
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
          invalidateOnRefresh: true,
          onEnter: () => gsap.set(image.current, { willChange: "transform, opacity" }),
          onLeave: () => gsap.set(image.current, { willChange: "auto" }),
          onEnterBack: () => gsap.set(image.current, { willChange: "transform, opacity" }),
          onLeaveBack: () => gsap.set(image.current, { willChange: "auto" }),
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  return (
    <div ref={wrap} className={`relative overflow-hidden ${className}`}>
      <div ref={image} className="absolute -inset-[8%]">
        <Image src={src} alt={alt} fill sizes={sizes} preload={priority} className={`object-cover ${imageClassName}`} />
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
  priority = false,
}: MotionImageProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const isArch = className.includes("arch-frame");

  useEffect(() => {
    if (!wrap.current || !image.current || reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.set(image.current, { opacity: 0.45, scale: 1.04 });
    const tween = gsap.to(image.current, {
      opacity: 1,
      scale: 1,
      ease: "none",
      scrollTrigger: {
        trigger: wrap.current,
        start: "top 96%",
        end: "top 56%",
        scrub: 0.35,
        invalidateOnRefresh: true,
        onEnter: () => gsap.set(image.current, { willChange: "transform, opacity" }),
        onLeave: () => gsap.set(image.current, { willChange: "auto" }),
        onEnterBack: () => gsap.set(image.current, { willChange: "transform, opacity" }),
        onLeaveBack: () => gsap.set(image.current, { willChange: "auto" }),
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  return (
    <div ref={wrap} className={`relative ${isArch ? "isolate" : "overflow-hidden"} ${className}`}>
      <div
        ref={image}
        className={`absolute inset-0 ${
          isArch ? "arch-frame-inner overflow-hidden" : ""
        }`}
      >
        <Image src={src} alt={alt} fill sizes={sizes} preload={priority} className={`object-cover ${imageClassName}`} />
      </div>

      {isArch && (
        <svg
          className="pointer-events-none absolute inset-0 size-full select-none z-10"
          viewBox="0 0 1000 1300"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 500 40 C 632 40 740 128 740 240 C 740 262 754 275 775 275 L 865 275 C 930 275 980 310 980 375 L 980 1245 Q 980 1280 945 1280 L 55 1280 Q 20 1280 20 1245 L 20 375 C 20 310 70 275 135 275 L 225 275 C 246 275 260 262 260 240 C 260 128 368 40 500 40 Z"
            fill="none"
            stroke="#b89758"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
    </div>
  );
}
