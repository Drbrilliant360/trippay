"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { animate, stagger } from "animejs";

/** JS animations opt out entirely for users who prefer reduced motion. */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Delay between children, in ms. */
  staggerMs?: number;
  /** Initial downward offset, in px. */
  y?: number;
}

/**
 * Staggered entrance: each direct child fades in and slides up on mount.
 * Content is server-rendered visible, so nothing is lost without JS.
 */
export function Reveal({ children, className, staggerMs = 90, y = 18 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const items = Array.from(el.children) as HTMLElement[];
    if (items.length === 0) return;
    const animation = animate(items, {
      opacity: [0, 1],
      y: [y, 0],
      delay: stagger(staggerMs),
      duration: 650,
      ease: "outCubic",
    });
    return () => {
      animation.cancel();
    };
    // Entrance runs once on mount by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

interface FloatProps {
  children: ReactNode;
  className?: string;
  /** Total vertical travel, in px. */
  distance?: number;
  duration?: number;
}

/** Gentle perpetual vertical float, e.g. for the hero phone mockup. */
export function Float({ children, className, distance = 10, duration = 3200 }: FloatProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const animation = animate(el, {
      y: [-distance / 2, distance / 2],
      duration,
      ease: "inOutSine",
      alternate: true,
      loop: true,
    });
    return () => {
      animation.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

interface CountUpProps {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

/**
 * Counts up to the exact final value on mount. The real value is rendered
 * server-side, so no-JS and reduced-motion users always see the true number.
 */
export function CountUp({ value, decimals = 0, suffix = "", className }: CountUpProps) {
  const locale = useLocale();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    const counter = { n: 0 };
    const animation = animate(counter, {
      n: value,
      duration: 900,
      ease: "outExpo",
      onUpdate: () => {
        el.textContent = formatter.format(counter.n) + suffix;
      },
    });
    return () => {
      animation.cancel();
    };
  }, [value, decimals, suffix, locale]);

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return (
    <span ref={ref} className={className}>
      {formatted}
      {suffix}
    </span>
  );
}
