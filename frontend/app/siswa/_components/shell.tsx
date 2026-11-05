"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Solar } from "./icon";
import { initials, type AuthUser } from "@/lib/auth-types";
import LogoutButton from "@/components/lms/LogoutButton";
const menus = [
  {
    href: "/siswa",
    label: "Dashboard",
    icon: "home-2",
  },
  {
    href: "/siswa/mata-pelajaran",
    label: "Mata Pelajaran",
    icon: "book-bookmark",
  },
  {
    href: "/siswa/progres",
    label: "Progress Pembelajaran",
    icon: "ranking",
  },
  {
    href: "/siswa/riwayat",
    label: "Riwayat",
    icon: "clock-circle",
  },
  {
    href: "/siswa/profil",
    label: "Profil",
    icon: "user-circle",
  },
];
export default function Shell({ children, user }: { children: ReactNode; user: AuthUser }) {
  const displayName = "Andi Pratama";
  const path = usePathname();
  const [notifications, setNotifications] = useState(false);
  const [logout, setLogout] = useState(false);
  const active =
    menus.find((m) =>
      m.href === "/siswa" ? path === m.href : path.startsWith(m.href),
    ) || menus[1];
  const nav = menus.map((m) => (
    <Link
      key={m.href}
      href={m.href}
      aria-current={m === active ? "page" : undefined}
      className={`es-nav-item ${m === active ? "is-active" : ""}`}
    >
      <Solar name={m.icon} />
      <span>{m.label}</span>
    </Link>
  ));
  return (
    <div className="student-app">
      <a className="es-skip" href="#student-content">
        Lewati navigasi
      </a>
      <header className="es-topbar">
        <strong>
          <Solar name="hamburger-menu" />
          {active.label}
        </strong>
        <div className="es-top-actions">
          <div className="es-notification-wrap">
            <button
              className="es-icon-button"
              aria-label="Notifikasi"
              aria-expanded={notifications}
              onClick={() => setNotifications(!notifications)}
            >
              <Solar name="bell" />
              <span className="es-dot" />
            </button>
            {notifications && (
              <div className="es-dropdown">
                <strong>Notifikasi</strong>
                <Link
                  onClick={() => setNotifications(false)}
                  href="/siswa/mata-pelajaran/informatika/tugas/1"
                >
                  Tugas analisis topologi jaringan tersedia.
                </Link>
                <Link
                  onClick={() => setNotifications(false)}
                  href="/siswa/mata-pelajaran/informatika/kuis/1"
                >
                  Kuis formatif siap dikerjakan.
                </Link>
              </div>
            )}
          </div>
          <Link href="/siswa/profil" className="es-user-chip">
            <span className="es-avatar">{initials(displayName)}</span>
            <span>
              <strong>{displayName}</strong>
              <small>Kelas VIII B</small>
            </span>
          </Link>
        </div>
      </header>
      <aside className="es-sidebar">
        <Link href="/siswa" className="es-brand">
          <span className="es-brand-mark">
            <Solar name="square-academic-cap" variant="bold-duotone" />
          </span>
          <span>
            <strong>EduSpace LMS</strong>
            <small>Portal Siswa</small>
          </span>
        </Link>
        <nav aria-label="Navigasi siswa">{nav}</nav>
        <button className="es-logout" onClick={() => setLogout(true)}>
          <Solar name="logout-2" />
          Logout
        </button>
      </aside>
      <main id="student-content" className="es-main">
        <nav className="es-breadcrumb" aria-label="Breadcrumb">
          <Link href="/siswa">LMS</Link>
          <Solar name="alt-arrow-right" />
          <Link href={active.href}>{active.label}</Link>
          {path.split("/").length > 3 && (
            <>
              <Solar name="alt-arrow-right" />
              <span>
                {path.includes("hasil")
                  ? "Hasil & Evaluasi"
                  : path.includes("kuis")
                    ? "Kuis Formatif"
                    : path.includes("tugas")
                      ? "Detail Tugas"
                      : path.includes("materi/")
                        ? "Detail Materi"
                        : "Informatika"}
              </span>
            </>
          )}
        </nav>
        <div className="es-page">{children}</div>
        <footer className="es-footer">
          LMS SMP Terpadu • Sistem Administrasi &amp; Pembelajaran Terpadu
        </footer>
      </main>
      <nav className="es-bottom-nav" aria-label="Navigasi siswa mobile">
        {nav}
      </nav>
      {logout && (
        <div className="es-modal-overlay">
          <section
            className="es-card es-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
          >
            <h2 id="logout-title">Keluar dari portal siswa?</h2>
            <p>Kamu akan kembali ke halaman login.</p>
            <div className="es-actions">
              <button
                autoFocus
                className="es-button es-button-outline"
                onClick={() => setLogout(false)}
              >
                Batal
              </button>
              <LogoutButton className="es-button" />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
