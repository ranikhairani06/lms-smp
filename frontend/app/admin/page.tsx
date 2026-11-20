"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import { Button, PageHeading, Panel, SearchField, StatCard, adminStyles as s } from "@/app/admin/_components/AdminUI";
import { getAdminDashboard } from "@/lib/admin-dashboard-api";
import { EmptyState, ErrorState, LoadingState } from "@/components/lms/state";
import { useApiResource } from "@/lib/useApiResource";

function formatCount(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function classLabel(name: string) {
  return name.toLocaleLowerCase("id-ID").startsWith("kelas ") ? name : `Kelas ${name}`;
}

function isDashboardEmpty(dashboard: Awaited<ReturnType<typeof getAdminDashboard>>) {
  return dashboard.students === 0 &&
    dashboard.teachers === 0 &&
    dashboard.parents === 0 &&
    dashboard.courses === 0 &&
    dashboard.active_year === null &&
    dashboard.classes.length === 0 &&
    dashboard.alerts.students_need_class_update === 0;
}

export default function AdminDashboardPage() {
  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState("Semua");
  const resource = useApiResource(getAdminDashboard, isDashboardEmpty);
  const dashboard = resource.status === "ready" ? resource.data : null;
  const activeClasses = dashboard?.classes.filter((item) => item.is_active) ?? [];
  const visibleClasses = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.classes.filter((item) => item.is_active).filter((item) => {
      const matchText = `${item.name} ${item.grade_level ?? ""}`.toLowerCase().includes(keyword.toLowerCase());
      const matchLevel = level === "Semua" || item.grade_level === Number(level.replace("Kls ", ""));
      return matchText && matchLevel;
    });
  }, [dashboard, keyword, level]);

  const description = dashboard
    ? `Ringkasan operasional dan data master SMP Terpadu · Tahun Ajaran ${dashboard.active_year?.name ?? "belum ditetapkan"}`
    : "Ringkasan operasional dan data master SMP Terpadu";

  return (
    <>
      <PageHeading breadcrumbs={["LMS", "Dashboard"]} title="Dashboard Administrator" description={description} />

      {resource.status === "loading" && <LoadingState title="Memuat dashboard administrator..." />}

      {resource.status === "error" && (
        <ErrorState
          title={resource.statusCode === 403 ? "Akses ditolak" : resource.statusCode === 404 ? "Dashboard tidak ditemukan" : "Dashboard belum dapat dimuat"}
          description={resource.message}
          action={
            <>
              <Button onClick={resource.retry}>Coba Lagi</Button>
              {resource.statusCode === 401 && (
                <Link href="/login?role=admin&reason=session-expired" className={s.textLink}>
                  Masuk kembali
                </Link>
              )}
            </>
          }
        />
      )}

      {resource.status === "empty" && (
        <EmptyState title="Data dashboard belum tersedia" description="Respons dashboard berhasil diterima tanpa data untuk ditampilkan." />
      )}

      {resource.status === "ready" && dashboard && (
        <>
          <div className={`${s.statGridFour} ${s.dashboardStats}`}>
            <StatCard label="Total Kursus" value={`${formatCount(dashboard.courses)} Kursus`} detail="Jumlah course yang terdaftar pada sistem" icon="users-group-rounded-linear" tone="primary" />
            <StatCard label="Total Guru" value={`${formatCount(dashboard.teachers)} Guru`} detail="Jumlah data guru pada sistem" icon="user-id-linear" tone="success" />
            <StatCard label="Total Siswa" value={`${formatCount(dashboard.students)} Siswa`} detail={`${formatCount(activeClasses.length)} rombel aktif`} icon="square-academic-cap-linear" tone="warning" />
            <StatCard label="Total Wali Murid" value={`${formatCount(dashboard.parents)} Wali`} detail="Jumlah profil orang tua pada sistem" icon="users-group-rounded-linear" tone="info" />
          </div>

          <div className={s.dashboardColumns}>
            <Panel>
              <div className={s.panelTitle}><h2>Ringkasan Kelas Aktif</h2></div>
              <div className={`${s.toolbar} ${s.dashboardToolbar}`}>
                <SearchField value={keyword} onChange={setKeyword} placeholder="Cari kelas..." />
                <div className={s.toolbarSpacer} />
                <div className={s.tabs}>
                  {["Semua", "Kls 7", "Kls 8", "Kls 9"].map((item) => <button key={item} aria-pressed={level === item} onClick={() => setLevel(item)}>{item}</button>)}
                </div>
              </div>
              <div className={s.classList}>
                {activeClasses.length === 0 ? (
                  <EmptyState title="Belum ada rombongan belajar aktif" description="API dashboard belum mengembalikan rombongan belajar aktif." />
                ) : visibleClasses.map((item) => (
                  <div className={s.classItem} key={item.id}>
                    <span className={s.classCode}>{item.name}</span>
                    <div className={s.classMeta}><strong>{classLabel(item.name)}</strong><small>Wali kelas tidak disertakan pada respons dashboard.</small></div>
                    <span className={s.classCount}>{formatCount(item.students_count)} Siswa</span>
                    <Link href="/admin/master-data/rombel" className={s.textLink}>Rincian <AdminIcon name="arrow-right-linear" size={13} /></Link>
                  </div>
                ))}
                {activeClasses.length > 0 && visibleClasses.length === 0 && <p className={s.emptyCell}>Kelas tidak ditemukan.</p>}
              </div>
              <div className={s.pagination}><span>Menampilkan {visibleClasses.length} dari {activeClasses.length} Rombongan Belajar SMP</span><Link href="/admin/master-data/rombel" className={s.textLink}>Lihat Seluruh Rombel <AdminIcon name="arrow-right-linear" size={13} /></Link></div>
            </Panel>

            <div>
              <Panel>
                <div className={s.panelTitle}><div><h2>Data yang Perlu Ditindaklanjuti</h2><p>Penyimpangan data &amp; validasi administratif</p></div></div>
                <p className={s.emptyCell}>
                  {dashboard.alerts.students_need_class_update === 0
                    ? "Tidak ada siswa yang perlu memperbarui data kelas."
                    : `${formatCount(dashboard.alerts.students_need_class_update)} siswa perlu memperbarui data kelas.`}
                </p>
                <div className={s.pagination}><span /> <Link href="/admin/laporan/aktivitas" className={s.textLink}>Buka Riwayat Lengkap <AdminIcon name="arrow-right-linear" size={13} /></Link></div>
              </Panel>
              <Panel>
                <div className={s.panelTitle}><div><h2>Distribusi Akun per Peran</h2><p>Persentase dan jumlah akun admin belum tersedia dari API.</p></div></div>
                <div className={s.distributionBar} aria-label="Persentase akun per peran belum tersedia" />
                <div className={s.distributionGrid}>
                  <div className={s.distributionTile}><small><span>● Siswa</span><b>—</b></small><strong>{formatCount(dashboard.students)}</strong></div>
                  <div className={s.distributionTile}><small><span>● Orang Tua</span><b>—</b></small><strong>{formatCount(dashboard.parents)}</strong></div>
                  <div className={s.distributionTile}><small><span>● Guru</span><b>—</b></small><strong>{formatCount(dashboard.teachers)}</strong></div>
                  <div className={s.distributionTile}><small><span>● Admin</span><b>—</b></small><strong>—</strong></div>
                </div>
              </Panel>
            </div>
          </div>
        </>
      )}
    </>
  );
}
