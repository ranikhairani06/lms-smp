"use client";

import type { CSSProperties, ReactNode } from "react";
import styles from "./AdminUI.module.css";
import AdminIcon from "./AdminIcons";

export type Tone = "primary" | "success" | "warning" | "danger" | "info" | "neutral" | "amber";

export function PageHeading({
  breadcrumbs,
  title,
  description,
  actions,
}: {
  breadcrumbs: string[];
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <>
      {/* Bagian tampilan: breadcrumb halaman dan judul utama. */}
      <div className={styles.breadcrumb}>
        {breadcrumbs.map((item, index) => (
          <span key={`${item}-${index}`} className={index === breadcrumbs.length - 1 ? styles.breadcrumbActive : ""}>
            {index > 0 && <AdminIcon name="alt-arrow-right-linear" size={13} />}
            {item}
          </span>
        ))}
      </div>
      <div className={styles.pageHeading}>
        <div>
          <h1 className={styles.pageTitle}>{title}</h1>
          {description && <p className={styles.pageDescription}>{description}</p>}
        </div>
        {actions && <div className={styles.headingActions}>{actions}</div>}
      </div>
    </>
  );
}

export function Button({
  children,
  variant = "primary",
  icon,
  onClick,
  type = "button",
  form,
  disabled = false,
  className = "",
  tone,
  style,
  iconSize = 17,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  icon?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  form?: string;
  disabled?: boolean;
  className?: string;
  tone?: "amber";
  style?: CSSProperties;
  iconSize?: number;
}) {
  return (
    <button type={type} form={form} disabled={disabled} onClick={onClick} className={`${styles.button} ${styles[`button_${variant}`]} ${tone === "amber" ? styles.buttonAmber : ""} ${className}`} style={style}>
      {icon && <AdminIcon name={icon} size={iconSize} />}
      {children}
    </button>
  );
}


export function StatCard({
  label,
  value,
  detail,
  icon,
  tone = "primary",
  compact = false,
}: {
  label: string;
  value: string;
  detail?: string;
  icon: string;
  tone?: Tone;
  compact?: boolean;
}) {
  return (
    <div className={`${styles.statCard} ${compact ? styles.statCardCompact : ""}`}>

      {/* Bagian atas: ikon, label, dan angka statistik */}
      <div className={styles.statHeader}>

        <div className={`${styles.statIcon} ${styles[`tone_${tone}`]}`}>
          <AdminIcon name={icon} size={20} />
        </div>

        <div className={styles.statBody}>
          <span className={styles.statLabel}>
            {label}
          </span>

          <strong className={styles.statValue}>
            {value}
          </strong>
        </div>

      </div>

      {/* Bagian bawah: garis pembatas dan deskripsi */}
      <span className={styles.statDetail}>
        {detail || "\u00a0"}
      </span>

    </div>
  );
}

export function AdminStatRow({
  items,
  columns,
}: {
  items: { label: string; value: string; icon: string; tone: Tone }[];
  columns: 3 | 4;
}) {
  const gridClass = columns === 4 ? styles.statGridFour : styles.statGridThree;

  return (
    <div className={`${gridClass} ${styles.adminStatRow}`}>
      {items.map((item) => <StatCard key={item.label} {...item} compact />)}
    </div>
  );
}

export function AdminTableIconButton({
  icon,
  title,
  ariaLabel,
  onClick,
  disabled = false,
}: {
  icon: string;
  title: string;
  ariaLabel: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" className={styles.iconButton} title={title} aria-label={ariaLabel} onClick={onClick} disabled={disabled}>
      <AdminIcon name={icon} size={15} />
    </button>
  );
}


export function StatusBadge({ children, tone = "neutral", className = "" }: { children: ReactNode; tone?: Tone; className?: string }) {
  return <span className={`${styles.statusBadge} ${styles[`badge_${tone}`]} ${className}`}>{children}</span>;
}

export function SearchField({
  value,
  onChange,
  placeholder = "Cari data...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className={styles.searchField}>
      <AdminIcon name="magnifer-linear" size={17} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

export function SelectField({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label?: string;
}) {
  return (
    <label className={styles.selectField}>
      {label && <span>{label}</span>}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
      <AdminIcon name="alt-arrow-down-linear" size={15} />
    </label>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`${styles.panel} ${className}`}>{children}</section>;
}

export function TableEmpty({ colSpan, label = "Data tidak ditemukan." }: { colSpan: number; label?: string }) {
  return <tr><td colSpan={colSpan} className={styles.emptyCell}>{label}</td></tr>;
}

export function Pagination({
  current = 1,
  total = 3,
  onChange,
  label,
}: {
  current?: number;
  total?: number;
  onChange?: (page: number) => void;
  label?: string;
}) {
  return (
    <div className={styles.pagination}>
      {label && <span>{label}</span>}
      <div className={styles.pageControls}>
        <button aria-label="Halaman sebelumnya" onClick={() => onChange?.(Math.max(1, current - 1))} disabled={current <= 1}>
          <AdminIcon name="alt-arrow-left-linear" size={15} />
        </button>
        {Array.from({ length: total }, (_, index) => index + 1).map((page) => (
          <button key={page} className={current === page ? styles.pageCurrent : ""} onClick={() => onChange?.(page)}>{page}</button>
        ))}
        <button aria-label="Halaman selanjutnya" onClick={() => onChange?.(Math.min(total, current + 1))} disabled={current >= total}>
          <AdminIcon name="alt-arrow-right-linear" size={15} />
        </button>
      </div>
    </div>
  );
}

export function Modal({
  title,
  subtitle,
  children,
  onClose,
  footer,
  width = "medium",
  layout = "default",
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  width?: "medium" | "wide";
  layout?: "default" | "studentForm";
  className?: string;
}) {
  const studentLayout = layout === "studentForm";
  return (
    <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section
        className={`${styles.modal} ${width === "wide" ? styles.modalWide : ""} ${className}`}
        style={studentLayout ? {
          width: "min(700px, 100%)",
          height: "calc(100vh - var(--space-2xl) - var(--space-2xl))",
          maxHeight: "calc(100vh - var(--space-2xl) - var(--space-2xl))",
        } : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Bagian tampilan: header modal dan tombol tutup. */}
        <header className={styles.modalHeader}>
          <div><h2 style={studentLayout ? { fontSize: "var(--text-h4-size)", lineHeight: "var(--text-h4-line)", fontWeight: "var(--font-weight-bold)" } : undefined}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Tutup"><AdminIcon name="close-circle-linear" size={21} /></button>
        </header>
        <div className={styles.modalContent} style={studentLayout ? { flex: "1 1 auto" } : undefined}>{children}</div>
        {footer && <footer className={styles.modalFooter} style={studentLayout ? { flexShrink: 0, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" } : undefined}>{footer}</footer>}
      </section>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  hint,
  valid,
  validLabel,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  hint?: string;
  valid?: boolean;
  validLabel?: string;
  className?: string;
}) {
  const validationEnabled = valid !== undefined || validLabel !== undefined;
  return (
    <label className={`${styles.formField} ${className}`}>
      {validationEnabled ? (
        <span className={styles.fieldLabelRow}>
          <span>{label}{required && <b> *</b>}</span>
          {valid && validLabel && <small className={styles.fieldValidLabel}><AdminIcon name="check-circle-bold" size={13} />{validLabel}</small>}
        </span>
      ) : <span>{label}{required && <b> *</b>}</span>}
      {validationEnabled ? (
        <span className={`${styles.fieldControlWrap} ${valid ? styles.fieldControlValid : ""}`}>
          <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
          {valid && <AdminIcon name="check-circle-bold" size={14} />}
        </span>
      ) : <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function InfoBanner({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "success" | "warning" | "danger" | "primary" }) {
  const icon = tone === "primary" ? "info-circle-bold" : tone === "success" ? "check-circle-linear" : tone === "warning" ? "danger-triangle-linear" : tone === "danger" ? "close-circle-linear" : "info-circle-linear";
  return <div className={`${styles.infoBanner} ${styles[`info_${tone}`]}`}><AdminIcon name={icon} size={19} /><div>{children}</div></div>;
}

export { styles as adminStyles };
