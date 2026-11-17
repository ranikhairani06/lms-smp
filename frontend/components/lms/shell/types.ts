import type { ReactNode } from "react";

export type AppNavigationItem = {
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
  children?: AppNavigationItem[];
};

export type AppShellBrand = {
  href: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
};

export type AppShellTopbar = {
  title: string;
  rightSlot?: ReactNode;
};

export type AppShellProps = {
  brand: AppShellBrand;
  navigation: AppNavigationItem[];
  topbar: AppShellTopbar;
  footer: ReactNode;
  mobileNavigation?: AppNavigationItem[];
  collapseBehavior?: "compact" | "hide";
  mobileNavigationMode?: "default" | "teacher";
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  menuIcon?: ReactNode;
  navigationLabel?: string;
  mobileNavigationLabel?: string;
  logout?: ReactNode;
  children: ReactNode;
  mainClassName?: string;
  footerClassName?: string;
  className?: string;
};
