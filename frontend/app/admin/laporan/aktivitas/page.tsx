"use client";

import { useMemo, useState } from "react";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import { Button, PageHeading, Pagination, Panel, SelectField, StatusBadge, adminStyles as s } from "@/app/admin/_components/AdminUI";

const activityRows = [
  { time: "27 Okt 2026, 22:41", initials: "AB", name: "Admin Bayu", identity: "NIP: 198504122010011008", role: "Super Admin", description: "Mereset sandi Andi Pratama (8B)", status: "Berhasil" },
  { time: "27 Okt 2026, 21:15", initials: "HG", name: "Hendra Gunawan, S.Kom.", identity: "NIP: 198204122008011003", role: "Guru", description: "Mempublikasikan nilai Tugas 01 Informatika 8A", status: "Berhasil" },
  { time: "27 Okt 2026, 20:04", initials: "AB", name: "Admin Bayu", identity: "NIP: 198504122010011008", role: "Super Admin", description: "Menyetujui pengajuan profil PRF-2026-0142", status: "Berhasil" },
  { time: "27 Okt 2026, 19:30", initials: "HG", name: "Hendra Gunawan, S.Kom.", identity: "NIP: 198204122008011003", role: "Guru", description: "Mengembalikan siswa waktu UTS Informatika 8B", status: "Berhasil" },
  { time: "27 Okt 2026, 18:42", initials: "BP", name: "Bambang Pratama, S.T.", identity: "Wali Andi Pratama • ID: WU-00892", role: "Orang Tua", description: "Masuk ke sistem", status: "Berhasil" },
  { time: "27 Okt 2026, 17:18", initials: "AP", name: "Andi Pratama", identity: "NISN: 0098471204 – Kelas 8B", role: "Siswa", description: "Gagal masuk: kata sandi salah", status: "Gagal" },
];

export default function LaporanAktivitasPage() {
  const [range, setRange] = useState("7 Hari Terakhir");
  const [role, setRole] = useState("Semua Peran");
  const [module, setModule] = useState("Semua Modul");
  const [status, setStatus] = useState("Semua Status");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => activityRows.filter((row) => (role === "Semua Peran" || row.role === role) && (status === "Semua Status" || row.status === status)), [role, status]);
  const exportLogs = () => {
    const csv = ["Timestamp,User,Role,Description,Status", ...filtered.map((row) => [row.time, row.name, row.role, row.description, row.status].map((value) => `"${value.replace(/"/g, '""')}"`).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "laporan-aktivitas.csv"; link.click(); URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeading breadcrumbs={["LMS", "Laporan"]} title="Laporan Aktivitas Pengguna" description="Riwayat aktivitas pengguna di sistem. Hanya dapat dilihat." actions={<Button variant="outline" icon="file-download-linear" onClick={exportLogs}>Ekspor Log (XLS)</Button>} />
      {/* Bagian tampilan: filter rentang waktu, peran, modul, dan status aktivitas. */}
      <Panel>
        <div className={s.filterGrid}>
          <label className={s.filterItem}><span><AdminIcon name="calendar-linear" size={12} /> Rentang Tanggal</span><select value={range} onChange={(e) => setRange(e.target.value)}><option>7 Hari Terakhir</option><option>30 Hari Terakhir</option><option>Bulan Ini</option><option>Semua Waktu</option></select></label>
          <label className={s.filterItem}><span><AdminIcon name="users-group-rounded-linear" size={12} /> Peran Pengguna</span><select value={role} onChange={(e) => setRole(e.target.value)}><option>Semua Peran</option><option>Super Admin</option><option>Guru</option><option>Orang Tua</option><option>Siswa</option></select></label>
          <label className={s.filterItem}><span><AdminIcon name="widget-2-linear" size={12} /> Modul Sistem</span><select value={module} onChange={(e) => setModule(e.target.value)}><option>Semua Modul</option><option>Manajemen Pengguna</option><option>Nilai</option><option>Profil</option><option>Autentikasi</option></select></label>
          <label className={s.filterItem}><span><AdminIcon name="check-circle-linear" size={12} /> Status</span><select value={status} onChange={(e) => setStatus(e.target.value)}><option>Semua Status</option><option>Berhasil</option><option>Gagal</option></select></label>
          <div style={{ display: "flex", alignItems: "end", gap: 8 }}><Button icon="filter-linear">Terapkan Filter</Button><Button variant="ghost" onClick={() => { setRange("7 Hari Terakhir"); setRole("Semua Peran"); setModule("Semua Modul"); setStatus("Semua Status"); }}>Reset</Button></div>
        </div>
        {/* Bagian tampilan: tabel log aktivitas bersifat hanya-baca. */}
        <div className={s.panelTitle}><h2><AdminIcon name="history-linear" size={18} /> Tabel Riwayat Aktivitas</h2></div>
        <div className={s.tableWrap}>
          <table className={s.dataTable}>
            <thead><tr><th>Timestamp (WIB)</th><th>Pengguna &amp; Identitas</th><th>Peran</th><th>Deskripsi Aktivitas</th><th>Status</th></tr></thead>
            <tbody>{filtered.map((row, index) => <tr key={`${row.time}-${index}`}>
              <td><span style={{ color: "#737A88" }}><AdminIcon name="clock-circle-linear" size={13} /> {row.time}</span></td>
              <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span className={s.classCode}>{row.initials}</span><span><span className={s.tableStrong}>{row.name}</span><span className={s.tableSub}>{row.identity}</span></span></div></td>
              <td><StatusBadge tone={row.role === "Super Admin" ? "primary" : row.role === "Guru" ? "info" : row.role === "Siswa" ? "success" : "warning"}>{row.role}</StatusBadge></td><td>{row.description}</td><td><StatusBadge tone={row.status === "Berhasil" ? "success" : "danger"}>● {row.status}</StatusBadge></td>
            </tr>)}</tbody>
          </table>
        </div>
        <Pagination current={page} total={3} onChange={setPage} label="Menampilkan entri 1 hingga 6 dari total 14.820 log aktivitas" />
      </Panel>
    </>
  );
}
