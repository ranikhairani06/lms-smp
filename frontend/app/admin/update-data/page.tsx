"use client";

import { useMemo, useState } from "react";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import { Button, PageHeading, Panel, Pagination, SearchField, StatCard, StatusBadge, adminStyles as s } from "@/app/admin/_components/AdminUI";
import { useAdminResource } from "@/app/admin/_components/useAdminApi";
import { EmptyState, ErrorState, LoadingState } from "@/components/lms/state";

type Student = {
  id: number;
  nisn: string;
  user?: { name?: string | null } | null;
  class_room?: { name?: string | null; grade_level?: number | null } | null;
};

type AdminDashboard = {
  active_year?: { id: number; name: string; start_year: number } | null;
  alerts?: { students_need_class_update?: number };
};

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "—";
}

function gradeLabel(level?: number | null) {
  if (level === 7) return "Kelas VII";
  if (level === 8) return "Kelas VIII";
  if (level === 9) return "Kelas IX";
  return "—";
}

export default function UpdateDataPage() {
  const studentResource = useAdminResource<Student[]>("students");
  const dashboardResource = useAdminResource<AdminDashboard>("dashboard");
  const [keyword, setKeyword] = useState("");
  const [tab, setTab] = useState("Semua");
  const [page, setPage] = useState(1);
  const students = useMemo(() => studentResource.data ?? [], [studentResource.data]);
  const rows = useMemo(() => students.map((student) => {
    const name = student.user?.name?.trim() || "—";
    return {
      initials: initials(name),
      name,
      nisn: student.nisn || "—",
      level: gradeLabel(student.class_room?.grade_level),
      recorded: student.class_room?.name || "—",
      detected: "—",
      wali: "—",
      status: "—",
    };
  }), [students]);
  const filtered = useMemo(() => rows.filter((row) => {
    const matchesKeyword = `${row.name} ${row.nisn}`.toLowerCase().includes(keyword.toLowerCase());
    // The students endpoint does not provide class-update status, so the status tabs
    // intentionally return no unsupported matches instead of inferring from login state.
    const matchesStatus = tab === "Semua";
    return matchesKeyword && matchesStatus;
  }), [keyword, rows, tab]);
  const pageSize = 7;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pendingCount = dashboardResource.data?.alerts?.students_need_class_update;
  const activeYear = dashboardResource.data?.active_year;
  const loading = studentResource.loading || dashboardResource.loading;
  const error = studentResource.error ?? dashboardResource.error;
  const retry = async () => { await Promise.all([studentResource.reload(), dashboardResource.reload()]); };

  return (
    <>
      <PageHeading
        breadcrumbs={["LMS", "Update Data"]}
        title="Update Data Siswa"
        description="Pantau siswa yang belum memperbarui profil setelah pergantian tahun ajaran. Perubahan kelas tersimpan otomatis saat siswa memperbarui profilnya."
        variant="card"
        below={(
          <div className={`${s.infoBanner} ${s.info_info} ${s.updateSyncBanner}`}>
            <span className={s.updateSyncIcon}><AdminIcon name="info-circle-bold" size={19} /></span>
            <div><strong>Sinkronisasi Mandiri Siswa</strong><p>Admin tidak perlu mengubah data satu per satu. Siswa diminta memperbarui profil saat login ke akun masing-masing.</p></div>
          </div>
        )}
      />
      <div className={s.statGridThree}>
        <StatCard variant="updateData" label="Perhatian Khusus" value={pendingCount === undefined ? "—" : `${pendingCount} Siswa`} detail={pendingCount === undefined ? undefined : "Siswa belum memperbarui konfirmasi kelas"} icon="clock-circle-broken" tone="primary" />
        <StatCard variant="updateData" label="Kelengkapan Data" value="—" icon="check-circle-linear" tone="success" />
        <StatCard variant="updateData" label="Periode Akademik Aktif" value={activeYear?.name ?? "—"} icon="clipboard-clock-linear" tone="warning" />
      </div>
      <Panel className={s.updateDataTablePanel}>
        <div className={`${s.toolbar} ${s.updateDataToolbar}`}>
          <SearchField value={keyword} onChange={(value) => { setKeyword(value); setPage(1); }} placeholder="Cari nama atau NISN..." />
          <div className={s.toolbarSpacer} />
          <div className={`${s.filterTabs} ${s.updateDataTabs}`}>
            {["Semua", "Belum Memperbarui", "Sudah Diperbarui"].map((item) => (
              <button key={item} aria-pressed={tab === item} onClick={() => { setTab(item); setPage(1); }}>
                {item === "Semua" ? `Semua (${rows.length})` : item}
              </button>
            ))}
          </div>
        </div>
        {loading && <LoadingState title="Memuat data siswa..." />}
        {!loading && error && <ErrorState title={error} action={<Button variant="outline" onClick={() => void retry()}>Coba Lagi</Button>} />}
        {!loading && !error && filtered.length === 0 && <EmptyState title={rows.length === 0 ? "Belum ada data siswa" : "Tidak ada data yang cocok"} description={rows.length === 0 ? "Data siswa belum tersedia." : "Ubah kata pencarian atau filter status."} />}
        {!loading && !error && pageRows.length > 0 && (
          <>
            <div className={`${s.tableWrap} ${s.updateDataTableWrap}`}>
              <table className={`${s.dataTable} ${s.updateDataTable}`}>
                <thead><tr><th>Siswa</th><th>Tingkat Tercatat</th><th>Rombel Tercatat</th><th>Terdeteksi</th><th>Wali Kelas</th><th>Status</th></tr></thead>
                <tbody>{pageRows.map((row, index) => <tr key={`${row.nisn}-${index}`}>
                  <td><div className={s.updateStudentIdentity}><span className={`${s.classCode} ${s.updateStudentAvatar}`}>{row.initials}</span><span className={s.updateStudentMeta}><span className={s.tableStrong}>{row.name}</span><span className={s.tableSub}>NISN: {row.nisn}</span></span></div></td>
                  <td><span className={s.levelTag}>{row.level}</span></td>
                  <td>{row.recorded}</td>
                  <td><StatusBadge className={s.updateDataPill} tone="neutral">{row.detected}</StatusBadge></td>
                  <td>{row.wali}</td>
                  <td><StatusBadge className={s.updateDataPill} tone="neutral">{row.status}</StatusBadge></td>
                </tr>)}</tbody>
              </table>
            </div>
            <Pagination className={s.updateDataPagination} current={page} total={Math.max(1, Math.ceil(filtered.length / pageSize))} onChange={setPage} label={`Menampilkan ${filtered.length ? (page - 1) * pageSize + 1 : 0}-${Math.min(page * pageSize, filtered.length)} dari ${filtered.length} siswa`} emphasizeLabelNumbers />
          </>
        )}
      </Panel>
    </>
  );
}
