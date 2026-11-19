import type { ReactNode } from "react";
import styles from "./AppShell.module.css";

export default function AppTopBar({
  title,
  leadingIcon,
  rightSlot,
  collapsed = false,
  onToggleCollapse,
  menuIcon,
}: {
  title: string;
  leadingIcon?: ReactNode;
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
        <strong className={leadingIcon ? styles.topbarTitleWithIcon : ""}>{leadingIcon}{title}</strong>
      </div>
      {rightSlot && <div className={styles.topbarRight}>{rightSlot}</div>}
    </header>
  );
}
