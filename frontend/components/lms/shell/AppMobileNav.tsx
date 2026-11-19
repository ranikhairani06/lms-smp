import Link from "next/link";
import type { AppNavigationItem } from "./types";
import styles from "./AppShell.module.css";

export default function AppMobileNav({ items, label = "Navigasi mobile", columns = 6, className = "" }: { items: AppNavigationItem[]; label?: string; columns?: 4 | 5 | 6; className?: string }) {
  return (
    <nav className={`${styles.bottomNav} ${styles[`bottomNav${columns}`]} ${className}`} aria-label={label}>
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={item.active ? styles.bottomNavActive : ""} aria-current={item.active ? "page" : undefined}>
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
