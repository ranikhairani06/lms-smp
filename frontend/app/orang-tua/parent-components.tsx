import type { ReactNode } from "react";
import Link from "next/link";
import { Solar } from "../siswa/_components/icon";

export function ParentCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`parent-card ${className}`}>{children}</section>;
}

export function ParentPageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <section className="parent-page-heading">
      <div>
        {eyebrow && <p className="parent-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <Link className="parent-button parent-button-outline" href={action.href}><Solar name="arrow-left" />{action.label}</Link>}
    </section>
  );
}

export function ParentStat({
  label,
  value,
  note,
  icon,
  tone = "blue",
  badge,
  description,
  emphasis = false,
}: {
  label: string;
  value: ReactNode;
  note: string;
  icon?: string;
  tone?: "blue" | "green" | "amber" | "purple";
  badge?: string;
  description?: string;
  emphasis?: boolean;
}) {
  return (
    <ParentCard className={`parent-stat-card tone-${tone}${emphasis ? " is-emphasized" : ""}`}>
      <div className="parent-stat-heading"><p>{label}</p>{icon && <span className={`parent-stat-icon tone-${tone}`}><Solar name={icon} /></span>}</div>
      <div className="parent-stat-value"><strong>{value}</strong>{badge && <span className={`parent-status ${tone === "amber" ? "is-attention" : "is-done"}`}>{badge}</span>}</div>
      {description && <p className="parent-stat-description">{description}</p>}
      <small className="parent-stat-note">{note}</small>
    </ParentCard>
  );
}

export function ParentProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div className="parent-progress-row">
      <div className="parent-progress-track" role="progressbar" aria-label={label ?? "Progres"} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${value}%` }} />
      </div>
      <strong>{value}%</strong>
    </div>
  );
}
