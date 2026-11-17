"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "@/lib/auth-types";
import LogoutButton from "@/components/lms/LogoutButton";
import AppShell from "@/components/lms/shell/AppShell";
import shellStyles from "@/components/lms/shell/AppShell.module.css";
import type { AppNavigationItem } from "@/components/lms/shell/types";
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

export default function AdminShell({ children }: { children: ReactNode; user: AuthUser }) {
  const pathname = usePathname();
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const inUsers = pathname.startsWith("/admin/pengguna");
  const inMaster = pathname.startsWith("/admin/master-data");
  const inReports = pathname.startsWith("/admin/laporan");
  const currentTitle = pathname === "/admin" ? "Dashboard" : inUsers ? "Manajemen Pengguna" : inMaster ? "Master Data" : inReports ? "Laporan" : pathname.includes("update-data") ? "Update Data" : "Profil";

  const navigation: AppNavigationItem[] = [
    { label: "Dashboard", href: "/admin", icon: <AdminIcon name="home-2-linear" size={24} />, active: pathname === "/admin" },
    {
      label: "Manajemen Pengguna",
      href: "/admin/pengguna/siswa",
      icon: <AdminIcon name="users-group-rounded-linear" size={24} />,
      active: inUsers,
      children: userLinks.map((item) => ({ ...item, active: pathname === item.href })),
    },
    {
      label: "Master Data",
      href: "/admin/master-data/tahun-ajaran",
      icon: <AdminIcon name="book-bookmark-linear" size={24} />,
      active: inMaster,
      children: masterLinks.map((item) => ({ ...item, active: pathname === item.href })),
    },
    { label: "Update Data", href: "/admin/update-data", icon: <AdminIcon name="clipboard-check-linear" size={24} />, active: pathname === "/admin/update-data" },
    {
      label: "Laporan",
      href: "/admin/laporan/aktivitas",
      icon: <AdminIcon name="smartphone-linear" size={24} />,
      active: inReports,
      children: reportLinks.map((item) => ({ ...item, active: pathname === item.href })),
    },
    { label: "Profil", href: "/admin/profil", icon: <AdminIcon name="user-circle-linear" size={24} />, active: pathname === "/admin/profil" },
  ];

  const mobileNavigation: AppNavigationItem[] = [
    { label: "Beranda", href: "/admin", icon: <AdminIcon name="home-2-linear" size={18} />, active: pathname === "/admin" },
    { label: "Pengguna", href: "/admin/pengguna/siswa", icon: <AdminIcon name="users-group-rounded-linear" size={18} />, active: inUsers },
    { label: "Master", href: "/admin/master-data/tahun-ajaran", icon: <AdminIcon name="book-2-linear" size={18} />, active: inMaster },
    { label: "Update", href: "/admin/update-data", icon: <AdminIcon name="clipboard-check-linear" size={18} />, active: pathname === "/admin/update-data" },
    { label: "Laporan", href: "/admin/laporan/aktivitas", icon: <AdminIcon name="chart-square-linear" size={18} />, active: inReports },
    { label: "Profil", href: "/admin/profil", icon: <AdminIcon name="user-circle-linear" size={18} />, active: pathname === "/admin/profil" },
  ];

  const rightSlot = (
    <>
      <div className={s.notificationWrap}>
        <button className={s.notificationButton} onClick={() => setNoticeOpen((open) => !open)} aria-label="Notifikasi">
          <AdminIcon name="bell-linear" size={19} /><span>3</span>
        </button>
        {noticeOpen && <div className={s.notificationPopover}><strong>Notifikasi</strong><p>8 data siswa memerlukan verifikasi NISN.</p><p>2 rombel melebihi kapasitas.</p><p>Semester Genap tersedia untuk dijadwalkan.</p></div>}
      </div>
      <span className={s.avatarSmall}>AB</span>
      <strong className={s.adminName}>Admin Bayu</strong>
    </>
  );

  return (
    <AppShell
      brand={{
        href: "/admin",
        icon: <AdminIcon name="square-academic-cap-bold-duotone" size={24} />,
        title: "EduSpace LMS",
        subtitle: "Portal Admin",
      }}
      navigation={navigation}
      topbar={{ title: currentTitle, rightSlot }}
      footer={<>LMS SMP Terpadu &bull; Sistem Administrasi &amp; Pembelajaran Terpadu</>}
      mobileNavigation={mobileNavigation}
      collapsed={sidebarCollapsed}
      onToggleCollapse={() => setSidebarCollapsed((collapsed) => !collapsed)}
      menuIcon={<AdminIcon name="hamburger-menu-linear" size={19} />}
      navigationLabel="Navigasi administrator"
      mobileNavigationLabel="Navigasi admin mobile"
      mainClassName={s.mainArea}
      className={pathname.startsWith("/admin/pengguna/guru") ? shellStyles.teacherDirectoryShell : ""}
      logout={<LogoutButton><AdminIcon name="logout-2-linear" size={24} /><span className={shellStyles.logoutLabel}>Logout</span></LogoutButton>}
    >
      {children}
    </AppShell>
  );
}
