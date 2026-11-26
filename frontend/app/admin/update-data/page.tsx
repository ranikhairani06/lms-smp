"use client";

import { useMemo, useState } from "react";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import { PageHeading, Panel, Pagination, SearchField, StatCard, StatusBadge, adminStyles as s } from "@/app/admin/_components/AdminUI";

const updateRows = [
  { initials: "RA", name: "Rafi Ahmad Prasetyo", nisn: "009853301230", level: "Kelas VII", recorded: "7C", detected: "Seharusnya VIII", wali: "Rina Marlina, M.Pd.", status: "Belum Login" },
  { initials: "DA", name: "Dimas Arya Putra", nisn: "0098511209", level: "Kelas VII", recorded: "7A", detected: "Seharusnya VIII", wali: "Joko Susilo, S.Pd.", status: "Belum Login" },
  { initials: "NP", name: "Nabila Putri Ramadhani", nisn: "0098314452", level: "Kelas VIII", recorded: "8B", detected: "Seharusnya IX", wali: "Hendra Gunawan, S.Kom.", status: "Belum Login" },
  { initials: "FM", name: "Farhan Maulana Arifin", nisn: "0098898822", level: "Kelas VIII", recorded: "8A", detected: "Seharusnya IX", wali: "Siti Nurhaliza, M.Pd.", status: "Belum Login" },
  { initials: "CA", name: "Cantika Aurelia Putri", nisn: "00985651239", level: "Kelas VIII", recorded: "8B", detected: "Seharusnya IX", wali: "Hendra Gunawan, S.Kom.", status: "Belum Login" },
  { initials: "SR", name: "Siti Rahma", nisn: "0098421001", level: "Kelas VIII", recorded: "8A", detected: "Sesuai", wali: "Hendra Gunawan, S.Kom.", status: "Sudah Diperbarui" },
  { initials: "AP", name: "Andi Pratama", nisn: "0098471204", level: "Kelas VIII", recorded: "8B", detected: "Sesuai", wali: "Hendra Gunawan, S.Kom.", status: "Sudah Diperbarui" },
];

export default function UpdateDataPage() {
  const [keyword, setKeyword] = useState("");
  const [tab, setTab] = useState("Semua (149)");
  const [page, setPage] = useState(1);
  const visible = useMemo(() => updateRows.filter((row) => `${row.name} ${row.nisn}`.toLowerCase().includes(keyword.toLowerCase()) && (tab.startsWith("Belum") ? row.status === "Belum Login" : tab.startsWith("Sudah") ? row.status === "Sudah Diperbarui" : true)), [keyword, tab]);

  return (
    <>
      <PageHeading
        breadcrumbs={["LMS", "Update Data"]}
        title="Update Data Siswa"
        description="Pantau siswa yang belum memperbarui profil setelah pergantian tahun ajaran. Perubahan kelas tersimpan otomatis saat siswa memperbarui profilnya."
        variant="card"
        below={(
          /* Bagian tampilan: banner informasi sinkronisasi mandiri siswa. */
          <div className={`${s.infoBanner} ${s.info_info} ${s.updateSyncBanner}`}>
            <span className={s.updateSyncIcon}><AdminIcon name="info-circle-bold" size={19} /></span>
            <div><strong>Sinkronisasi Mandiri Siswa</strong><p>Admin tidak perlu mengubah data satu per satu. Siswa diminta memperbarui profil saat login ke akun masing-masing.</p></div>
          </div>
        )}
      />
      {/* Bagian tampilan: statistik perhatian khusus, kelengkapan data, dan periode aktif. */}
      <div className={s.statGridThree}>
        <StatCard variant="updateData" label="Perhatian Khusus" value="7 Siswa" detail="Siswa belum memperbarui konfirmasi kelas" icon="clock-circle-broken" tone="primary" />
        <StatCard variant="updateData" label="Kelengkapan Data" value="142 Siswa" valueNote="Sudah Diperbarui" detail="Data otomatis tersinkronisasi ke daftar rombel baru" icon="check-circle-linear" tone="success" />
        <StatCard variant="updateData" label="Periode Akademik Aktif" value="2026/2027 Ganjil" detail="Periode aktif berjalan sejak 15 Juli 2026." icon="clipboard-clock-linear" tone="warning" />
      </div>
      {/* Bagian tampilan: filter status pembaruan profil siswa. */}
      <Panel className={s.updateDataTablePanel}>
        <div className={`${s.toolbar} ${s.updateDataToolbar}`}><SearchField value={keyword} onChange={setKeyword} placeholder="Cari nama atau NISN..." /><div className={s.toolbarSpacer} /><div className={`${s.filterTabs} ${s.updateDataTabs}`}>{["Semua (149)", "Belum Memperbarui (7)", "Sudah Diperbarui (142)"].map((item) => <button key={item} aria-pressed={tab === item} onClick={() => setTab(item)}>{item}</button>)}</div></div>
        {/* Bagian tampilan: tabel perbandingan tingkat tercatat dan tingkat yang seharusnya. */}
        <div className={`${s.tableWrap} ${s.updateDataTableWrap}`}>
          <table className={`${s.dataTable} ${s.updateDataTable}`}>
            <thead><tr><th>Siswa</th><th>Tingkat Tercatat</th><th>Rombel Tercatat</th><th>Terdeteksi</th><th>Wali Kelas</th><th>Status</th></tr></thead>
            <tbody>{visible.map((row) => <tr key={row.nisn}>
              <td><div className={s.updateStudentIdentity}><span className={`${s.classCode} ${s.updateStudentAvatar}`}>{row.initials}</span><span className={s.updateStudentMeta}><span className={s.tableStrong}>{row.name}</span><span className={s.tableSub}>NISN: {row.nisn}</span></span></div></td>
              <td><span className={s.levelTag}>{row.level}</span></td><td>{row.recorded}</td><td><StatusBadge className={s.updateDataPill} tone={row.detected === "Sesuai" ? "success" : "warning"}>{row.detected === "Sesuai" && <AdminIcon name="check-linear" size={14} />}{row.detected !== "Sesuai" && <AdminIcon name="info-circle-linear" size={14} />}{row.detected}</StatusBadge></td><td>{row.wali}</td><td><StatusBadge className={s.updateDataPill} tone={row.status === "Sudah Diperbarui" ? "success" : "warning"}>{row.status}</StatusBadge></td>
            </tr>)}</tbody>
          </table>
        </div>
        <Pagination className={s.updateDataPagination} current={page} total={15} onChange={setPage} label={`Menampilkan 7 dari 149 siswa`} emphasizeLabelNumbers />
      </Panel>
    </>
  );
}
