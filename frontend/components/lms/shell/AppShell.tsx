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
  mobileNavigationBreakpoint = "default",
  mobileNavigationPresentation = "panel",
  mobileNavigationColumns = 6,
  collapseBehavior = "compact",
  mobileNavigationMode = "default",
  collapsed = false,
  onToggleCollapse,
  menuIcon,
  navigationLabel = "Navigasi utama",
  mobileNavigationLabel = "Navigasi mobile",
  logout,
  children,
  mainId,
  mainClassName = "",
  footerClassName = "",
  className = "",
}: AppShellProps) {
  return (
    <div className={`${styles.appShell} ${collapsed ? styles.collapsed : ""} ${collapseBehavior === "hide" ? styles.hideCollapsedSidebar : ""} ${mobileNavigationMode === "teacher" ? styles.teacherMobileShell : ""} ${mobileNavigationBreakpoint === "tablet" ? styles.tabletMobileNavigation : ""} ${mobileNavigationBreakpoint === "narrow" ? styles.narrowMobileNavigation : ""} ${mobileNavigationPresentation === "bar" ? styles.fullWidthMobileNavigation : ""} ${className}`}>
      <AppTopBar
        title={topbar.title}
        leadingIcon={topbar.leadingIcon}
        rightSlot={topbar.rightSlot}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        menuIcon={menuIcon}
      />
      <AppSidebar brand={brand} navigation={navigation} logout={logout} navigationLabel={navigationLabel} />
      <main id={mainId} className={`${styles.mainArea} ${mainClassName}`}>
        <div className={styles.mainContent}>{children}</div>
        <footer className={`${styles.footer} ${footerClassName}`}>{footer}</footer>
        {mobileNavigation.length > 0 && <AppMobileNav items={mobileNavigation} label={mobileNavigationLabel} columns={mobileNavigationColumns} className={mobileNavigationMode === "teacher" ? styles.teacherMobileNav : ""} />}
      </main>
    </div>
  );
}
