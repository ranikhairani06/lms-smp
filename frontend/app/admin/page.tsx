"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/lms/state";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import { Button, PageHeading, Panel, SearchField, StatCard, adminStyles as s } from "@/app/admin/_components/AdminUI";
import { getAdminDashboard, type AdminDashboardClass, type AdminDashboardData } from "@/lib/admin-dashboard-api";
import { useApiResource } from "@/lib/useApiResource";

function classCode(item: AdminDashboardClass) {
  return item.name.match(/\d+[A-Z]$/i)?.[0] ?? String(item.grade_level);
}

function classGrade(item: AdminDashboardClass) {
  return String(item.grade_level);
}

function countLabel(data: AdminDashboardData | undefined, key: "teachers" | "students" | "parents") {
  return data ? data[key].toLocaleString("id-ID") : "—";
}

export default function AdminDashboardPage() {
  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState("Semua");
  const loader = useCallback(() => getAdminDashboard(), []);
  const resource = useApiResource(loader);
  const dashboard = resource.status === "ready" ? resource.data : undefined;

  const visibleClasses = useMemo(() => (dashboard?.classes ?? []).filter((item) => {
    const matchText = `${item.name} ${item.grade_level}`.toLowerCase().includes(keyword.toLowerCase());
    const matchLevel = level === "Semua" || classGrade(item) === level.replace("Kls ", "");
    return item.is_active && matchText && matchLevel;
  }), [dashboard?.classes, keyword, level]);
  const displayedClasses = visibleClasses.slice(0, 5);
  const classUpdateCount = dashboard?.alerts?.students_need_class_update;

  return (
    <>
      <PageHeading breadcrumbs={["LMS", "Dashboard"]} title="Dashboard Administrator" description="Ringkasan operasional dan data master SMP Terpadu" />
      {/* Bagian tampilan: empat kartu total pengguna, guru, siswa, dan wali murid. */}
      <div className={`${s.statGridFour} ${s.dashboardStats}`}>
        <StatCard label="Total Users" value="—" detail="Total akun tidak tersedia dari API dashboard" icon="users-group-rounded-linear" tone="primary" />
        <StatCard label="Total Guru" value={countLabel(dashboard, "teachers")} detail="Jumlah guru dari dashboard" icon="user-id-linear" tone="success" />
        <StatCard label="Total Siswa" value={countLabel(dashboard, "students")} detail={dashboard ? `${dashboard.classes.length} rombel tersedia` : "Data belum tersedia"} icon="square-academic-cap-linear" tone="warning" />
        <StatCard label="Total Wali Murid" value={countLabel(dashboard, "parents")} detail="Jumlah akun orang tua dari dashboard" icon="users-group-rounded-linear" tone="info" />
      </div>

      {/* Bagian tampilan: ringkasan kelas aktif dan panel data yang perlu ditindaklanjuti. */}
      <div className={s.dashboardColumns}>
        <Panel>
          <div className={s.panelTitle}><h2>Ringkasan Kelas Aktif</h2></div>
          <div className={`${s.toolbar} ${s.dashboardToolbar}`}>
            <SearchField value={keyword} onChange={setKeyword} placeholder="Cari kelas atau wali kelas..." />
            <div className={s.toolbarSpacer} />
            <div className={s.tabs}>
              {["Semua", "Kls 7", "Kls 8", "Kls 9"].map((item) => <button key={item} aria-pressed={level === item} onClick={() => setLevel(item)}>{item}</button>)}
            </div>
          </div>
          <div className={s.classList}>
            {resource.status === "loading" && <LoadingState title="Memuat ringkasan kelas" />}
            {resource.status === "error" && <ErrorState title={resource.message} action={<Button variant="outline" onClick={resource.retry}>Coba lagi</Button>} />}
            {resource.status === "empty" && <EmptyState title="Belum ada data kelas" description="Data kelas belum tersedia." />}
            {resource.status === "ready" && displayedClasses.map((item) => (
              <div className={s.classItem} key={item.id}>
                <span className={s.classCode}>{classCode(item)}</span>
                <div className={s.classMeta}><strong>{item.name}</strong><small>Informasi wali kelas tidak tersedia dari API.</small></div>
                <span className={s.classCount}>{item.students_count.toLocaleString("id-ID")} Siswa</span>
                <Link href="/admin/master-data/rombel" className={s.textLink}>Rincian <AdminIcon name="arrow-right-linear" size={13} /></Link>
              </div>
            ))}
            {resource.status === "ready" && dashboard?.classes.length === 0 && <EmptyState title="Belum ada data kelas" description="Data kelas belum tersedia." />}
            {resource.status === "ready" && dashboard && dashboard.classes.length > 0 && visibleClasses.length === 0 && <p className={s.emptyCell}>Kelas tidak ditemukan.</p>}
          </div>
          <div className={s.pagination}>
            <span>{dashboard ? `Menampilkan ${displayedClasses.length} dari ${visibleClasses.length} rombongan belajar` : "Data rombongan belajar belum tersedia"}</span>
            <Link href="/admin/master-data/rombel" className={s.textLink}>Lihat Seluruh Rombel <AdminIcon name="arrow-right-linear" size={13} /></Link>
          </div>
        </Panel>

        <div>
          <Panel>
            <div className={s.panelTitle}><div><h2>Data yang Perlu Ditindaklanjuti</h2><p>Penyimpangan data &amp; validasi administratif</p></div></div>
            <div className={`${s.attentionItem} ${s.attentionWarning}`}>
              <span className={s.attentionIcon}><AdminIcon name="danger-triangle-linear" size={19} color="var(--color-warning-dark)" /></span>
              <div className={s.attentionText}><strong>{classUpdateCount === undefined ? "Data siswa yang perlu pembaruan kelas belum tersedia" : `${classUpdateCount.toLocaleString("id-ID")} siswa perlu memperbarui kelas`}</strong><small>Data kelas siswa perlu ditinjau.</small></div>
              <Link href="/admin/pengguna/siswa" className={s.attentionButton}>Tinjau</Link>
            </div>
            <div className={`${s.attentionItem} ${s.attentionDanger}`}>
              <span className={s.attentionIcon}><AdminIcon name="users-group-rounded-linear" size={19} color="var(--color-error)" /></span>
              <div className={s.attentionText}><strong>Informasi kapasitas rombel belum tersedia</strong><small>API dashboard belum mengirim status kapasitas kelas.</small></div>
              <Link href="/admin/master-data/rombel" className={s.attentionButton} style={{ background: "var(--color-error)" }}>Lihat</Link>
            </div>
            <div className={s.pagination}><span /> <Link href="/admin/laporan/aktivitas" className={s.textLink}>Buka Riwayat Lengkap <AdminIcon name="arrow-right-linear" size={13} /></Link></div>
          </Panel>
          <Panel>
            <div className={s.panelTitle}><div><h2>Distribusi Akun per Peran</h2><p>Total seluruh akun dan distribusi admin tidak tersedia dari API dashboard</p></div></div>
            <div className={s.distributionBar} aria-hidden="true" />
            <div className={s.distributionGrid}>
              <div className={s.distributionTile}><small><span>● Siswa</span><b>—</b></small><strong>{countLabel(dashboard, "students")}</strong></div>
              <div className={s.distributionTile}><small><span>● Orang Tua</span><b>—</b></small><strong>{countLabel(dashboard, "parents")}</strong></div>
              <div className={s.distributionTile}><small><span>● Guru</span><b>—</b></small><strong>{countLabel(dashboard, "teachers")}</strong></div>
              <div className={s.distributionTile}><small><span>● Admin</span><b>—</b></small><strong>Tidak tersedia</strong></div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
