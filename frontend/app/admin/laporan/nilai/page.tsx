"use client";

import { useMemo, useState } from "react";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import { AvatarInitials, Button, PageHeading, Pagination, Panel, ProgressBar, ScoreChip, StatCard, StatusBadge } from "@/app/admin/_components";
import { adminStyles as s } from "@/app/admin/_components/AdminUI";
import styles from "./page.module.css";

const grades = [
  { name: "Siti Rahma", initials: "SR", tone: "primary", nisn: "0098421001", class: "8A", formative: "95.0", uts: "96.0", uas: "98.0", final: "96.3", result: "Tuntas" },
  { name: "Andi Pratama", initials: "AP", tone: "warning", nisn: "0098471204", class: "8A", formative: "88.0", uts: "86.0", uas: "89.0", final: "87.7", result: "Tuntas" },
  { name: "Nabila Putri Ramadhani", initials: "NP", tone: "info", nisn: "0098314452", class: "8A", formative: "84.0", uts: "85.0", uas: "86.0", final: "85.0", result: "Tuntas" },
  { name: "Bagas Pratama", initials: "BP", tone: "primary", nisn: "0089123456", class: "8A", formative: "82.0", uts: "80.0", uas: "83.0", final: "81.7", result: "Tuntas" },
  { name: "Farhan Maulana Arifin", initials: "FM", tone: "danger", nisn: "0098998822", class: "8A", formative: "74.0", uts: "71.0", uas: "72.0", final: "72.3", result: "Perlu Perhatian" },
  { name: "Cantika Aurelia Putri", initials: "CA", tone: "warning", nisn: "0098551239", class: "8A", formative: "73.0", uts: "72.0", uas: "70.0", final: "71.7", result: "Perlu Perhatian" },
];
const subjects = [
  { name: "Informatika", class: "Rombel 8B", teacher: "Bpk. Hendra Gunawan, S.Kom.", initials: "HG", teacherTone: "primary", nip: "198204122008011003", module: "6 terbit • 0 draf", assessments: "1 Asesmen", progress: 84, average: "84.1", status: "Tuntas" },
  { name: "Matematika", class: "Rombel 8B", teacher: "Ibu Siti Nurhaliza, M.Pd.", initials: "SN", teacherTone: "warning", nip: "198402112009022004", module: "8 terbit • 1 draf", assessments: "2 Asesmen", progress: 82.5, average: "78.4", status: "Tuntas" },
  { name: "Bahasa Indonesia", class: "Rombel 8A", teacher: "Ibu Rina Marlina, M.Pd.", initials: "RM", teacherTone: "info", nip: "198205242008012011", module: "10 terbit • 2 draf", assessments: "2 Asesmen", progress: 88, average: "83.2", status: "Tuntas" },
  { name: "IPA Terpadu", class: "Rombel 8B", teacher: "Bpk. Joko Susilo, S.Pd.", initials: "JS", teacherTone: "danger", nip: "197812042006041008", module: "7 terbit • 2 draf", assessments: "1 Asesmen", progress: 68.4, average: "73.2", status: "Perlu Perhatian" },
  { name: "Bahasa Inggris", class: "Rombel 8C", teacher: "Ibu Maya Susanti, S.Pd.", initials: "MS", teacherTone: "primary", nip: "198511202010012015", module: "6 terbit • 1 draf", assessments: "2 Asesmen", progress: 71, average: "76.8", status: "Tuntas" },
  { name: "Pendidikan Pancasila (PPKn)", class: "Rombel 8A", teacher: "Bpk. Ahmad Fauzi, S.Pd.", initials: "AF", teacherTone: "primary", nip: "198703182011011009", module: "5 terbit • 0 draf", assessments: "1 Asesmen", progress: 79.2, average: "80.6", status: "Tuntas" },
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
      {/* Bagian tampilan: judul laporan, ringkasan, dan aksi ekspor. */}
      <PageHeading className={styles.pageHeader} breadcrumbs={["LMS", "Laporan"]} title="Laporan Nilai & Ketercapaian Hasil Belajar" description="Rekapitulasi nilai formatif, UTS, UAS, dan capaian KKTP. Data terhubung otomatis dengan data kelas dan siswa." variant="card" actions={<Button className={styles.exportButton} icon="table-linear" onClick={exportReport}>Ekspor Log (XLS)</Button>} />

      {/* Bagian tampilan: filter laporan memakai pola visual Laporan Aktivitas. */}
      <Panel className={styles.filterPanel}>
        <div className={styles.filterGrid}>
          <label className={styles.filterItem}><span className={styles.filterLabel}><AdminIcon name="calendar-linear" size={13} /> Tahun Ajaran</span><span className={styles.selectWrap}><select value={year} onChange={(e) => setYear(e.target.value)}><option>2026/2027 Ganjil</option><option>2026/2027 Genap</option><option>2025/2026 Genap</option></select><AdminIcon name="alt-arrow-down-linear" size={16} /></span></label>
          <label className={styles.filterItem}><span className={styles.filterLabel}><AdminIcon name="buildings-2-linear" size={13} /> Tingkat</span><span className={styles.selectWrap}><select value={level} onChange={(e) => setLevel(e.target.value)}><option>Kelas VII</option><option>Kelas VIII</option><option>Kelas IX</option></select><AdminIcon name="alt-arrow-down-linear" size={16} /></span></label>
          <label className={styles.filterItem}><span className={styles.filterLabel}><AdminIcon name="users-group-rounded-linear" size={13} /> Rombongan Belajar</span><span className={styles.selectWrap}><select value={rombel} onChange={(e) => setRombel(e.target.value)}><option>Kelas 8A</option><option>Kelas 8B</option><option>Kelas 8C</option><option>Semua Rombel</option></select><AdminIcon name="alt-arrow-down-linear" size={16} /></span></label>
          <label className={styles.filterItem}><span className={styles.filterLabel}><AdminIcon name="widget-2-linear" size={13} /> Mata Pelajaran</span><span className={styles.selectWrap}><select value={subject} onChange={(e) => setSubject(e.target.value)}><option>Semua Mapel</option><option>Informatika</option><option>Matematika</option><option>IPA Terpadu</option><option>Bahasa Indonesia</option></select><AdminIcon name="alt-arrow-down-linear" size={16} /></span></label>
          <div className={styles.filterActions}><Button className={styles.applyFilterButton} icon="slider-horizontal-linear">Terapkan Filter</Button><Button className={styles.resetButton} variant="ghost" icon="refresh-linear" onClick={() => { setYear("2026/2027 Ganjil"); setLevel("Kelas VIII"); setRombel("Kelas 8A"); setSubject("Semua Mapel"); }}>Reset</Button></div>
        </div>
      </Panel>

      {/* Bagian tampilan: empat statistik KKTP dengan komponen StatCard bersama. */}
      <div className={s.reportStats}>
        <StatCard variant="report" label="Tuntas KKTP" value="812" valueNote="/ 860 Siswa" footer="94.4% Siswa Memenuhi Target" footerTone="success" icon="check-circle-linear" tone="success" />
        <StatCard variant="report" label="Perlu Perhatian" value="48 Siswa" footer="Nilai di bawah KKTP 75.0" footerTone="warning" icon="danger-triangle-linear" tone="warning" />
        <StatCard variant="report" label="Total Mata Pelajaran" value="10 Mata Pelajaran" valueFullWidth icon="book-2-linear" tone="primary" hideEmptyDetail />
        <StatCard variant="report" label="Asesmen Aktif" value="14 Asesmen" footer="Sedang Berlangsung Semester Ganjil" footerTone="warning" icon="clipboard-check-linear" tone="warning" />
      </div>

      {/* Bagian tampilan: tabel nilai siswa, identitas, chip nilai, dan status KKTP. */}
      <Panel className={styles.reportPanel}>
        <div className={styles.panelTitle}><h2>Hasil Penilaian Siswa</h2></div>
        <div className={styles.tableWrap}>
          <table className={`${s.dataTable} ${styles.gradeTable}`}>
            <colgroup><col /><col /><col /><col /><col /><col /><col /><col /></colgroup>
            <thead><tr><th><span className={styles.sortHeading}>Nama Siswa <AdminIcon name="sort-linear" size={12} /></span></th><th><span className={styles.sortHeading}>NISN <AdminIcon name="sort-linear" size={12} /></span></th><th>Kelas</th><th><span className={styles.sortHeading}>Formatif <AdminIcon name="sort-linear" size={12} /></span></th><th><span className={styles.sortHeading}>UTS <AdminIcon name="sort-linear" size={12} /></span></th><th><span className={styles.sortHeading}>UAS <AdminIcon name="sort-linear" size={12} /></span></th><th className={styles.numericHeading}><span className={styles.sortHeading}>Nilai Akhir <AdminIcon name="alt-arrow-down-linear" size={12} /></span></th><th>Keterangan KKTP</th></tr></thead>
            <tbody>{visibleGrades.map((row) => <tr key={row.nisn}>
              <td><div className={styles.studentIdentity}><AvatarInitials initials={row.initials} tone={row.tone as "primary" | "info" | "warning" | "danger"} /><span><strong>{row.name}</strong><small>NISN: {row.nisn}</small></span></div></td>
              <td>{row.nisn}</td><td>{row.class}</td>
              <td className={styles.numericCell}>{row.formative}</td><td className={styles.numericCell}>{row.uts}</td><td className={styles.numericCell}>{row.uas}</td>
              <td className={styles.numericCell}>{Number(row.final) < 75 ? <ScoreChip>{row.final}</ScoreChip> : <strong>{row.final}</strong>}</td>
              <td><StatusBadge className={styles.statusPill} tone={row.result === "Tuntas" ? "success" : "warning"}><AdminIcon name={row.result === "Tuntas" ? "check-circle-bold" : "danger-triangle-bold"} size={12} />{row.result}</StatusBadge></td>
            </tr>)}</tbody>
          </table>
        </div>
        <Pagination className={styles.pagination} controlsClassName={styles.pageControls} currentPageClassName={styles.currentPage} current={page} total={144} variant="directory" onChange={setPage} label="Menampilkan halaman 1 dari 144" emphasizeLabelNumbers />
      </Panel>

      {/* Bagian tampilan: rekap modul, asesmen, progres, dan rata-rata setiap mapel. */}
      <Panel className={styles.reportPanel}>
        <div className={styles.panelTitle}><h2>Ringkasan Pembelajaran per Mata Pelajaran</h2></div>
        <div className={styles.tableWrap}>
          <table className={`${s.dataTable} ${styles.subjectTable}`}>
            <colgroup><col /><col /><col /><col /><col /><col /><col /></colgroup>
            <thead><tr><th><span className={styles.sortHeading}>Mata Pelajaran / Rombel <AdminIcon name="sort-linear" size={12} /></span></th><th>Guru Pengampu</th><th>Modul</th><th>Asesmen Aktif</th><th><span className={styles.sortHeading}>Rata-rata Progres <AdminIcon name="sort-linear" size={12} /></span></th><th className={styles.numericHeading}><span className={styles.sortHeading}>Rata-rata Nilai <AdminIcon name="sort-linear" size={12} /></span></th><th>Keterangan KKTP</th></tr></thead>
            <tbody>{subjects.filter((item) => subject === "Semua Mapel" || item.name === subject).map((row) => <tr key={row.name} className={row.status === "Perlu Perhatian" ? styles.attentionRow : ""}>
              <td><span className={styles.subjectIdentity}><strong>{row.name}</strong><small>{row.class}</small></span></td>
              <td><div className={styles.teacherIdentity}><AvatarInitials initials={row.initials} tone={row.teacherTone as "primary" | "info" | "warning" | "danger"} /><span><strong>{row.teacher}</strong><small>NIP {row.nip}</small></span></div></td>
              <td className={styles.moduleCell}>{row.module}</td><td><StatusBadge className={styles.assessmentPill} tone="info">{row.assessments}</StatusBadge></td>
              <td><div className={styles.progressCell}><ProgressBar value={row.progress} tone={row.progress < 75 ? "warning" : "primary"} /><span>{row.progress.toFixed(1)}%</span></div></td>
              <td className={styles.numericCell}>{Number(row.average) < 75 ? <ScoreChip>{row.average}</ScoreChip> : <strong>{row.average}</strong>}</td>
              <td><StatusBadge className={styles.statusPill} tone={row.status === "Tuntas" ? "success" : "warning"}><AdminIcon name={row.status === "Tuntas" ? "check-circle-linear" : "danger-triangle-linear"} size={12} />{row.status}</StatusBadge></td>
            </tr>)}</tbody>
          </table>
        </div>
        <Pagination className={styles.pagination} controlsClassName={styles.pageControls} currentPageClassName={styles.currentPage} current={page} total={4} onChange={setPage} label="Menampilkan 1 sampai 6 dari 24 entri" emphasizeLabelNumbers />
      </Panel>
    </>
  );
}
