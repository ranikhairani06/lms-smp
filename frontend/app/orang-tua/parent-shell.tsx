"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Solar } from "../siswa/_components/icon";
import { initials, type AuthUser } from "@/lib/auth-types";
import LogoutButton from "@/components/lms/LogoutButton";
import { parentSubjectResults } from "./hasil-belajar/data";

const menu = [
  { label: "Dashboard", icon: "home-2", href: "/orang-tua" },
  {
    label: "Progres Belajar",
    icon: "ranking",
    href: "/orang-tua/progres",
  },
  {
    label: "Hasil Belajar",
    icon: "document-text",
    href: "/orang-tua/hasil-belajar",
  },
  { label: "Profil", icon: "user-circle", href: "/orang-tua/profil" },
];

export default function ParentShell({ children, user }: { children: ReactNode; user: AuthUser }) {
  const pathname = usePathname();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const currentItem = pathname.includes("/hasil-belajar")
    ? menu[2]
    : pathname.includes("/progres")
      ? menu[1]
      : pathname.includes("/profil")
        ? menu[3]
        : menu[0];
  const currentTitle = currentItem.label;
  const currentSubject = pathname.includes("/hasil-belajar/")
    ? parentSubjectResults.find((subject) => pathname.endsWith("/" + subject.slug))
    : undefined;

  return (
    <div className="parent-app">
      <a className="parent-skip" href="#parent-content">
        Lewati navigasi
      </a>

      <header className="parent-topbar">
        <strong className="parent-topbar-title">
          <Solar name="hamburger-menu" />
          {currentTitle}
        </strong>

        <div className="parent-topbar-actions">
          <div className="parent-notification-wrap">
            <button
              className="parent-icon-button"
              type="button"
              aria-label="Notifikasi"
              aria-expanded={notificationOpen}
              onClick={() => setNotificationOpen((open) => !open)}
            >
              <Solar name="bell" />
              <span className="parent-notification-dot" />
            </button>
            {notificationOpen && (
              <div className="parent-notification-popover">
                <strong>Notifikasi</strong>
                <p>Tugas Informatika akan dikumpulkan dalam 3 hari.</p>
                <p>Nilai Kuis Formatif Bab 1 sudah tersedia.</p>
              </div>
            )}
          </div>
          <div className="parent-user-chip">
            <span className="parent-avatar">{initials(user.name)}</span>
            <span>
              <strong>{user.name}</strong>
              <small>Orang Tua / Wali Siswa</small>
            </span>
          </div>
        </div>
      </header>

      <aside className="parent-sidebar">
        <Link className="parent-brand" href="/orang-tua">
          <span className="parent-brand-mark">
            <Solar name="square-academic-cap" />
          </span>
          <span>
            <strong>EduSpace LMS</strong>
            <small>Portal Orang Tua</small>
          </span>
        </Link>

        <nav className="parent-nav" aria-label="Navigasi orang tua">
          {menu.map((item) => {
            const active = currentItem.href === item.href;
            return <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`parent-nav-item ${active ? "is-active" : ""}`}
            >
              <Solar name={item.icon} />
              <span>{item.label}</span>
            </Link>;
          })}
        </nav>

        <button
          className="parent-logout"
          type="button"
          onClick={() => setLogoutOpen(true)}
        >
          <Solar name="logout-2" />
          Keluar
        </button>
      </aside>

      <main id="parent-content" className="parent-main">
        <nav className="parent-breadcrumb" aria-label="Breadcrumb">
          <Link href="/orang-tua">LMS</Link>
          <Solar name="alt-arrow-right" />
          {currentSubject ? <><Link href="/orang-tua/hasil-belajar">Hasil Belajar Siswa</Link><Solar name="alt-arrow-right" /><span aria-current="page">{currentSubject.name}</span></> : <span aria-current="page">{currentTitle}</span>}
        </nav>

        <div className="parent-page">{children}</div>

        <footer className="parent-footer">
          LMS SMP Terpadu • Sistem Administrasi &amp; Pembelajaran Terpadu
        </footer>
      </main>

      <nav className="parent-mobile-nav" aria-label="Navigasi orang tua mobile">
        {menu.map((item) => {
          const active = currentItem.href === item.href;
          return <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`parent-mobile-nav-item ${active ? "is-active" : ""}`}
          >
            <Solar name={item.icon} />
            <span>{item.label}</span>
          </Link>;
        })}
      </nav>

      {logoutOpen && (
        <div className="parent-modal-backdrop">
          <section
            className="parent-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="parent-logout-title"
          >
            <h2 id="parent-logout-title">Keluar dari portal orang tua?</h2>
            <p>Anda akan kembali ke halaman login.</p>
            <div className="parent-modal-actions">
              <button
                type="button"
                className="parent-button parent-button-outline"
                onClick={() => setLogoutOpen(false)}
              >
                Batal
              </button>
              <LogoutButton className="parent-button" />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
