"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import AppShell from "@/components/lms/shell/AppShell";
import type { AppNavigationItem } from "@/components/lms/shell/types";
import LogoutButton from "@/components/lms/LogoutButton";
import { initials, type AuthUser } from "@/lib/auth-types";
import { Solar } from "./icon";

const menus = [
  { href: "/siswa", label: "Dashboard", icon: "home-2" },
  { href: "/siswa/mata-pelajaran", label: "Mata Pelajaran", icon: "book-bookmark" },
  { href: "/siswa/progres", label: "Progress Pembelajaran", icon: "ranking" },
  { href: "/siswa/riwayat", label: "Riwayat", icon: "clock-circle" },
  { href: "/siswa/profil", label: "Profil", icon: "user-circle" },
];

export default function Shell({ children, user }: { children: ReactNode; user: AuthUser }) {
  const displayName = "Andi Pratama";
  const path = usePathname();
  const [notifications, setNotifications] = useState(false);
  const [logout, setLogout] = useState(false);
  const active = menus.find((item) =>
    item.href === "/siswa" ? path === item.href : path.startsWith(item.href),
  ) || menus[1];
  const navigation: AppNavigationItem[] = menus.map((item) => ({
    ...item,
    icon: <Solar name={item.icon} />,
    active: item === active,
  }));
  const mobileNavigation = navigation.map((item) => ({
    ...item,
    label: item.href === "/siswa/progres" ? "Progres" : item.label,
  }));

  return (
    <AppShell
      brand={{
        href: "/siswa",
        icon: <Solar name="square-academic-cap" variant="bold-duotone" />,
        title: "EduSpace LMS",
        subtitle: "Portal Siswa",
      }}
      navigation={navigation}
      topbar={{
        title: active.label,
        leadingIcon: <span className="es-menu-decoration" aria-hidden="true"><Solar name="hamburger-menu" /></span>,
        rightSlot: <div className="es-top-actions">
          <div className="es-notification-wrap">
            <button
              className="es-icon-button"
              type="button"
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
        </div>,
      }}
      footer={<>LMS SMP Terpadu â€¢ Sistem Administrasi &amp; Pembelajaran Terpadu</>}
      mobileNavigation={mobileNavigation}
      mobileNavigationBreakpoint="narrow"
      mobileNavigationPresentation="bar"
      mobileNavigationColumns={5}
      mobileNavigationLabel="Navigasi siswa mobile"
      navigationLabel="Navigasi siswa"
      logout={
        <button className="es-logout" type="button" onClick={() => setLogout(true)}>
          <Solar name="logout-2" />
          Logout
        </button>
      }
      className="student-app"
    >
      <a className="es-skip" href="#student-content">Lewati navigasi</a>
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
      <div className="es-page" id="student-content">{children}</div>
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
                type="button"
                onClick={() => setLogout(false)}
              >
                Batal
              </button>
              <LogoutButton className="es-button" />
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
