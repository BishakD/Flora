"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Room } from "@/data/hotel";
import { BrandMark } from "./BrandMark";

function ArrowIcon({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" className={direction === "left" ? "rotate-180" : ""}>
      <path d="M3 10H17M12 5L17 10L12 15" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RoomCard({ room, onOpen }: { room: Room; onOpen: (room: Room) => void }) {
  const [imageIndex, setImageIndex] = useState(0);

  function changeImage(direction: number) {
    setImageIndex((current) => (current + direction + 3) % 3);
  }

  return (
    <article className="group relative min-w-[88%] snap-start overflow-hidden bg-flora-navy transition duration-500 ease-luxury sm:min-w-[70%] md:min-w-[calc((100%_-_2rem)/3)]">
      <div className="relative aspect-[0.775] overflow-hidden">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={room.images[imageIndex]}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image src={room.images[imageIndex]} alt={`${room.name}, editorial placeholder view ${imageIndex + 1}`} fill sizes="(min-width: 768px) 34vw, 88vw" className="object-cover transition-transform duration-[900ms] ease-luxury group-hover:scale-[1.03]" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-flora-espresso/0 transition-colors duration-[380ms] group-hover:bg-flora-espresso/52 group-focus-within:bg-flora-espresso/52" />
        <p className="absolute inset-x-7 top-1/2 z-10 -translate-y-[38%] text-center text-[1.03rem] leading-[1.65] text-flora-cream opacity-0 transition duration-[380ms] ease-luxury group-hover:-translate-y-1/2 group-hover:opacity-100 group-focus-within:-translate-y-1/2 group-focus-within:opacity-100">{room.summary}</p>
        <button type="button" className="room-title-pill absolute bottom-6 left-1/2 z-20 min-w-[150px] -translate-x-1/2 bg-flora-ivory px-5 py-2.5 text-center font-sans text-[0.55rem] uppercase tracking-[0.13em] text-flora-charcoal shadow-soft" onClick={() => onOpen(room)} aria-label={`Quick view ${room.name}`}>{room.name}</button>

        <div className="absolute left-2 right-2 top-1/2 z-20 flex -translate-y-1/2 items-center justify-between text-flora-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
          <button type="button" className="grid size-11 place-items-center drop-shadow-[0_2px_8px_rgba(27,42,63,.5)]" onClick={() => changeImage(-1)} aria-label={`Previous ${room.name} image`}>
            <ArrowIcon direction="left" />
          </button>
          <button type="button" className="grid size-11 place-items-center drop-shadow-[0_2px_8px_rgba(27,42,63,.5)]" onClick={() => changeImage(1)} aria-label={`Next ${room.name} image`}>
            <ArrowIcon />
          </button>
        </div>

        <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 gap-1.5" aria-label={`Image ${imageIndex + 1} of 3`}>
          {room.images.slice(0, 3).map((image, dotIndex) => (
            <button key={image} type="button" className={`h-1.5 rounded-full transition-all ${dotIndex === imageIndex ? "w-5 bg-flora-cream" : "w-1.5 bg-flora-cream/50"}`} onClick={() => setImageIndex(dotIndex)} aria-label={`Show image ${dotIndex + 1}`} />
          ))}
        </div>
      </div>
    </article>
  );
}

export function RoomShowcase({ rooms }: { rooms: Room[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [quickView, setQuickView] = useState<Room | null>(null);

  function goTo(index: number) {
    const safeIndex = (index + rooms.length) % rooms.length;
    setCurrent(safeIndex);
    const item = track.current?.children[safeIndex] as HTMLElement | undefined;
    if (track.current && item) track.current.scrollTo({ left: item.offsetLeft - track.current.offsetLeft, behavior: "smooth" });
  }

  return (
    <>
      <div className="relative">
        <div ref={track} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
          {rooms.map((room) => (
            <RoomCard key={room.slug} room={room} onOpen={setQuickView} />
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-5 md:flex-row">
          <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
            {rooms.map((room, index) => (
              <button key={room.slug} type="button" aria-pressed={current === index} className={`shrink-0 rounded-full border px-4 py-2 font-sans text-[0.58rem] uppercase tracking-[0.12em] transition-colors ${current === index ? "border-flora-slate bg-flora-slate text-flora-ivory" : "border-flora-slate/45 text-flora-slate hover:bg-flora-slate hover:text-flora-ivory"}`} onClick={() => goTo(index)}>
                {room.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="grid size-11 place-items-center rounded-full border border-flora-slate text-flora-slate hover:bg-flora-slate hover:text-flora-ivory" onClick={() => goTo(current - 1)} aria-label="Previous room">
              <ArrowIcon direction="left" />
            </button>
            <button type="button" className="grid size-11 place-items-center rounded-full border border-flora-slate text-flora-slate hover:bg-flora-slate hover:text-flora-ivory" onClick={() => goTo(current + 1)} aria-label="Next room">
              <ArrowIcon />
            </button>
          </div>
        </div>
      </div>
      <RoomQuickView room={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}

function RoomQuickView({ room, onClose }: { room: Room | null; onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!room) return;
    const original = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const modal = closeButton.current?.closest("[role=dialog]");
        const focusable = modal?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
      previousFocus?.focus();
    };
  }, [room, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {room ? (
        <motion.div className="fixed inset-0 z-[100] grid place-items-center bg-flora-espresso/38 p-0 backdrop-blur-[15px] md:p-8" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
          <motion.div role="dialog" aria-modal="true" aria-labelledby="quick-view-title" className="relative h-full w-full max-w-[1090px] overflow-y-auto bg-[#FCF7F4] px-6 pb-10 pt-5 md:h-[min(90vh,760px)] md:px-12 md:pb-12 md:pt-7" initial={reduced ? false : { opacity: 0, scale: 0.992 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.995 }} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}>
            <button ref={closeButton} type="button" className="fixed right-4 top-4 z-[110] grid size-11 place-items-center rounded-full border border-flora-line bg-flora-ivory/95 font-sans text-lg shadow-soft backdrop-blur md:absolute md:right-5 md:top-5" onClick={onClose} aria-label="Close room quick view">
              ×
            </button>
            <div className="text-center">
              <BrandMark className="mx-auto scale-75" />
              <h2 id="quick-view-title" className="mt-1 font-display text-[clamp(2rem,4vw,3rem)] uppercase leading-none tracking-[0.025em]">{room.name}</h2>
              <p className="eyebrow mt-3 text-flora-grey">{room.size} · {room.occupancy}</p>
            </div>

            <div className="mt-7 grid gap-8 md:mt-8 md:grid-cols-[0.92fr_1.08fr] md:items-center md:gap-10">
              <div className="order-2 md:order-1">
                <h3 className="font-display text-[clamp(1.8rem,3vw,2.3rem)] uppercase tracking-[0.02em]">Features and amenities</h3>
                <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 text-[0.88rem] leading-snug text-flora-grey sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
                  {room.amenities.map((amenity) => <li key={amenity} className="flex gap-2"><span className="mt-1 text-[0.48rem] text-flora-slate">◆</span>{amenity}</li>)}
                </ul>
                <div className="mt-7 grid grid-cols-2 gap-3 border-t border-flora-line pt-5">
                  {[room.bed, room.view].map((item) => <span key={item} className="eyebrow text-[0.5rem] text-flora-slate">{item}</span>)}
                </div>
                <Link href={`/rooms/${room.slug}`} className="luxury-button mt-7 border-flora-slate text-flora-slate [--button-fill:var(--flora-slate-blue-deep)]">Full room details</Link>
              </div>
              <div className="order-1 md:order-2">
                <RoomGallery images={room.images} roomName={room.name} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export function RoomGallery({ images, roomName, fullHeight = false }: { images: string[]; roomName: string; fullHeight?: boolean }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [lightbox, setLightbox] = useState(false);
  const lightboxClose = useRef<HTMLButtonElement>(null);

  function change(direction: number) {
    setDirection(direction);
    setIndex((current) => (current + direction + images.length) % images.length);
  }

  function show(next: number) {
    setDirection(next >= index ? 1 : -1);
    setIndex(next);
  }

  useEffect(() => {
    if (!lightbox) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lightboxClose.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowLeft") change(-1);
      if (event.key === "ArrowRight") change(1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox]);

  const gallery = (
    <div className="relative size-full overflow-hidden bg-flora-navy" role="region" aria-roledescription="carousel" aria-label={`${roomName} gallery`}>
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div key={images[index]} custom={direction} className="absolute inset-0" initial={{ x: direction > 0 ? "100%" : "-100%" }} animate={{ x: 0 }} exit={{ x: direction > 0 ? "-100%" : "100%" }} transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}>
          <Image src={images[index]} alt={`${roomName}, editorial placeholder image ${index + 1}`} fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-flora-navy/75 to-transparent" />
      <button type="button" className="absolute left-5 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-flora-cream/55 bg-flora-navy/15 text-flora-cream backdrop-blur-sm" onClick={() => change(-1)} aria-label="Previous gallery image"><ArrowIcon direction="left" /></button>
      <button type="button" className="absolute right-5 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-flora-cream/55 bg-flora-navy/15 text-flora-cream backdrop-blur-sm" onClick={() => change(1)} aria-label="Next gallery image"><ArrowIcon /></button>
      <button type="button" className="absolute right-5 top-5 z-10 grid size-11 place-items-center rounded-full border border-flora-cream/55 bg-flora-navy/20 text-flora-cream backdrop-blur-sm" onClick={() => setLightbox(true)} aria-label="Expand gallery image">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 3H3V7M11 3H15V7M7 15H3V11M11 15H15V11" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" /></svg>
      </button>
      <div className="absolute inset-x-0 bottom-5 z-10 flex items-center justify-center gap-2">
        {images.map((image, dotIndex) => <button key={image} type="button" className={`h-1.5 rounded-full transition-all ${dotIndex === index ? "w-6 bg-flora-gold" : "w-1.5 bg-flora-cream/70"}`} onClick={() => show(dotIndex)} aria-label={`Show image ${dotIndex + 1}`} aria-current={dotIndex === index} />)}
      </div>
    </div>
  );

  return (
    <>
      <div className={fullHeight ? "h-full min-h-[48vh]" : "aspect-[4/3] w-full md:aspect-[1.15]"}>{gallery}</div>
      <AnimatePresence>
        {lightbox ? (
          <motion.div className="fixed inset-0 z-[130] grid place-items-center bg-flora-espresso/95 p-4 md:p-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={`${roomName} expanded gallery`}>
            <div className="relative h-[min(84vh,900px)] w-full max-w-[1500px]">{gallery}</div>
            <button ref={lightboxClose} type="button" className="absolute right-5 top-5 z-20 grid size-12 place-items-center rounded-full border border-flora-cream/50 text-xl text-flora-cream" onClick={() => setLightbox(false)} aria-label="Close expanded gallery">×</button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export function AmenityList({ room }: { room: Room }) {
  return (
    <section aria-labelledby="amenities-title">
      <p className="eyebrow text-flora-gold">In the room</p>
      <h2 id="amenities-title" className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] leading-none">Features and amenities</h2>
      <ul className="mt-7 divide-y divide-flora-line border-y border-flora-line">
        {room.amenities.map((amenity) => <li key={amenity} className="flex items-center gap-4 py-3.5 text-lg"><span className="text-flora-gold">✦</span>{amenity}</li>)}
      </ul>
    </section>
  );
}

export function RateCard({ room, rate }: { room: Room; rate: Room["rates"][number] }) {
  return (
    <article className="border border-flora-line bg-flora-ivory p-6 transition-shadow hover:shadow-soft">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <p className="eyebrow text-flora-slate">Illustrative rate</p>
          <h3 className="mt-2 font-display text-3xl">{rate.name}</h3>
          <p className="mt-3 max-w-md text-base leading-relaxed text-flora-grey">{rate.policy}</p>
          <p className="mt-2 text-sm italic text-flora-terracotta">{rate.note}</p>
        </div>
        <div className="shrink-0 text-left sm:text-right">
          <p className="eyebrow text-flora-grey">From</p>
          <p className="font-display text-4xl">€{rate.price}</p>
          <p className="font-sans text-[0.55rem] uppercase tracking-[0.12em] text-flora-grey">per night · demo</p>
        </div>
      </div>
      <Link href={`/booking?room=${room.slug}`} className="luxury-button mt-6 border-flora-slate text-flora-slate [--button-fill:var(--flora-slate-blue-deep)]">Choose this rate</Link>
    </article>
  );
}
