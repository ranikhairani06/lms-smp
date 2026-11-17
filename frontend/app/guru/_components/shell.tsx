"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { initials, type AuthUser } from "@/lib/auth-types";
import LogoutButton from "@/components/lms/LogoutButton";
import { Solar } from "../../siswa/_components/icon";
import { Dialog } from "./ui";
import { subjects, subjectUrl, classUrl } from "./data";
import { useTeacherData } from "./store";

const menu = [
  { label: "Dashboard", href: "/guru", icon: "home-2" },
  { label: "Mata Pelajaran", href: "/guru/mata-pelajaran", icon: "book-2" },
  { label: "Kelas Diampu", href: "/guru/kelas", icon: "users-group-rounded" },
  { label: "Hasil Pembelajaran", href: "/guru/hasil-belajar", icon: "chart-square" },
  { label: "Profil", href: "/guru/profil", icon: "user-circle" },
];
export default function TeacherShell({ user, children }: { user: AuthUser; children: ReactNode }) {
  const path = usePathname();
  const [logout, setLogout] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { data } = useTeacherData();
  const active = menu.slice(1).find(item => path.startsWith(item.href)) || menu[0];
  const title = path === "/guru/notifikasi" ? "Notifikasi" : active.label;
  const parts = path.split("/").filter(Boolean);
  const crumbs = [{ label: "LMS", href: "/guru" }, { label: title, href: path === "/guru/notifikasi" ? path : active.href }];
  const subject = subjects.find(item => item.id === parts[2]);
  if (subject) {
    const base = subjectUrl(subject.id);
    crumbs.push({ label: subject.name, href: base });
    if (parts[3]) crumbs.push({ label: parts[3] === "materi" ? "Daftar Materi" : "Daftar Asesmen", href: `${base}/${parts[3]}` });
    if (parts[4]) crumbs.push({ label: parts[4] === "baru" ? "Tambah Baru" : parts[3] === "materi" ? "Edit Materi" : parts[5] === "edit" ? "Edit Asesmen" : parts[5] === "pengumpulan" ? "Pengumpulan" : parts[5] === "analisis" ? "Analisis Hasil" : "Penilaian", href: path });
  } else if (parts[1] === "kelas" && parts[2]) {
    crumbs.push({ label: `Kelas ${parts[2].toUpperCase()}`, href: classUrl(parts[2]) });
    if (parts[3]) crumbs.push({ label: parts[3] === "nilai" ? "Buku Nilai" : "Progres Siswa", href: path });
  }
  return <div className={`lms-theme teacher-app ${collapsed ? "tg-collapsed" : ""}`}>
    <a className="tg-skip" href="#teacher-content">Lewati navigasi</a>
    <header className="tg-topbar"><div className="tg-inline"><button className="tg-icon-button tg-menu-toggle" aria-label={collapsed ? "Tampilkan menu" : "Sembunyikan menu"} aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}><Solar name="hamburger-menu" /></button><strong>{title}</strong></div><div className="tg-inline"><Link className="tg-icon-button" href="/guru/notifikasi" aria-label="Notifikasi guru"><Solar name="bell" />{data.read.length < 4 && <span className="tg-dot" />}</Link><Link href="/guru/profil" className="tg-user"><span className="tg-avatar">{initials(user.name)}</span><span><strong>{user.name}</strong><small>Guru · {user.username}</small></span></Link></div></header>
    <aside className="tg-sidebar"><Link className="tg-brand" href="/guru"><span><Solar name="square-academic-cap" /></span><div><strong>EduSpace LMS</strong><small>Portal Guru</small></div></Link><nav aria-label="Navigasi guru">{menu.map(item => <Link key={item.href} href={item.href} aria-current={path !== "/guru/notifikasi" && active.href === item.href ? "page" : undefined}><Solar name={item.icon} /><span>{item.label}</span></Link>)}</nav><button className="tg-logout" onClick={() => setLogout(true)}><Solar name="logout-2" />Keluar</button></aside>
    <main className="tg-main" id="teacher-content"><nav className="tg-breadcrumb" aria-label="Breadcrumb">{crumbs.map((crumb, index) => <span className="tg-crumb" key={`${crumb.href}-${index}`}>{index > 0 && <Solar name="alt-arrow-right" />}<Link href={crumb.href} aria-current={index === crumbs.length - 1 ? "page" : undefined}>{crumb.label}</Link></span>)}<span className="tg-preview-label">Data contoh</span></nav><div className="tg-page">{children}</div><footer className="tg-footer">LMS SMP Terpadu • Sistem Administrasi &amp; Pembelajaran Terpadu</footer><button className="tg-mobile-logout tg-logout" onClick={() => setLogout(true)}><Solar name="logout-2" />Keluar dari akun</button></main>
    <nav className="tg-mobile-nav" aria-label="Navigasi guru mobile">{menu.map(item => <Link href={item.href} key={item.href} aria-current={path !== "/guru/notifikasi" && active.href === item.href ? "page" : undefined}><Solar name={item.icon} /><span>{item.label === "Hasil Pembelajaran" ? "Hasil" : item.label === "Mata Pelajaran" ? "Mapel" : item.label === "Kelas Diampu" ? "Kelas" : item.label}</span></Link>)}</nav>
    {logout && <Dialog title="Keluar dari EduSpace?" onClose={() => setLogout(false)}><p>Anda dapat masuk kembali dengan akun guru.</p><div className="tg-actions"><button className="tg-button tg-button-outline" onClick={() => setLogout(false)}>Batal</button><LogoutButton className="tg-button tg-button-primary" /></div></Dialog>}
  </div>;
}
