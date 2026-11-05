import Link from "next/link";
import type { ReactNode } from "react";
import { Solar } from "./icon";
export function Card({
  title,
  subtitle,
  children,
  className = "",
  action,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={`es-card ${className}`}>
      {title && (
        <header className="es-card-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p className="es-muted es-small">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
export function Badge({
  children,
  tone = "primary",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`es-badge es-${tone}`}>{children}</span>;
}
export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={`es-button es-button-${variant} ${className}`}>
      {children}
    </Link>
  );
}
export function Progress({
  value,
  label = "Progres pembelajaran",
}: {
  value: number;
  label?: string;
}) {
  return (
    <div className="es-progress">
      <div className="es-between">
        <span className="es-small es-muted">{label}</span>
        <strong className="es-small">{value}%</strong>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        className="es-track"
      >
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
export function Stats({
  items,
}: {
  items: { label: string; value: string; icon: string; hint?: string }[];
}) {
  return (
    <div
      className="es-stats"
      style={{ "--stat-count": items.length } as React.CSSProperties}
    >
      {items.map((item) => (
        <Card key={item.label}>
          <div className="es-between">
            <span className="es-icon-tile">
              <Solar name={item.icon} />
            </span>
            <span className="es-small es-muted">{item.label}</span>
          </div>
          <strong className="es-stat-value">{item.value}</strong>
          {item.hint && <p className="es-small es-muted">{item.hint}</p>}
        </Card>
      ))}
    </div>
  );
}
export function Heading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="es-page-heading">
      <div className="es-between">
        <div>
          <h1>{title}</h1>
          {subtitle && <p className="es-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
    </Card>
  );
}
export function Attachment({
  name,
  size = "1,2 MB",
}: {
  name: string;
  size?: string;
}) {
  return (
    <div className="es-attachment">
      <span className="es-icon-tile">
        <Solar name="file-text" />
      </span>
      <div>
        <strong className="es-small">{name}</strong>
        <p className="es-small es-muted">{size}</p>
      </div>
      <a
        className="es-button es-button-outline"
        download={name.replace(/\.pdf$/, ".txt")}
        href={
          "data:text/plain;charset=utf-8," +
          encodeURIComponent(
            "EduSpace — berkas contoh untuk demonstrasi antarmuka.\nMateri: " +
              name +
              "\nGanti tautan ini dengan URL berkas dari API.",
          )
        }
      >
        Unduh
        <Solar name="download" />
      </a>
    </div>
  );
}
