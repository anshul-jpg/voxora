"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, className, style, ...props }: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const markDone = useCallback(() => setIsDone(true), []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "-80px" }
    );
    const el = ref.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, []);

  // Fallback: mark done after animation completes regardless of onTransitionEnd
  // This guarantees all inline styles (which can create stacking contexts) are cleared.
  useEffect(() => {
    if (!isVisible || isDone) return;
    const totalMs = (delay + 0.6 + 0.1) * 1000; // delay + duration + buffer
    const t = setTimeout(markDone, totalMs);
    return () => clearTimeout(t);
  }, [isVisible, isDone, delay, markDone]);

  // State machine:
  // not visible → opacity:0 (tiny SC, but invisible)
  // fading in   → opacity:1 (no SC at opacity=1, but transition keeps GPU layer briefly)
  // done        → NO inline styles at all → zero stacking context guaranteed
  const inlineStyle: React.CSSProperties =
    isDone
      ? (style ?? {})
      : {
          opacity: isVisible ? 1 : 0,
          transition: `opacity 0.6s cubic-bezier(0.21,0.47,0.32,0.98) ${delay}s`,
          ...style,
        };

  return (
    <div
      ref={ref}
      className={cn(!isVisible && "pointer-events-none", className)}
      onTransitionEnd={markDone}
      style={inlineStyle}
      {...props}
    >
      {children}
    </div>
  );
}
