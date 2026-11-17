"use client";

import { Icon } from "@iconify/react";
import { icons } from "@iconify-json/solar";

export function Solar({
  name,
  className = "",
  variant = "linear",
}: {
  name: string;
  className?: string;
  variant?: "linear" | "bold" | "bold-duotone";
}) {
  const key = `${name}-${variant}` as keyof typeof icons.icons;
  const data = icons.icons[key];

  return (
    <Icon
      icon={{ ...data, width: 24, height: 24 }}
      width={24}
      height={24}
      aria-hidden="true"
      className={`es-icon ${className}`}
    />
  );
}
