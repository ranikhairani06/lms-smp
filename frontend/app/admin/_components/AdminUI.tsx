"use client";

import { useId, type CSSProperties, type InputHTMLAttributes, type ReactNode } from "react";
import styles from "./AdminUI.module.css";
import AdminIcon from "./AdminIcons";

export type Tone = "primary" | "success" | "warning" | "danger" | "info" | "neutral" | "amber" | "upcoming";

export function PageHeader({
  breadcrumbs,
  title,
  description,
  actions,
  variant = "default",
  below,
  className = "",
}: {
  breadcrumbs: string[];
  title: string;
  description?: string;
  actions?: ReactNode;
  variant?: "default" | "card";
  below?: ReactNode;
  className?: string;
}) {
  const headingContent = (
    <>
      <div className={styles.pageHeading}>
        <div>
          <h1 className={styles.pageTitle}>{title}</h1>
          {description && <p className={styles.pageDescription}>{description}</p>}
        </div>
        {actions && <div className={styles.headingActions}>{actions}</div>}
      </div>
      {below}
    </>
  );

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
      {variant === "card" ? <div className={`${styles.pageHeadingCard} ${className}`}>{headingContent}</div> : headingContent}
    </>
  );
}

export const PageHeading = PageHeader;

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
  size = "default",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "softPrimary" | "primarySolid" | "dark";
  icon?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  form?: string;
  disabled?: boolean;
  className?: string;
  tone?: "amber";
  style?: CSSProperties;
  iconSize?: number;
  size?: "default" | "medium";
}) {
  return (
    <button type={type} form={form} disabled={disabled} onClick={onClick} className={`${styles.button} ${size === "medium" ? styles.buttonMedium : ""} ${styles[`button_${variant}`]} ${tone === "amber" ? styles.buttonAmber : ""} ${className}`} style={style}>
      {icon && <AdminIcon name={icon} size={iconSize} />}
      {children}
    </button>
  );
}

export function ManagementHeaderActions({
  onImport,
  onAdd,
  addLabel,
  importing = false,
}: {
  onImport: () => void;
  onAdd: () => void;
  addLabel: string;
  importing?: boolean;
}) {
  return (
    <div className={styles.managementHeaderActions}>
      <ImportDataButton onClick={onImport} disabled={importing} label={importing ? "Membaca File..." : undefined} />
      <AddButton onClick={onAdd} label={addLabel} icon="user-plus-linear" />
    </div>
  );
}

// Bagian tampilan: tombol impor dengan outline amber yang konsisten.
export function ImportDataButton({ onClick, disabled = false, label = "Import Data (CSV)" }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return <Button className={styles.importDataButton} variant="outline" tone="amber" icon="upload-linear" onClick={onClick} disabled={disabled}>{label}</Button>;
}

// Bagian tampilan: tombol aksi utama admin dengan label dan ikon dari pemanggil.
export function AddButton({ onClick, label, icon }: { onClick: () => void; label: string; icon: string }) {
  return <Button className={styles.addButton} icon={icon} onClick={onClick}>{label}</Button>;
}

// Bagian tampilan: badge yang menandai tabel berisi data contoh.
export function ExampleBadge() {
  return <span className={styles.exampleBadge}>Data contoh</span>;
}


export function StatCard({
  label,
  value,
  detail,
  footer,
  icon,
  tone = "primary",
  compact = false,
  hideEmptyDetail = false,
  valueFirst = false,
  valueTone,
  variant = "default",
  valueNote,
  footerTone,
  valueFullWidth = false,
}: {
  label: string;
  value: string;
  detail?: string;
  footer?: string;
  icon: string;
  tone?: Tone;
  compact?: boolean;
  hideEmptyDetail?: boolean;
  valueFirst?: boolean;
  valueTone?: "warning" | "danger";
  variant?: "default" | "updateData" | "showcase" | "report";
  valueNote?: string;
  footerTone?: "success" | "warning" | "danger" | "info";
  valueFullWidth?: boolean;
}) {
  const detailText = footer ?? detail;
  const hasDetail = detailText !== undefined && detailText !== "";
  return (
    <div className={`${styles.statCard} ${compact ? styles.statCardCompact : ""} ${valueFirst ? styles.statCardValueFirst : ""} ${variant === "updateData" || variant === "report" ? styles.statCardUpdateData : ""} ${variant === "showcase" ? styles.statCardShowcase : ""} ${variant === "report" ? styles.statCardReport : ""}`}>

      {/* Bagian atas: ikon, label, dan angka statistik */}
      <div className={styles.statHeader}>

        <div className={`${styles.statIcon} ${styles[`tone_${tone}`]}`}>
          <AdminIcon name={icon} size={20} />
        </div>

        <div className={`${styles.statBody} ${valueFirst ? styles.statBodyValueFirst : ""}`}>
          <span className={styles.statLabel}>
            {label}
          </span>

          {valueNote ? (
            <span className={styles.statValueWithNote}>
              <strong className={`${styles.statValue} ${valueFullWidth ? styles.statValueFullWidth : ""} ${valueTone ? styles[`statValue_${valueTone}`] : ""}`}>{value}</strong>
              <small>{valueNote}</small>
            </span>
          ) : (
            <strong className={`${styles.statValue} ${valueFullWidth ? styles.statValueFullWidth : ""} ${valueTone ? styles[`statValue_${valueTone}`] : ""}`}>
              {value}
            </strong>
          )}
        </div>

      </div>

      {/* Bagian bawah: garis pembatas dan deskripsi */}
      {hideEmptyDetail && !hasDetail ? null : (
        <span className={`${styles.statDetail} ${footerTone ? styles[`statDetail_${footerTone}`] : ""}`}>
          {hasDetail ? detailText : "\u00a0"}
        </span>
      )}

    </div>
  );
}

// Bagian tampilan: avatar inisial untuk identitas siswa dan guru pada laporan.
export function AvatarInitials({ initials, tone = "primary" }: { initials: string; tone?: "primary" | "info" | "warning" | "danger" | "success" }) {
  return <span className={`${styles.reportAvatar} ${styles[`reportAvatar_${tone}`]}`} aria-hidden="true">{initials}</span>;
}

// Bagian tampilan: chip nilai rendah agar mudah dikenali pada tabel laporan.
export function ScoreChip({ children }: { children: ReactNode }) {
  return <span className={styles.scoreChip}>{children}</span>;
}

// Bagian tampilan: indikator rata-rata progres pembelajaran.
export function ProgressBar({ value, tone = "primary" }: { value: number; tone?: "primary" | "warning" }) {
  return <span className={styles.reportProgress} role="img" aria-label={`Progres ${value.toFixed(1)}%`}><span className={styles[`reportProgress_${tone}`]} style={{ width: `${value}%` }} /></span>;
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
  className = "",
}: {
  icon: string;
  title: string;
  ariaLabel: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button type="button" className={`${styles.iconButton} ${className}`} title={title} aria-label={ariaLabel} onClick={onClick} disabled={disabled}>
      <AdminIcon name={icon} size={15} />
    </button>
  );
}


export function StatusBadge({ children, tone = "neutral", className = "", outlined = false }: { children: ReactNode; tone?: Tone; className?: string; outlined?: boolean }) {
  return <span className={`${styles.statusBadge} ${styles[`badge_${tone}`]} ${outlined ? styles.statusBadgeOutlined : ""} ${className}`}>{children}</span>;
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
  variant = "default",
  className = "",
  controlsClassName = "",
  currentPageClassName = "",
  emphasizeLabelNumbers = false,
  trailingEllipsis = false,
}: {
  current?: number;
  total?: number;
  onChange?: (page: number) => void;
  label?: string;
  variant?: "default" | "directory";
  className?: string;
  controlsClassName?: string;
  currentPageClassName?: string;
  emphasizeLabelNumbers?: boolean;
  trailingEllipsis?: boolean;
}) {
  /* Varian ini menampilkan elipsis akhir pada pagination laporan aktivitas. */
  const pages: (number | "ellipsis")[] = trailingEllipsis
    ? [1, 2, 3, "ellipsis"]
    : variant === "directory"
    ? total <= 5
      ? Array.from({ length: total }, (_, index) => index + 1)
      : current <= 3
        ? [1, 2, 3, "ellipsis", total]
        : current >= total - 2
          ? [1, "ellipsis", total - 2, total - 1, total]
          : [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total]
    : Array.from({ length: total }, (_, index) => index + 1);
  const labelContent = emphasizeLabelNumbers
    ? label?.split(/(\d+(?:-\d+)?)/g).map((part, index) =>
      /^\d+(?:-\d+)?$/.test(part) ? <strong key={`${part}-${index}`}>{part}</strong> : part,
    )
    : label;

  return (
    <div className={`${styles.pagination} ${variant === "directory" ? styles.paginationDirectory : ""} ${className}`}>
      {label && <span>{labelContent}</span>}
      <div className={`${styles.pageControls} ${controlsClassName}`}>
        <button aria-label="Halaman sebelumnya" onClick={() => onChange?.(Math.max(1, current - 1))} disabled={current <= 1}>
          <AdminIcon name="alt-arrow-left-linear" size={15} />
        </button>
        {pages.map((page, index) => page === "ellipsis"
          ? <span className={styles.pageEllipsis} key={`ellipsis-${index}`}>...</span>
          : <button key={page} className={`${current === page ? styles.pageCurrent : ""} ${current === page ? currentPageClassName : ""}`} onClick={() => onChange?.(page)} aria-current={current === page ? "page" : undefined}>{page}</button>
        )}
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
  labelHint,
  trailingIcon,
  valid,
  validLabel,
  className = "",
  error,
  onBlur,
  inputMode,
  maxLength,
  min,
  step,
  leadingIcon,
  trailingAction,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  hint?: string;
  labelHint?: string;
  trailingIcon?: string;
  valid?: boolean;
  validLabel?: string;
  className?: string;
  error?: string;
  onBlur?: () => void;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  min?: number;
  step?: number;
  leadingIcon?: string;
  trailingAction?: ReactNode;
}) {
  const errorId = useId();
  const validationEnabled = valid !== undefined || validLabel !== undefined || trailingIcon !== undefined;
  return (
    <label className={`${styles.formField} ${error ? styles.formFieldInvalid : ""} ${className}`}>
      {labelHint ? (
        <span className={styles.fieldLabelRow}>
          <span>{label}{required && <b> *</b>}</span>
          <small className={styles.formLabelHint}>{labelHint}</small>
        </span>
      ) : validationEnabled ? (
        <span className={styles.fieldLabelRow}>
          <span>{label}{required && <b> *</b>}</span>
          {valid && validLabel && <small className={styles.fieldValidLabel}><AdminIcon name="check-circle-bold" size={13} />{validLabel}</small>}
        </span>
      ) : <span>{label}{required && <b> *</b>}</span>}
      {validationEnabled || leadingIcon || trailingAction ? (
        <span className={`${styles.fieldControlWrap} ${leadingIcon || trailingAction ? styles.fieldControlWithActions : ""} ${valid ? styles.fieldControlValid : ""}`}>
          {leadingIcon && <AdminIcon className={styles.fieldLeadingIcon} name={leadingIcon} size={16} />}
          <input id={error ? errorId : undefined} type={type} value={value} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} inputMode={inputMode} maxLength={maxLength} min={min} step={step} aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined} placeholder={placeholder} />
          {trailingAction}
          {error ? <AdminIcon name="danger-triangle-linear" size={14} /> : valid ? <AdminIcon name="check-circle-bold" size={14} /> : trailingIcon ? <AdminIcon name={trailingIcon} size={14} /> : null}
        </span>
      ) : <input id={error ? errorId : undefined} type={type} value={value} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} inputMode={inputMode} maxLength={maxLength} min={min} step={step} aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined} placeholder={placeholder} />}
      {error && <small id={errorId} className={styles.fieldError} role="alert"><AdminIcon name="danger-triangle-linear" size={14} />{error}</small>}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function InfoBanner({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "success" | "warning" | "danger" | "primary" }) {
  const icon = tone === "primary" ? "info-circle-bold" : tone === "success" ? "check-circle-linear" : tone === "warning" ? "danger-triangle-linear" : tone === "danger" ? "close-circle-linear" : "info-circle-linear";
  return <div className={`${styles.infoBanner} ${styles[`info_${tone}`]}`}><AdminIcon name={icon} size={19} /><div>{children}</div></div>;
}

export { styles as adminStyles };
