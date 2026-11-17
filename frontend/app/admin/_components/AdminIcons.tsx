"use client";

import { addCollection, Icon } from "@iconify/react";
import { icons as solarIcons } from "@iconify-json/solar";

// Memuat koleksi ikon Solar secara lokal
addCollection(solarIcons);

type AdminIconProps = {
  name: string;
  size?: number;
  className?: string;
  color?: string;
};

/** Semua ikon antarmuka menggunakan keluarga Solar dari Iconify. */
export default function AdminIcon({ name, size = 20, className, color }: AdminIconProps) {
  return (
    <Icon
      icon={`solar:${name}`}
      width={size}
      height={size}
      className={className}
      color={color}
      aria-hidden="true"
    />
  );
}
