"use client";

import { Icon } from "@iconify/react";
import { icons } from "@iconify-json/solar";

export function Solar({
  name,
  size = 24,
  className = "",
  variant = "linear",
}: {
  name: string;
  size?: number;
  className?: string;
  variant?: "linear" | "bold" | "bold-duotone" | "line-duotone";
}) {
  const key = `${name}-${variant}` as keyof typeof icons.icons;
  const data = icons.icons[key];

  return (
    <Icon
      icon={{ ...data, width: size, height: size }}
      width={size}
      height={size}
      aria-hidden="true"
      className={`es-icon ${className}`}
    />
  );
}
