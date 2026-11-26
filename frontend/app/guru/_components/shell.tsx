"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import AppShell from "@/components/lms/shell/AppShell";
import type { AppNavigationItem } from "@/components/lms/shell/types";
import LogoutButton from "@/components/lms/LogoutButton";
import { initials, type AuthUser } from "@/lib/auth-types";
import { Solar } from "../../siswa/_components/icon";
import { Dialog } from "./ui";
import { subjects, subjectUrl, classUrl } from "./data";
import { courseForSubject, type TeacherCourse, type TeacherSubmission } from "./teacher-api";
import { useTeacherData } from "./store";
import { useTeacherResource } from "./useTeacherApi";

const menu = [
  { label: "Dashboard", href: "/guru", icon: "home-2" },
  { label: "Mata Pelajaran", href: "/guru/mata-pelajaran", icon: "book-2" },
  { label: "Kelas Diampu", href: "/guru/kelas", icon: "users-group-rounded" },
  { label: "Hasil Pembelajaran", href: "/guru/hasil-belajar", icon: "chart-square" },
  { label: "Profil", href: "/guru/profil", icon: "user-circle" },
];

export default function TeacherShell({ user, children }: { user: AuthUser; children: ReactNode }) {
  const path = usePathname();
  const searchParams = useSearchParams();
  const normalizedPath = path.replace(/\/+$/, "");
  const taskListRoute = normalizedPath.endsWith("/asesmen") && searchParams.get("tugas") !== null;
  const dashboardRoute = path === "/guru";
  const notificationRoute = path === "/guru/notifikasi";
  const [logout, setLogout] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { data } = useTeacherData();
  const notificationDashboard = useTeacherResource<{ alerts?: unknown[] }>("dashboard");
  const notificationCourses = useTeacherResource<TeacherCourse[]>("courses");
  const notificationSubmissions = useTeacherResource<TeacherSubmission[]>("submissions");
  const alerts = Array.isArray(notificationDashboard.data?.alerts) ? notificationDashboard.data.alerts : [];
  const unreadNotificationCount = alerts.filter((_, index) => !data.read.includes(`alert-${index}`)).length + (notificationSubmissions.data || []).filter(item => !data.read.includes(`submission-${item.id}`)).length;
  const active = menu.slice(1).find(item => path.startsWith(item.href)) || menu[0];
  const title = notificationRoute ? "Notifikasi" : active.label;
  const parts = path.split("/").filter(Boolean);
  const crumbs = [{ label: "LMS", href: "/guru" }, { label: title, href: notificationRoute ? path : active.href }];
  const subject = subjects.find(item => item.id === parts[2]);
  if (subject) {
    const base = subjectUrl(subject.id);
    const apiCourse = courseForSubject(notificationCourses.data || [], subject);
    crumbs.push({ label: apiCourse?.name || "—", href: base });
    const newAssessmentRoute = parts[3] === "asesmen" && parts[4] === "baru";
    const manualGradingRoute = parts[3] === "asesmen" && parts[5] === "nilai" && Boolean(parts[6]);
    if (parts[3] && !newAssessmentRoute && !manualGradingRoute) crumbs.push({ label: parts[3] === "materi" ? "Daftar Materi" : taskListRoute ? "Daftar Tugas" : "Daftar Asesmen", href: taskListRoute ? `${base}/asesmen?tugas` : `${base}/${parts[3]}` });
    if (manualGradingRoute) {
      const assessmentTitle = notificationSubmissions.data?.find(item => String(item.assessment?.id) === parts[4])?.assessment?.title;
      crumbs.push({ label: assessmentTitle || "—", href: `${base}/asesmen/${parts[4]}/pengumpulan` });
    }
    if (parts[4] && !manualGradingRoute) crumbs.push({ label: newAssessmentRoute ? "Tambah Asesmen" : parts[4] === "baru" ? "Tambah Baru" : parts[3] === "materi" ? "Edit Materi" : parts[5] === "edit" ? "Edit Asesmen" : parts[5] === "pengumpulan" ? "Pengumpulan" : parts[5] === "analisis" ? "Analisis Hasil" : "Penilaian", href: path });
    if (manualGradingRoute) crumbs.push({ label: "Nilai Asesmen Manual", href: path });
  } else if (parts[1] === "kelas" && parts[2]) {
    crumbs.push({ label: `Kelas ${parts[2].toUpperCase()}`, href: classUrl(parts[2]) });
    if (parts[3]) crumbs.push({ label: parts[3] === "nilai" ? "Buku Nilai" : "Progres Siswa", href: path });
  }

  const navigation: AppNavigationItem[] = menu.map(item => ({
    ...item,
    icon: <Solar name={item.icon} />,
    active: !notificationRoute && active.href === item.href,
  }));
  const mobileNavigation: AppNavigationItem[] = navigation.map((item) => ({
    ...item,
    label: item.label === "Hasil Pembelajaran" ? "Hasil" : item.label === "Mata Pelajaran" ? "Mapel" : item.label === "Kelas Diampu" ? "Kelas" : item.label,
  }));

  return <>
    <a className="tg-skip" href="#teacher-content">Lewati navigasi</a>
    <AppShell
      brand={{ href: "/guru", icon: <Solar name="square-academic-cap" />, title: "EduSpace LMS", subtitle: "Portal Guru" }}
      navigation={navigation}
      topbar={{
        title,
        rightSlot: <div className="tg-inline">
          <Link className={`tg-icon-button ${dashboardRoute ? "tg-notification" : ""}`} href="/guru/notifikasi" aria-label="Notifikasi guru">
            <Solar name="bell" />
            {/* TODO-DATA: jumlah notifikasi contoh mengikuti desain Figma. */}
            {unreadNotificationCount > 0 && (dashboardRoute ? <span className="tg-notification-count">{unreadNotificationCount}</span> : <span className="tg-dot" />)}
          </Link>
          <Link href="/guru/profil" className="tg-user">
            <span className="tg-avatar">{initials(user.name)}</span>
            <span><strong>{user.name}</strong><small>{dashboardRoute ? `NIP: ${user.username}` : <>Guru {"\u00B7"} {user.username}</>}</small></span>
          </Link>
        </div>,
      }}
      footer={<>LMS SMP Terpadu â€¢ Sistem Administrasi &amp; Pembelajaran Terpadu</>}
      mobileNavigation={mobileNavigation}
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed(!collapsed)}
      menuIcon={<Solar name="hamburger-menu" />}
      navigationLabel="Navigasi guru"
      mobileNavigationLabel="Navigasi guru mobile"
      collapseBehavior="hide"
      mobileNavigationMode="teacher"
      logout={<button className="tg-logout" onClick={() => setLogout(true)}><Solar name="logout-2" />Keluar</button>}
      className={`lms-theme teacher-app ${dashboardRoute ? "tg-dashboard-shell" : ""}`}
    >
      <nav className="tg-breadcrumb" aria-label="Breadcrumb">
        {crumbs.map((crumb, index) => <span className="tg-crumb" key={`${crumb.href}-${index}`}>
          {index > 0 && <Solar name="alt-arrow-right" />}
          <Link href={crumb.href} aria-current={index === crumbs.length - 1 ? "page" : undefined}>{crumb.label}</Link>
        </span>)}
        <span className="tg-preview-label">Data contoh</span>
      </nav>
      <div className="tg-page" id="teacher-content">{children}</div>
      <button className="tg-mobile-logout tg-logout" onClick={() => setLogout(true)}><Solar name="logout-2" />Keluar dari akun</button>
    </AppShell>
    {logout && <Dialog title="Keluar dari EduSpace?" onClose={() => setLogout(false)}><p>Anda dapat masuk kembali dengan akun guru.</p><div className="tg-actions"><button className="tg-button tg-button-outline" onClick={() => setLogout(false)}>Batal</button><LogoutButton className="tg-button tg-button-primary" /></div></Dialog>}
  </>;
}
