"use client";

import type { ReactNode } from "react";
import styles from "../AdminUI.module.css";
import AdminIcon from "../AdminIcons";

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
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  icon?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  form?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button type={type} form={form} disabled={disabled} onClick={onClick} className={`${styles.button} ${styles[`button_${variant}`]} ${className}`}>
      {icon && <AdminIcon name={icon} size={17} />}
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
}: {
  label: string;
  value: string;
  detail?: string;
  icon: string;
  tone?: Tone;
}) {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles[`tone_${tone}`]}`}><AdminIcon name={icon} size={20} /></div>
      <div className={styles.statBody}>
        <span className={styles.statLabel}>{label}</span>
        <strong className={styles.statValue}>{value}</strong>
        {detail && <span className={styles.statDetail}>{detail}</span>}
      </div>
    </div>
  );
}

export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return <span className={`${styles.statusBadge} ${styles[`badge_${tone}`]}`}>{children}</span>;
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
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  width?: "medium" | "wide";
}) {
  return (
    <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={`${styles.modal} ${width === "wide" ? styles.modalWide : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        {/* Bagian tampilan: header modal dan tombol tutup. */}
        <header className={styles.modalHeader}>
          <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Tutup"><AdminIcon name="close-circle-linear" size={21} /></button>
        </header>
        <div className={styles.modalContent}>{children}</div>
        {footer && <footer className={styles.modalFooter}>{footer}</footer>}
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  hint?: string;
}) {
  return (
    <label className={styles.formField}>
      <span>{label}{required && <b> *</b>}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function InfoBanner({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "success" | "warning" | "danger" }) {
  const icon = tone === "success" ? "check-circle-linear" : tone === "warning" ? "danger-triangle-linear" : tone === "danger" ? "close-circle-linear" : "info-circle-linear";
  return <div className={`${styles.infoBanner} ${styles[`info_${tone}`]}`}><AdminIcon name={icon} size={19} /><div>{children}</div></div>;
}

export { styles as adminStyles };
