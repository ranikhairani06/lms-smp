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

function inlineInstructionContent(text: string, keyPrefix: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\*[^*]+\*|\[[^\]]+\]\((?:https?:\/\/|mailto:)[^)]+\))/g;
  const output: ReactNode[] = [];
  let cursor = 0;
  let index = 0;
  for (const match of text.matchAll(pattern)) {
    const value = match[0];
    const start = match.index ?? 0;
    if (start > cursor) output.push(text.slice(cursor, start));
    const key = `${keyPrefix}-${index++}`;
    if (value.startsWith("**")) output.push(<strong key={key}>{value.slice(2, -2)}</strong>);
    else if (value.startsWith("__")) output.push(<u key={key}>{value.slice(2, -2)}</u>);
    else if (value.startsWith("~~")) output.push(<s key={key}>{value.slice(2, -2)}</s>);
    else if (value.startsWith("*")) output.push(<em key={key}>{value.slice(1, -1)}</em>);
    else {
      const link = value.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) output.push(<a key={key} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>);
      else output.push(value);
    }
    cursor = start + value.length;
  }
  if (cursor < text.length) output.push(text.slice(cursor));
  return output;
}

export function AssessmentInstructions({ content, className }: { content: string; className?: string }) {
  const lines = content.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let index = 0;
  while (index < lines.length) {
    if (!lines[index].trim()) { index += 1; continue; }
    const unordered = /^\s*[-*]\s+/.test(lines[index]);
    const ordered = /^\s*\d+\.\s+/.test(lines[index]);
    if (unordered || ordered) {
      const items: ReactNode[] = [];
      while (index < lines.length && (unordered ? /^\s*[-*]\s+/.test(lines[index]) : /^\s*\d+\.\s+/.test(lines[index]))) {
        items.push(<li key={index}>{inlineInstructionContent(lines[index].replace(unordered ? /^\s*[-*]\s+/ : /^\s*\d+\.\s+/, ""), `list-${index}`)}</li>);
        index += 1;
      }
      blocks.push(unordered ? <ul key={`block-${index}`}>{items}</ul> : <ol key={`block-${index}`}>{items}</ol>);
      continue;
    }
    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() && !/^\s*[-*]\s+/.test(lines[index]) && !/^\s*\d+\.\s+/.test(lines[index])) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push(<p key={`block-${index}`}>{inlineInstructionContent(paragraph.join(" "), `paragraph-${index}`)}</p>);
  }
  return <div className={["assessment-instructions", className].filter(Boolean).join(" ")}>{blocks}</div>;
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
