"use client";

import Link from "next/link";
import { useEffect, useId, useRef, type ReactNode, type ButtonHTMLAttributes } from "react";
import { Solar } from "../../siswa/_components/icon";

export function Card({ title, description, action, children, className = "" }: { title?: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`tg-card ${className}`}>{title && <header className="tg-card-heading"><div><h2>{title}</h2>{description && <p className="tg-small">{description}</p>}</div>{action}</header>}{children}</section>;
}
export function Heading({ title, description, action, hero = false }: { title: string; description?: string; action?: ReactNode; hero?: boolean }) {
  return <div className={`tg-heading ${hero ? "tg-card" : ""}`}><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>;
}
export function Badge({ children, tone = "primary" }: { children: ReactNode; tone?: string }) { return <span className={`tg-badge tg-${tone}`}>{children}</span>; }
export function Button({ children, tone = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: string }) { return <button {...props} className={`tg-button tg-button-${tone} ${props.className || ""}`}>{children}</button>; }
export function Action({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) { return <Link className={`tg-button tg-button-${secondary ? "outline" : "primary"}`} href={href}>{children}</Link>; }
export function Stats({ items }: { items: { label: string; value: ReactNode; note: string; icon?: string; warning?: boolean }[] }) {
  return <div className="tg-stats" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>{items.map(item => <Card key={item.label} className={item.warning ? "tg-stat tg-stat-warning" : "tg-stat"}><div className="tg-between"><span className="tg-icon-tile"><Solar name={item.icon || "chart-square"} /></span><span className="tg-label">{item.label}</span></div><strong className="tg-stat-value">{item.value}</strong><p className="tg-small">{item.note}</p></Card>)}</div>;
}
export function Progress({ value, label = "Progres", tone = "primary" }: { value: number; label?: string; tone?: string }) {
  return <div className={`tg-progress tg-${tone}`}><div className="tg-between tg-small"><span>{label}</span><strong>{value}%</strong></div><div className="tg-track" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div></div>;
}
export function Tabs({ items, active }: { items: { label: string; href: string }[]; active: string }) { return <nav className="tg-tabs" aria-label="Bagian halaman">{items.map(item => <Link href={item.href} key={item.href} aria-current={active === item.href ? "page" : undefined}>{item.label}</Link>)}</nav>; }
export function Search({ value, onChange, placeholder = "Cari nama atau NISN..." }: { value: string; onChange: (value: string) => void; placeholder?: string }) { return <label className="tg-search"><Solar name="magnifier" /><input type="search" aria-label={placeholder} placeholder={placeholder} value={value} onChange={event => onChange(event.target.value)} /></label>; }
export function Table({ headers, children, label = "Tabel pembelajaran" }: { headers: string[]; children: ReactNode; label?: string }) { return <div className="tg-table-wrap" tabIndex={0} role="region" aria-label={label}><table><thead><tr>{headers.map(header => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>; }
export function Empty({ text = "Tidak ada data yang sesuai dengan pencarian.", reset }: { text?: string; reset?: () => void }) { return <div className="tg-empty"><Solar name="folder-open" /><h3>{text}</h3>{reset && <Button tone="outline" onClick={reset}>Bersihkan Pencarian</Button>}</div>; }
export function Notice({ children, tone = "info" }: { children: ReactNode; tone?: string }) { return <div className={`tg-notice tg-${tone}`}><Solar name="info-circle" /><div>{children}</div></div>; }
export function Chart({ values = [7, 26, 48, 17], labels = ["< 75", "75–84", "85–94", "95–100"] }: { values?: number[]; labels?: string[] }) { return <div className="tg-chart" role="img" aria-label={labels.map((label, index) => `${label}: ${values[index]} siswa`).join(", ")}>{values.map((value, index) => <div key={index}><strong className="tg-small">{value}</strong><span style={{ height: `${value / Math.max(...values) * 112}px` }} /><small>{labels[index]}</small></div>)}</div>; }
export function Dialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  return <dialog className="tg-dialog" ref={ref} aria-labelledby={titleId} onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}><div className="tg-between"><h2 id={titleId}>{title}</h2><button className="tg-icon-button" aria-label="Tutup dialog" onClick={onClose}><Solar name="close-circle" /></button></div>{children}</dialog>;
}
export function Period() { return <Badge><Solar name="calendar" />Tahun Ajaran 2026/2027 · Ganjil</Badge>; }
