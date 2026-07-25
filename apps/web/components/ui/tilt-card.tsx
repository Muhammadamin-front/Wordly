"use client";

import type { PointerEventHandler } from "react";

type TiltOptions = {
  rotateX?: number;
  rotateY?: number;
  lift?: number;
};

function updateTiltVariables(element: HTMLElement, clientX: number, clientY: number, options: TiltOptions) {
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  const offsetX = (clientX - rect.left) / rect.width;
  const offsetY = (clientY - rect.top) / rect.height;
  const rotateX = ((0.5 - offsetY) * (options.rotateX ?? 10)).toFixed(2);
  const rotateY = ((offsetX - 0.5) * (options.rotateY ?? 12)).toFixed(2);
  const shineX = `${Math.round(offsetX * 100)}%`;
  const shineY = `${Math.round(offsetY * 100)}%`;

  element.style.setProperty("--tilt-x", `${rotateX}deg`);
  element.style.setProperty("--tilt-y", `${rotateY}deg`);
  element.style.setProperty("--card-lift", `${options.lift ?? -6}px`);
  element.style.setProperty("--shine-x", shineX);
  element.style.setProperty("--shine-y", shineY);
}

function resetTiltVariables(element: HTMLElement) {
  element.style.setProperty("--tilt-x", "0deg");
  element.style.setProperty("--tilt-y", "0deg");
  element.style.setProperty("--card-lift", "0px");
  element.style.setProperty("--shine-x", "50%");
  element.style.setProperty("--shine-y", "30%");
}

export function createTiltHandlers(options: TiltOptions = {}) {
  const onPointerMove: PointerEventHandler<HTMLElement> = (event) => {
    updateTiltVariables(event.currentTarget as HTMLElement, event.clientX, event.clientY, options);
  };

  const onPointerLeave: PointerEventHandler<HTMLElement> = (event) => {
    resetTiltVariables(event.currentTarget as HTMLElement);
  };

  const onPointerCancel: PointerEventHandler<HTMLElement> = (event) => {
    resetTiltVariables(event.currentTarget as HTMLElement);
  };

  return { onPointerMove, onPointerLeave, onPointerCancel };
}
