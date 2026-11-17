import Link from "next/link";
import type { AppNavigationItem, AppShellBrand } from "./types";
import styles from "./AppShell.module.css";

function NavigationLink({ item, nested = false }: { item: AppNavigationItem; nested?: boolean }) {
  const className = nested
    ? `${styles.submenuLink} ${item.active ? styles.submenuLinkActive : ""}`
    : `${styles.navLink} ${item.active ? styles.navLinkActive : ""}`;

  return (
    <Link href={item.href} className={className} aria-current={item.active ? "page" : undefined}>
      {item.icon && <span className={styles.navIcon}>{item.icon}</span>}
      <span>{item.label}</span>
    </Link>
  );
}

export default function AppSidebar({
  brand,
  navigation,
  logout,
  navigationLabel = "Navigasi utama",
}: {
  brand: AppShellBrand;
  navigation: AppNavigationItem[];
  logout?: React.ReactNode;
  navigationLabel?: string;
}) {
  return (
    <aside className={styles.sidebar}>
      <Link href={brand.href} className={styles.brandBlock}>
        <span className={styles.brandMark}>{brand.icon}</span>
        <span className={styles.brandText}>
          <strong>{brand.title}</strong>
          <small>{brand.subtitle}</small>
        </span>
      </Link>

      <nav className={styles.navigation} aria-label={navigationLabel}>
        {navigation.map((item) => (
          <div className={styles.navGroup} key={item.href}>
            <NavigationLink item={item} />
            {item.children && item.children.length > 0 && (
              <div className={styles.submenu}>
                {item.children.map((child) => <NavigationLink key={child.href} item={child} nested />)}
              </div>
            )}
          </div>
        ))}
      </nav>

      {logout && <div className={styles.logoutArea}>{logout}</div>}
    </aside>
  );
}
