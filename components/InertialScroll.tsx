"use client";

import { useEffect } from "react";

const MAX_WHEEL_DELTA = 180;
const FOLLOW_RATE = 0.01;
const REST_THRESHOLD = 0.35;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function canScrollWithin(target: EventTarget | null, delta: number) {
  let element = target instanceof Element ? target : null;

  while (element && element !== document.body) {
    const styles = window.getComputedStyle(element);
    const scrollable = /(auto|scroll|overlay)/.test(styles.overflowY) && element.scrollHeight > element.clientHeight + 1;

    if (scrollable) {
      const atTop = element.scrollTop <= 0;
      const atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
      if ((delta < 0 && !atTop) || (delta > 0 && !atBottom)) return true;
    }

    element = element.parentElement;
  }

  return false;
}

export function InertialScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let current = window.scrollY;
    let target = current;
    let frame = 0;
    let previousTime = 0;
    let running = false;

    const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      running = false;
      previousTime = 0;
      current = window.scrollY;
      target = current;
    };

    const syncPreference = () => {
      const enabled = finePointer.matches && !reducedMotion.matches;
      document.documentElement.dataset.inertialScroll = enabled ? "enabled" : "native";
      if (!enabled && running) stop();
    };

    const step = (time: number) => {
      if (!running) return;
      const elapsed = previousTime ? Math.min(time - previousTime, 32) : 16.67;
      previousTime = time;
      const limit = maxScroll();
      target = clamp(target, 0, limit);
      const ease = 1 - Math.exp(-elapsed * FOLLOW_RATE);
      current += (target - current) * ease;
      current = clamp(current, 0, limit);
      window.scrollTo({ top: current, left: 0, behavior: "instant" });

      if (Math.abs(target - current) > REST_THRESHOLD) {
        frame = window.requestAnimationFrame(step);
      } else {
        window.scrollTo({ top: target, left: 0, behavior: "instant" });
        running = false;
        frame = 0;
        previousTime = 0;
        current = target;
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (!finePointer.matches || reducedMotion.matches || event.defaultPrevented) return;
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (window.getComputedStyle(document.body).overflowY === "hidden") return;

      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const rawDelta = event.deltaY * unit;
      if (Math.abs(rawDelta) < 0.01 || canScrollWithin(event.target, rawDelta)) return;

      event.preventDefault();
      if (!running) {
        current = window.scrollY;
        target = current;
        running = true;
      }

      const delta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), MAX_WHEEL_DELTA);
      target = clamp(target + delta, 0, maxScroll());
      if (!frame) frame = window.requestAnimationFrame(step);
    };

    const onNativeScroll = () => {
      if (running) return;
      current = window.scrollY;
      target = current;
    };

    const onResize = () => {
      const limit = maxScroll();
      current = clamp(current, 0, limit);
      target = clamp(target, 0, limit);
    };

    syncPreference();
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onNativeScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("pointerdown", stop, { passive: true });
    window.addEventListener("keydown", stop);
    reducedMotion.addEventListener("change", syncPreference);
    finePointer.addEventListener("change", syncPreference);

    return () => {
      stop();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onNativeScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerdown", stop);
      window.removeEventListener("keydown", stop);
      reducedMotion.removeEventListener("change", syncPreference);
      finePointer.removeEventListener("change", syncPreference);
      delete document.documentElement.dataset.inertialScroll;
    };
  }, []);

  return null;
}
