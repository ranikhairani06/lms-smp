"use client";

import { useMemo, useState } from "react";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import { Button, PageHeading, Pagination, Panel, SelectField, StatusBadge, adminStyles as s } from "@/app/admin/_components/AdminUI";

const grades = [
  { name: "Siti Rahma", nisn: "0098421001", class: "8A", formative: "95.0", uts: "96.0", uas: "98.0", final: "96.3", result: "Tuntas" },
  { name: "Andi Pratama", nisn: "0098471204", class: "8A", formative: "88.0", uts: "86.0", uas: "89.0", final: "87.7", result: "Tuntas" },
  { name: "Nabila Putri Ramadhani", nisn: "0098314452", class: "8A", formative: "84.0", uts: "85.0", uas: "86.0", final: "85.0", result: "Tuntas" },
  { name: "Bagas Pratama", nisn: "009823456", class: "8A", formative: "82.0", uts: "80.0", uas: "83.0", final: "81.7", result: "Tuntas" },
  { name: "Farhan Maulana Arifin", nisn: "0098898822", class: "8A", formative: "74.0", uts: "71.0", uas: "72.0", final: "72.3", result: "Perlu Perhatian" },
  { name: "Cantika Aurelia Putri", nisn: "00985651239", class: "8A", formative: "73.0", uts: "72.0", uas: "70.0", final: "71.7", result: "Perlu Perhatian" },
];
const subjects = [
  { name: "Informatika", class: "Rombel 8B", teacher: "Bpk. Hendra Gunawan, S.Kom.", module: "6 terbit • 0 draf", assessments: "1 Asesmen", progress: 84, average: "84.1", status: "Tuntas" },
  { name: "Matematika", class: "Rombel 8B", teacher: "Ibu Siti Nurhaliza, M.Pd.", module: "8 terbit • 1 draf", assessments: "2 Asesmen", progress: 82.5, average: "78.4", status: "Tuntas" },
  { name: "Bahasa Indonesia", class: "Rombel 8A", teacher: "Ibu Rina Marlina, M.Pd.", module: "10 terbit • 2 draf", assessments: "2 Asesmen", progress: 88, average: "83.2", status: "Tuntas" },
  { name: "IPA Terpadu", class: "Rombel 8B", teacher: "Bpk. Joko Susilo, S.Pd.", module: "7 terbit • 2 draf", assessments: "1 Asesmen", progress: 68.4, average: "73.2", status: "Perlu Perhatian" },
  { name: "Bahasa Inggris", class: "Rombel 8C", teacher: "Ibu Maya Susanti, S.Pd.", module: "5 terbit • 1 draf", assessments: "2 Asesmen", progress: 71, average: "76.8", status: "Tuntas" },
  { name: "Pendidikan Pancasila (PPKn)", class: "Rombel 8A", teacher: "Bpk. Ahmad Fauzi, S.Pd.", module: "5 terbit • 0 draf", assessments: "1 Asesmen", progress: 79.2, average: "80.6", status: "Tuntas" },
];

export default function LaporanNilaiPage() {
  const [year, setYear] = useState("2026/2027 Ganjil");
  const [level, setLevel] = useState("Kelas VIII");
  const [rombel, setRombel] = useState("Kelas 8A");
  const [subject, setSubject] = useState("Semua Mapel");
  const [page, setPage] = useState(1);
  const visibleGrades = useMemo(() => grades.filter((row) => (rombel === "Semua Rombel" || row.class === rombel.replace("Kelas ", ""))), [rombel]);
  const exportReport = () => {
    const csv = ["Nama Siswa,NISN,Kelas,Formatif,UTS,UAS,Nilai Akhir,KKTP", ...visibleGrades.map((row) => `${row.name},${row.nisn},${row.class},${row.formative},${row.uts},${row.uas},${row.final},${row.result}`)].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = "laporan-nilai.csv"; link.click(); URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeading breadcrumbs={["LMS", "Laporan"]} title="Laporan Nilai & Ketercapaian Hasil Belajar" description="Rekapitulasi nilai formatif, UTS, UAS, dan capaian KKTP. Data terhubung otomatis dengan data kelas dan siswa." actions={<Button variant="outline" icon="file-download-linear" onClick={exportReport}>Ekspor Log (XLS)</Button>} />
      {/* Bagian tampilan: filter periode, tingkat, rombel, dan mata pelajaran. */}
      <Panel>
        <div className={s.filterGrid}>
          <label className={s.filterItem}><span>Tahun Ajaran</span><select value={year} onChange={(e) => setYear(e.target.value)}><option>2026/2027 Ganjil</option><option>2026/2027 Genap</option><option>2025/2026 Genap</option></select></label>
          <label className={s.filterItem}><span>Tingkat</span><select value={level} onChange={(e) => setLevel(e.target.value)}><option>Kelas VII</option><option>Kelas VIII</option><option>Kelas IX</option></select></label>
          <label className={s.filterItem}><span>Rombongan Belajar</span><select value={rombel} onChange={(e) => setRombel(e.target.value)}><option>Kelas 8A</option><option>Kelas 8B</option><option>Kelas 8C</option><option>Semua Rombel</option></select></label>
          <label className={s.filterItem}><span>Mata Pelajaran</span><select value={subject} onChange={(e) => setSubject(e.target.value)}><option>Semua Mapel</option><option>Informatika</option><option>Matematika</option><option>IPA Terpadu</option><option>Bahasa Indonesia</option></select></label>
          <div style={{ display: "flex", alignItems: "end", gap: 4 }}><Button icon="filter-linear">Terapkan Filter</Button><Button variant="ghost" onClick={() => { setYear("2026/2027 Ganjil"); setLevel("Kelas VIII"); setRombel("Kelas 8A"); setSubject("Semua Mapel"); }}>Reset</Button></div>
        </div>
      </Panel>
      {/* Bagian tampilan: empat indikator ketercapaian hasil belajar dan asesmen. */}
      <div className={s.reportStats}>
        <div className={s.reportStat}><div className={s.reportStatTitle}><span><AdminIcon name="check-circle-linear" size={15} /> Tuntas KKTP</span><StatusBadge tone="success">94.4%</StatusBadge></div><strong>812 / 860</strong><small>Siswa memenuhi target</small></div>
        <div className={s.reportStat}><div className={s.reportStatTitle}><span><AdminIcon name="danger-triangle-linear" size={15} /> Perlu Perhatian</span></div><strong>48 Siswa</strong><small>Nilai di bawah KKTP 75.0</small></div>
        <div className={s.reportStat}><div className={s.reportStatTitle}><span><AdminIcon name="book-2-linear" size={15} /> Total Mata Pelajaran</span></div><strong>10 Mata Pelajaran</strong><small>Periode aktif</small></div>
        <div className={s.reportStat}><div className={s.reportStatTitle}><span><AdminIcon name="clipboard-check-linear" size={15} /> Asesmen Aktif</span></div><strong>14 Asesmen</strong><small>Sedang berlangsung semester ganjil</small></div>
      </div>
      {/* Bagian tampilan: hasil penilaian siswa dengan nilai akhir dan keterangan KKTP. */}
      <Panel>
        <div className={s.panelTitle}><h2>Hasil Penilaian Siswa</h2><StatusBadge tone="info">KKTP 75.0</StatusBadge></div>
        <div className={s.tableWrap}><table className={s.dataTable}>
          <thead><tr><th>Nama Siswa</th><th>NISN</th><th>Kelas</th><th>Formatif</th><th>UTS</th><th>UAS</th><th>Nilai Akhir</th><th>Keterangan KKTP</th></tr></thead>
          <tbody>{visibleGrades.map((row) => <tr key={row.nisn}><td><span className={s.tableStrong}>{row.name}</span></td><td>{row.nisn}</td><td>{row.class}</td><td>{row.formative}</td><td>{row.uts}</td><td>{row.uas}</td><td><strong style={{ color: Number(row.final) < 75 ? "#E03131" : "#1B1D23" }}>{row.final}</strong></td><td><StatusBadge tone={row.result === "Tuntas" ? "success" : "warning"}>{row.result}</StatusBadge></td></tr>)}</tbody>
        </table></div>
        <Pagination current={page} total={4} onChange={setPage} label="Menampilkan halaman 1 dari 144" />
      </Panel>
      {/* Bagian tampilan: ringkasan pembelajaran, modul, asesmen, dan rata-rata per mata pelajaran. */}
      <Panel className={s.panelSpaced}>
        <div className={s.panelTitle}><h2>Ringkasan Pembelajaran per Mata Pelajaran</h2></div>
        <div className={s.tableWrap}><table className={s.dataTable}>
          <thead><tr><th>Mata Pelajaran / Rombel</th><th>Guru Pengampu</th><th>Modul</th><th>Asesmen Aktif</th><th>Rata-rata Progres</th><th>Rata-rata Nilai</th><th>Keterangan KKTP</th></tr></thead>
          <tbody>{subjects.filter((item) => subject === "Semua Mapel" || item.name === subject).map((row) => <tr key={row.name}><td><span className={s.tableStrong}>{row.name}</span><span className={s.tableSub}>{row.class}</span></td><td>{row.teacher}</td><td>{row.module}</td><td><StatusBadge tone="info">{row.assessments}</StatusBadge></td><td><div className={s.capacity}><div className={s.capacityBar}><span style={{ width: `${row.progress}%`, background: row.status === "Tuntas" ? "#3B5BDB" : "#E8A317" }} /></div><span className={s.tableSub}>{row.progress}%</span></div></td><td><strong>{row.average}</strong></td><td><StatusBadge tone={row.status === "Tuntas" ? "success" : "warning"}>{row.status}</StatusBadge></td></tr>)}</tbody>
        </table></div>
        <Pagination current={page} total={4} onChange={setPage} label="Menampilkan 1 sampai 6 dari 24 entri" />
      </Panel>
    </>
  );
}
