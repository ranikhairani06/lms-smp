"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "@/lib/auth-types";
import LogoutButton from "@/components/lms/LogoutButton";
import AdminIcon from "./AdminIcons";
import s from "./AdminUI.module.css";

const userLinks = [
  { label: "Peserta Didik", href: "/admin/pengguna/siswa" },
  { label: "Guru & Staf", href: "/admin/pengguna/guru" },
  { label: "Orang Tua (Wali)", href: "/admin/pengguna/orang-tua" },
];
const masterLinks = [
  { label: "Tahun Ajaran & Semester", href: "/admin/master-data/tahun-ajaran" },
  { label: "Rombongan Belajar", href: "/admin/master-data/rombel" },
];
const reportLinks = [
  { label: "Laporan Aktivitas", href: "/admin/laporan/aktivitas" },
  { label: "Laporan Nilai", href: "/admin/laporan/nilai" },
];

export default function AdminShell({ children, user }: { children: ReactNode; user: AuthUser }) {
  const pathname = usePathname();
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const inUsers = pathname.startsWith("/admin/pengguna");
  const inMaster = pathname.startsWith("/admin/master-data");
  const inReports = pathname.startsWith("/admin/laporan");
  const currentTitle = pathname === "/admin" ? "Dashboard" : inUsers ? "Manajemen Pengguna" : inMaster ? "Master Data" : inReports ? "Laporan" : pathname.includes("update-data") ? "Update Data" : "Profil";

 /* Ikon navigasi utama Sidebar Admin */
  const navLink = (href: string, label: string, icon: string, active: boolean) => (
    <Link href={href} className={`${s.navLink} ${active ? s.navActive : ""}`}>
      <AdminIcon name={icon} size={24} />
      <span>{label}</span>
    </Link>
  );

  return (
    <div className={`${s.adminApp} ${sidebarCollapsed ? s.adminAppCollapsed : ""}`}>
      {/* Bagian tampilan: topbar membentang di atas sidebar dan seluruh area konten. */}
      <header className={s.topbar}>
        <div className={s.topbarLeft}>
          <button className={s.topbarMenu} type="button" onClick={() => setSidebarCollapsed((collapsed) => !collapsed)} aria-label={sidebarCollapsed ? "Perluas menu" : "Ciutkan menu"} aria-expanded={!sidebarCollapsed}>
            <AdminIcon name="hamburger-menu-linear" size={19} />
          </button>
          <strong>{currentTitle}</strong>
        </div>
        <div className={s.topbarRight}>
          <div className={s.notificationWrap}>
            <button className={s.notificationButton} onClick={() => setNoticeOpen((open) => !open)} aria-label="Notifikasi">
              <AdminIcon name="bell-linear" size={19} /><span>3</span>
            </button>
            {noticeOpen && <div className={s.notificationPopover}><strong>Notifikasi</strong><p>8 data siswa memerlukan verifikasi NISN.</p><p>2 rombel melebihi kapasitas.</p><p>Semester Genap tersedia untuk dijadwalkan.</p></div>}
          </div>
          {/* Identitas administrator sesuai desain UI/UX */}
          <span className={s.avatarSmall}>AB</span>
          <strong className={s.adminName}>Admin Bayu</strong>
        </div>
      </header>

      {/* Bagian tampilan: sidebar dimulai di bawah topbar, sesuai frame desktop desain. */}
      <aside className={s.sidebar}>
        <Link href="/admin" className={s.brandBlock}>
          <span className={s.brandMark}><AdminIcon name="square-academic-cap-bold-duotone" size={24} /></span>
          <span><strong>EduSpace LMS</strong><small>Portal Admin</small></span>
        </Link>
        <nav className={s.nav} aria-label="Navigasi administrator">
          {navLink("/admin", "Dashboard", "home-2-linear", pathname === "/admin")}
          <div className={s.navGroup}>
            <Link href="/admin/pengguna/siswa" className={`${s.navLink} ${inUsers ? s.navActive : ""}`}>
              <AdminIcon name="users-group-rounded-linear" size={24}/><span>Manajemen Pengguna</span>
            </Link>
            {inUsers && <div className={s.subNav}>{userLinks.map((item) => <Link key={item.href} href={item.href} className={pathname === item.href ? s.subNavActive : ""}>{item.label}</Link>)}</div>}
          </div>
          <div className={s.navGroup}>
            <Link href="/admin/master-data/tahun-ajaran" className={`${s.navLink} ${inMaster ? s.navActive : ""}`}>
              <AdminIcon name="book-bookmark-linear" size={24} /><span>Master Data</span>
            </Link>
            {inMaster && <div className={s.subNav}>{masterLinks.map((item) => <Link key={item.href} href={item.href} className={pathname === item.href ? s.subNavActive : ""}>{item.label}</Link>)}</div>}
          </div>
          {navLink("/admin/update-data", "Update Data", "clipboard-check-linear", pathname === "/admin/update-data")}
          <div className={s.navGroup}>
            <Link href="/admin/laporan/aktivitas" className={`${s.navLink} ${inReports ? s.navActive : ""}`}>
              <AdminIcon name="smartphone-linear" size={24} /><span>Laporan</span>
            </Link>
            {inReports && <div className={s.subNav}>{reportLinks.map((item) => <Link key={item.href} href={item.href} className={pathname === item.href ? s.subNavActive : ""}>{item.label}</Link>)}</div>}
          </div>
          {navLink("/admin/profil", "Profil", "user-circle-linear", pathname === "/admin/profil")}
        </nav>
        <div style={{ marginTop: "auto" }}>
          <LogoutButton className={s.logoutLink}><AdminIcon name="logout-2-linear" size={24} />Logout</LogoutButton>
        </div>
      </aside>

      {/* Bagian tampilan: halaman aktif dan footer berada di kolom utama kanan. */}
      <main className={s.mainArea}>
        <div className={s.mainContent}>{children}</div>
        {/* Bagian tampilan: footer sistem sesuai design system. */}
        <footer className={s.footer}>LMS SMP Terpadu • Sistem Administrasi &amp; Pembelajaran Terpadu</footer>
        {/* Bagian tampilan: bottom navigation hanya terlihat pada layar mobile. */}
        <nav className={s.bottomNav} aria-label="Navigasi admin mobile">
          <Link href="/admin" className={pathname === "/admin" ? s.bottomNavActive : ""}><AdminIcon name="home-2-linear" size={18} /><span>Beranda</span></Link>
          <Link href="/admin/pengguna/siswa" className={inUsers ? s.bottomNavActive : ""}><AdminIcon name="users-group-rounded-linear" size={18} /><span>Pengguna</span></Link>
          <Link href="/admin/master-data/tahun-ajaran" className={inMaster ? s.bottomNavActive : ""}><AdminIcon name="book-2-linear" size={18} /><span>Master</span></Link>
          <Link href="/admin/update-data" className={pathname === "/admin/update-data" ? s.bottomNavActive : ""}><AdminIcon name="clipboard-check-linear" size={18} /><span>Update</span></Link>
          <Link href="/admin/laporan/aktivitas" className={inReports ? s.bottomNavActive : ""}><AdminIcon name="chart-square-linear" size={18} /><span>Laporan</span></Link>
          <Link href="/admin/profil" className={pathname === "/admin/profil" ? s.bottomNavActive : ""}><AdminIcon name="user-circle-linear" size={18} /><span>Profil</span></Link>
        </nav>
      </main>
    </div>
  );
}
