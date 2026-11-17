import type { AppShellProps } from "./types";
import AppMobileNav from "./AppMobileNav";
import AppSidebar from "./AppSidebar";
import AppTopBar from "./AppTopBar";
import styles from "./AppShell.module.css";

export default function AppShell({
  brand,
  navigation,
  topbar,
  footer,
  mobileNavigation = [],
  collapseBehavior = "compact",
  mobileNavigationMode = "default",
  collapsed = false,
  onToggleCollapse,
  menuIcon,
  navigationLabel = "Navigasi utama",
  mobileNavigationLabel = "Navigasi mobile",
  logout,
  children,
  mainClassName = "",
  footerClassName = "",
  className = "",
}: AppShellProps) {
  return (
    <div className={`${styles.appShell} ${collapsed ? styles.collapsed : ""} ${collapseBehavior === "hide" ? styles.hideCollapsedSidebar : ""} ${mobileNavigationMode === "teacher" ? styles.teacherMobileShell : ""} ${className}`}>
      <AppTopBar
        title={topbar.title}
        rightSlot={topbar.rightSlot}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        menuIcon={menuIcon}
      />
      <AppSidebar brand={brand} navigation={navigation} logout={logout} navigationLabel={navigationLabel} />
      <main className={`${styles.mainArea} ${mainClassName}`}>
        <div className={styles.mainContent}>{children}</div>
        <footer className={`${styles.footer} ${footerClassName}`}>{footer}</footer>
        {mobileNavigation.length > 0 && <AppMobileNav items={mobileNavigation} label={mobileNavigationLabel} className={mobileNavigationMode === "teacher" ? styles.teacherMobileNav : ""} />}
      </main>
    </div>
  );
}
