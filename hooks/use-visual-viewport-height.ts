"use client";

import { useEffect } from "react";

const KEYBOARD_OPEN_THRESHOLD = 120;

function getLayoutViewportHeight() {
  return Math.round(window.innerHeight || document.documentElement.clientHeight || 0);
}

function readViewportMetrics() {
  if (typeof window === "undefined") {
    return {
      height: 0,
      keyboardOpen: false,
    };
  }

  const viewport = window.visualViewport;
  const layoutHeight = getLayoutViewportHeight();
  const height = Math.round(viewport?.height ?? layoutHeight);
  const offsetTop = Math.max(0, Math.round(viewport?.offsetTop ?? 0));
  const keyboardInset = Math.max(0, layoutHeight - (height + offsetTop));

  return {
    height,
    keyboardOpen: keyboardInset > KEYBOARD_OPEN_THRESHOLD,
  };
}

export function useVisualViewportHeight() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let frameId = 0;

    const root = document.documentElement;

    const applyViewportMetrics = () => {
      frameId = 0;

      const { height, keyboardOpen } = readViewportMetrics();

      root.style.setProperty("--app-height", `${height}px`);
      root.style.setProperty(
        "--app-safe-bottom",
        keyboardOpen ? "0px" : "env(safe-area-inset-bottom, 0px)",
      );
    };

    const scheduleViewportUpdate = () => {
      if (frameId !== 0) {
        cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(applyViewportMetrics);
    };

    const viewport = window.visualViewport;

    scheduleViewportUpdate();
    window.addEventListener("resize", scheduleViewportUpdate, { passive: true });
    window.addEventListener("orientationchange", scheduleViewportUpdate);
    viewport?.addEventListener("resize", scheduleViewportUpdate);
    viewport?.addEventListener("scroll", scheduleViewportUpdate);

    return () => {
      if (frameId !== 0) {
        cancelAnimationFrame(frameId);
      }

      window.removeEventListener("resize", scheduleViewportUpdate);
      window.removeEventListener("orientationchange", scheduleViewportUpdate);
      viewport?.removeEventListener("resize", scheduleViewportUpdate);
      viewport?.removeEventListener("scroll", scheduleViewportUpdate);
      root.style.removeProperty("--app-height");
      root.style.removeProperty("--app-safe-bottom");
    };
  }, []);
}
