"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function reducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function TypingPillars({ items }: { items: readonly string[] }) {
  const rootRef = useRef<HTMLParagraphElement>(null);
  const [text, setText] = useState("");
  const [active, setActive] = useState(true);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    reducedMotionSnapshot,
    () => false
  );

  useEffect(() => {
    if (reducedMotion || items.length === 0) return;

    let itemIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let visible = true;
    let timeout = 0;

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
    });
    if (rootRef.current) observer.observe(rootRef.current);

    const tick = () => {
      if (document.hidden || !visible) {
        timeout = window.setTimeout(tick, 180);
        return;
      }

      const item = items[itemIndex] ?? "";
      if (!deleting) {
        characterIndex += 1;
        setText(item.slice(0, characterIndex));
        if (characterIndex >= item.length) {
          if (itemIndex === items.length - 1) {
            setActive(false);
            return;
          }
          deleting = true;
          timeout = window.setTimeout(tick, 680);
          return;
        }
        timeout = window.setTimeout(tick, 52);
        return;
      }

      characterIndex -= 1;
      setText(item.slice(0, characterIndex));
      if (characterIndex <= 0) {
        deleting = false;
        itemIndex += 1;
        timeout = window.setTimeout(tick, 180);
        return;
      }
      timeout = window.setTimeout(tick, 28);
    };

    timeout = window.setTimeout(tick, 360);
    return () => {
      window.clearTimeout(timeout);
      observer.disconnect();
    };
  }, [items, reducedMotion]);

  const visibleText = reducedMotion ? items.join(" · ") : text;

  return (
    <p ref={rootRef} aria-hidden className="typing-line">
      <span className="typing-line-prefix">Vocora&nbsp;//&nbsp;</span>
      <span>{visibleText || "\u00A0"}</span>
      <span data-active={!reducedMotion && active} className="typing-cursor" />
    </p>
  );
}
