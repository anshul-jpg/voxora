"use client";

import React, { useRef, useEffect, FC, ReactNode, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { vec2, Vector2 } from "vecteur";

interface MagneticCursorProps {
  children: ReactNode;
  magneticFactor?: number;
  lerpAmount?: number;
  hoverPadding?: number;
  hoverAttribute?: string;
  cursorSize?: number;
  cursorColor?: string;
  blendMode?: "difference" | "exclusion" | "normal" | "screen" | "overlay";
  cursorClassName?: string;
  shape?: "circle" | "square" | "rounded-square";
  disableOnTouch?: boolean;
  speedMultiplier?: number;
  maxScaleX?: number;
  maxScaleY?: number;
  contrastBoost?: number;
}

interface CursorState {
  el: HTMLDivElement | null;
  pos: { current: Vector2; target: Vector2; previous: Vector2 };
  hover: { isHovered: boolean };
  isDetaching: boolean;
}

export const MagneticCursor: FC<MagneticCursorProps> = ({
  children,
  lerpAmount = 0.1,
  magneticFactor = 0.2,
  hoverPadding = 12,
  hoverAttribute = "data-magnetic",
  cursorSize = 24,
  cursorColor = "#fefefe",
  blendMode = "exclusion",
  cursorClassName = "",
  shape = "circle",
  disableOnTouch = true,
  speedMultiplier = 0.02,
  maxScaleX = 1,
  maxScaleY = 0.3,
  contrastBoost = 1.5,
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorStateRef = useRef<CursorState | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Store config in a mutable ref to prevent useEffect re-runs and warning
  const configRef = useRef({
    magneticFactor,
    speedMultiplier,
    maxScaleX,
    maxScaleY,
    cursorSize,
    lerpAmount,
    hoverPadding,
    hoverAttribute,
    shape,
    disableOnTouch,
    cursorColor,
  });

  useEffect(() => {
    configRef.current = {
      magneticFactor,
      speedMultiplier,
      maxScaleX,
      maxScaleY,
      cursorSize,
      lerpAmount,
      hoverPadding,
      hoverAttribute,
      shape,
      disableOnTouch,
      cursorColor,
    };
  }, [
    magneticFactor,
    speedMultiplier,
    maxScaleX,
    maxScaleY,
    cursorSize,
    lerpAmount,
    hoverPadding,
    hoverAttribute,
    shape,
    disableOnTouch,
    cursorColor,
  ]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const cursorEl = cursorRef.current;
    if (!cursorEl) return;

    gsap.set(cursorEl, { xPercent: -50, yPercent: -50 });

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const detachDuration = prefersReducedMotion ? 0.1 : 0.35;

    if (!cursorStateRef.current) {
      cursorStateRef.current = {
        el: cursorEl,
        pos: {
          current: vec2(-100, -100),
          target: vec2(-100, -100),
          previous: vec2(-100, -100),
        },
        hover: { isHovered: false },
        isDetaching: false,
      };
    }

    const update = () => {
      const state = cursorStateRef.current;
      if (!state || state.hover.isHovered) return;

      const { speedMultiplier, maxScaleX, maxScaleY, lerpAmount } =
        configRef.current;
      const effectiveLerp = prefersReducedMotion ? 1 : lerpAmount;

      state.pos.current.lerp(state.pos.target, effectiveLerp);
      const delta = state.pos.current.clone().sub(state.pos.previous);
      state.pos.previous.copy(state.pos.current);

      if (state.isDetaching) {
        gsap.set(state.el, {
          x: state.pos.current.x,
          y: state.pos.current.y,
          scaleX: 1,
          scaleY: 1,
          rotate: 0,
          overwrite: "auto",
        });
      } else {
        const speed =
          Math.sqrt(delta.x * delta.x + delta.y * delta.y) * speedMultiplier;
        gsap.set(state.el, {
          x: state.pos.current.x,
          y: state.pos.current.y,
          rotate: Math.atan2(delta.y, delta.x) * (180 / Math.PI),
          scaleX: 1 + Math.min(speed, maxScaleX),
          scaleY: 1 - Math.min(speed, maxScaleY),
          overwrite: "auto",
        });
      }
    };

    const initializePosition = (event: PointerEvent) => {
      const state = cursorStateRef.current;
      if (!state) return;
      
      const { disableOnTouch } = configRef.current;
      if (disableOnTouch && event.pointerType === "touch") return;

      state.pos.current.x = event.clientX;
      state.pos.current.y = event.clientY;
      state.pos.target.x = event.clientX;
      state.pos.target.y = event.clientY;
      state.pos.previous.x = event.clientX;
      state.pos.previous.y = event.clientY;
      gsap.set(cursorEl, { x: event.clientX, y: event.clientY, opacity: 1 });
    };

    const onMouseMove = (event: PointerEvent) => {
      const state = cursorStateRef.current;
      if (!state) return;

      const { disableOnTouch } = configRef.current;
      if (disableOnTouch && event.pointerType === "touch") {
        gsap.to(cursorEl, { opacity: 0, duration: 0.2, overwrite: "auto" });
        return;
      }

      state.pos.target.x = event.clientX;
      state.pos.target.y = event.clientY;

      const isInViewport =
        event.clientX >= 0 &&
        event.clientX <= window.innerWidth &&
        event.clientY >= 0 &&
        event.clientY <= window.innerHeight;

      gsap.to(cursorEl, {
        opacity: isInViewport ? 1 : 0,
        duration: 0.2,
        overwrite: "auto",
      });
    };

    const handleMouseLeave = () =>
      gsap.to(cursorEl, { opacity: 0, duration: 0.3 });
    const handleMouseEnter = () => {
      const state = cursorStateRef.current;
      if (!state) return;
      gsap.to(cursorEl, { opacity: 1, duration: 0.3 });
    };

    gsap.ticker.add(update);
    window.addEventListener("pointermove", onMouseMove);
    window.addEventListener("pointermove", initializePosition, { once: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    const cleanupFunctions: (() => void)[] = [];

    const { hoverAttribute: activeHoverAttribute } = configRef.current;
    const magneticElements = gsap.utils.toArray<HTMLElement>(
      `[${activeHoverAttribute}]`
    );
    magneticElements.forEach((el) => {
      const xTo = gsap.quickTo(el, "x", {
        duration: 1,
        ease: "elastic.out(1, 0.3)",
      });
      const yTo = gsap.quickTo(el, "y", {
        duration: 1,
        ease: "elastic.out(1, 0.3)",
      });

      const handlePointerEnter = (event: PointerEvent) => {
        const state = cursorStateRef.current;
        if (!state) return;
        
        const { disableOnTouch, cursorSize } = configRef.current;
        if (disableOnTouch && event.pointerType === "touch") return;

        state.isDetaching = false;

        gsap.killTweensOf(cursorEl);
        gsap.to(cursorEl, {
          width: cursorSize * 1.5,
          height: cursorSize * 1.5,
          borderRadius: "50%",
          scaleX: 1,
          scaleY: 1,
          rotate: 0,
          duration: 0.3,
          ease: "power3.out",
          overwrite: "auto",
        });
      };

      const handlePointerLeave = (event: PointerEvent) => {
        const state = cursorStateRef.current;
        if (!state) return;

        const { disableOnTouch, cursorSize, shape: currentShape } = configRef.current;
        if (disableOnTouch && event.pointerType === "touch") return;

        const shapeBorderRadius =
          currentShape === "circle" ? "50%" : currentShape === "square" ? "0" : "8px";

        gsap.killTweensOf(cursorEl);
        gsap.to(cursorEl, {
          width: cursorSize,
          height: cursorSize,
          borderRadius: shapeBorderRadius,
          scaleX: 1,
          scaleY: 1,
          duration: detachDuration,
          ease: "power3.out",
          overwrite: "auto",
        });
      };

      let rafId: number | null = null;
      const handlePointerMove = (event: PointerEvent) => {
        const { disableOnTouch } = configRef.current;
        if (disableOnTouch && event.pointerType === "touch") return;

        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          const { clientX, clientY } = event;
          const { height, width, left, top } = el.getBoundingClientRect();
          const { magneticFactor } = configRef.current;
          xTo((clientX - (left + width / 2)) * magneticFactor);
          yTo((clientY - (top + height / 2)) * magneticFactor);
          rafId = null;
        });
      };

      const handlePointerOut = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener("pointerenter", handlePointerEnter);
      el.addEventListener("pointerleave", handlePointerLeave);
      el.addEventListener("pointermove", handlePointerMove);
      el.addEventListener("pointerout", handlePointerOut);

      cleanupFunctions.push(() => {
        el.removeEventListener("pointerenter", handlePointerEnter);
        el.removeEventListener("pointerleave", handlePointerLeave);
        el.removeEventListener("pointermove", handlePointerMove);
        el.removeEventListener("pointerout", handlePointerOut);
      });
    });

    return () => {
      gsap.ticker.remove(update);
      window.removeEventListener("pointermove", onMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cleanupFunctions.forEach((fn) => fn());
      if (cursorEl) {
        gsap.set(cursorEl, { clearProps: "all" });
      }
    };
  }, [isMounted]);

  const styles: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 2147483647,
    pointerEvents: "none",
    backgroundColor: cursorColor,
    mixBlendMode: blendMode as React.CSSProperties["mixBlendMode"],
    width: cursorSize,
    height: cursorSize,
    borderRadius:
      shape === "circle" ? "50%" : shape === "square" ? "0" : "8px",
  };

  const cursorEl = (
    <div
      key="__mc"
      ref={cursorRef}
      className={`magnetic-cursor ${cursorClassName}`}
      style={styles}
    />
  );

  return (
    <>
      {isMounted ? createPortal(cursorEl, document.body) : null}
      {children}
    </>
  );
};
