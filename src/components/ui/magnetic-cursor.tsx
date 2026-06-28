"use client";

import React, { useRef, useEffect, FC, ReactNode, useState } from "react";
import gsap from "gsap";
import { vec2, Vector2 } from "vecteur";

interface MagneticCursorProps {
  children: ReactNode;
  cursorSize?: number;
  cursorColor?: string;
  blendMode?: "difference" | "exclusion" | "normal" | "screen" | "overlay";
  cursorClassName?: string;
  shape?: "circle" | "square" | "rounded-square";
  disableOnTouch?: boolean;
  speedMultiplier?: number;
  maxScaleX?: number;
  maxScaleY?: number;
  // kept for API compat
  magneticFactor?: number;
  hoverAttribute?: string;
  hoverPadding?: number;
  lerpAmount?: number;
  contrastBoost?: number;
}

interface CursorState {
  pos: { current: Vector2; target: Vector2; previous: Vector2 };
}

export const MagneticCursor: FC<MagneticCursorProps> = ({
  children,
  cursorSize = 32,
  cursorColor = "#ffffff",
  blendMode = "exclusion",
  cursorClassName = "",
  shape = "circle",
  disableOnTouch = true,
  speedMultiplier = 0.02,
  maxScaleX = 1,
  maxScaleY = 0.3,
  lerpAmount = 0.1,
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<CursorState | null>(null);
  const [visible, setVisible] = useState(false);

  const configRef = useRef({ speedMultiplier, maxScaleX, maxScaleY, lerpAmount });
  useEffect(() => {
    configRef.current = { speedMultiplier, maxScaleX, maxScaleY, lerpAmount };
  }, [speedMultiplier, maxScaleX, maxScaleY, lerpAmount]);

  useEffect(() => {
    const cursorEl = cursorRef.current;
    if (!cursorEl) return;

    const isTouchDevice =
      disableOnTouch &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    if (isTouchDevice) return;

    gsap.set(cursorEl, { xPercent: -50, yPercent: -50, x: -200, y: -200 });

    stateRef.current = {
      pos: {
        current: vec2(-200, -200),
        target: vec2(-200, -200),
        previous: vec2(-200, -200),
      },
    };

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const update = () => {
      const state = stateRef.current;
      if (!state) return;
      const { speedMultiplier, maxScaleX, maxScaleY, lerpAmount } =
        configRef.current;
      const lerp = prefersReducedMotion ? 1 : lerpAmount;
      state.pos.current.lerp(state.pos.target, lerp);
      const delta = state.pos.current.clone().sub(state.pos.previous);
      state.pos.previous.copy(state.pos.current);
      const speed =
        Math.sqrt(delta.x * delta.x + delta.y * delta.y) * speedMultiplier;
      gsap.set(cursorEl, {
        x: state.pos.current.x,
        y: state.pos.current.y,
        rotate: Math.atan2(delta.y, delta.x) * (180 / Math.PI),
        scaleX: 1 + Math.min(speed, maxScaleX),
        scaleY: 1 - Math.min(speed, maxScaleY),
        overwrite: "auto",
      });
    };

    const onMove = (e: MouseEvent) => {
      const state = stateRef.current;
      if (!state) return;
      state.pos.target.x = e.clientX;
      state.pos.target.y = e.clientY;
    };

    const onFirstMove = (e: MouseEvent) => {
      const state = stateRef.current;
      if (!state) return;
      state.pos.current.x = e.clientX;
      state.pos.current.y = e.clientY;
      state.pos.target.x = e.clientX;
      state.pos.target.y = e.clientY;
      state.pos.previous.x = e.clientX;
      state.pos.previous.y = e.clientY;
      gsap.set(cursorEl, { x: e.clientX, y: e.clientY });
      setVisible(true);
    };

    gsap.ticker.add(update);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousemove", onFirstMove, { once: true });
    document.addEventListener("mouseleave", () => setVisible(false));
    document.addEventListener("mouseenter", () => setVisible(true));

    return () => {
      gsap.ticker.remove(update);
      window.removeEventListener("mousemove", onMove);
      gsap.set(cursorEl, { clearProps: "all" });
    };
  }, [disableOnTouch]);

  const borderRadius =
    shape === "circle" ? "50%" : shape === "square" ? "0" : "8px";

  return (
    <>
      {/* Cursor rendered directly — NOT portaled.
          position:fixed takes it out of flow. No createPortal means no body
          overflow-x:clip compositing layer wrapping the blend context. */}
      <div
        ref={cursorRef}
        className={`magnetic-cursor ${cursorClassName}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: cursorSize,
          height: cursorSize,
          borderRadius,
          backgroundColor: cursorColor,
          mixBlendMode: blendMode as React.CSSProperties["mixBlendMode"],
          pointerEvents: "none",
          zIndex: 2147483647,
          // Use visibility instead of opacity — opacity<1 creates a stacking context
          // that would isolate the cursor's own mix-blend-mode compositing.
          // visibility:hidden is instant and creates zero stacking context.
          visibility: visible ? "visible" : "hidden",
        }}
      />
      {children}
    </>
  );
};
