"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import AppShell from "@/components/lms/shell/AppShell";
import type { AppNavigationItem } from "@/components/lms/shell/types";
import { Solar } from "../siswa/_components/icon";
import { initials, type AuthUser } from "@/lib/auth-types";
import LogoutButton from "@/components/lms/LogoutButton";

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
    ? pathname.split("/").filter(Boolean).at(-1)?.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")
    : undefined;
  const navigation: AppNavigationItem[] = menu.map((item) => ({
    ...item,
    icon: <Solar name={item.icon} />,
    active: currentItem.href === item.href,
  }));

  return (
    <>
      <a className="parent-skip" href="#parent-content">
        Lewati navigasi
      </a>

      <AppShell
        brand={{
          href: "/orang-tua",
          icon: <Solar name="square-academic-cap" />,
          title: "EduSpace LMS",
          subtitle: "Portal Orang Tua",
        }}
        navigation={navigation}
        topbar={{
          title: currentTitle,
          leadingIcon: <Solar name="hamburger-menu" />,
          rightSlot: <div className="parent-topbar-actions">
            <div className="parent-notification-wrap">
              <button
                className="parent-icon-button"
                type="button"
                aria-label="Notifikasi"
                aria-expanded={notificationOpen}
                onClick={() => setNotificationOpen((open) => !open)}
              >
                <Solar name="bell" />
              </button>
              {notificationOpen && (
                <div className="parent-notification-popover">
                  <strong>Notifikasi</strong>
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
          </div>,
        }}
        footer={<>LMS SMP Terpadu â€¢ Sistem Administrasi &amp; Pembelajaran Terpadu</>}
        mobileNavigation={navigation}
        mobileNavigationLabel="Navigasi orang tua mobile"
        mobileNavigationBreakpoint="tablet"
        mobileNavigationColumns={4}
        navigationLabel="Navigasi orang tua"
        mainId="parent-content"
        logout={
          <button
            className="parent-logout"
            type="button"
            onClick={() => setLogoutOpen(true)}
          >
            <Solar name="logout-2" />
            Keluar
          </button>
        }
        className="parent-app"
      >
        <nav className="parent-breadcrumb" aria-label="Breadcrumb">
          <Link href="/orang-tua">LMS</Link>
          <Solar name="alt-arrow-right" />
          {currentSubject ? <><Link href="/orang-tua/hasil-belajar">Hasil Belajar Siswa</Link><Solar name="alt-arrow-right" /><span aria-current="page">{currentSubject}</span></> : <span aria-current="page">{currentTitle}</span>}
        </nav>

        <div className="parent-page">{children}</div>
      </AppShell>

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
    </>
  );
}
