import type { ReactNode } from "react";
import styles from "./AppShell.module.css";

export default function AppTopBar({
  title,
  rightSlot,
  collapsed = false,
  onToggleCollapse,
  menuIcon,
}: {
  title: string;
  rightSlot?: ReactNode;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  menuIcon?: ReactNode;
}) {
  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        {onToggleCollapse && (
          <button
            className={styles.menuToggle}
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Perluas menu" : "Ciutkan menu"}
            aria-expanded={!collapsed}
          >
            {menuIcon}
          </button>
        )}
        <strong>{title}</strong>
      </div>
      {rightSlot && <div className={styles.topbarRight}>{rightSlot}</div>}
    </header>
  );
}
