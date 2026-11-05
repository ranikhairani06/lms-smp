import Link from "next/link";
import Image from "next/image";
import { Solar } from "../siswa/_components/icon";
import { ParentCard } from "./parent-components";
import { parentSubjectResults } from "./hasil-belajar/data";
import { requireUser } from "@/lib/backend";

const agenda = [
  { title: "Tugas 01 Informatika", date: "31 Okt 2026, 23:59 WIB", status: "3 Hari Lagi", tone: "warning", icon: "clipboard-text" },
  { title: "UTS Informatika", date: "06 Nov 2026, 08:00 WIB", status: "Mendatang", tone: "info", icon: "document-text" },
  { title: "Sumatif Bab 4 Matematika", date: "09 Nov 2026, 10:00 WIB", status: "Mendatang", tone: "info", icon: "document-text" },
];

export default async function ParentDashboard() {
  const user = await requireUser("parent");
  return (
    <div className="parent-dashboard">
      <section className="parent-welcome">
        <div>
          <h1>Halo, {user.name}!</h1>
          <p>Pantau perkembangan akademik dan hasil belajar putra/putri Anda. Informasi ini diverifikasi langsung oleh guru.</p>
        </div>
      </section>

      <ParentCard className="parent-student-card">
        <div className="parent-student-photo"><Image src="/orang-tua/student-reference.png" width={100} height={100} alt="Foto siswa pada contoh desain" /></div>
        <div className="parent-student-details">
          <h2>Andi Pratama</h2>
          <p><Solar name="card" /> NISN: <strong>0098471204</strong></p>
          <p><Solar name="square-academic-cap" /> Kelas: <strong>VII B</strong></p>
          <p><Solar name="user" /> Wali Kelas: <strong>Ibu Rina Marlina, M.Pd.</strong></p>
        </div>
        <div className="parent-year-chip"><Solar name="calendar" /><span>Tahun Ajaran<strong>Semester Ganjil 2026/2027</strong></span></div>
      </ParentCard>

      <div className="parent-overview-grid">
        <ParentCard className="parent-average-card">
          <div className="parent-section-title"><h2>Rata-rata Nilai</h2><span className="parent-kktp-badge"><Solar name="check-circle" /> Di Atas KKTP 75</span></div>
          <div className="parent-average-content"><div className="parent-score-ring"><Solar name="square-academic-cap" /></div><div>
            <strong className="parent-average-score">88.4</strong>
              <span className="parent-score-outof"> / 100</span>
              <p className="parent-average-caption">
                Berdasarkan 6 mata pelajaran aktif Semester Ganjil 2026/2027
              </p></div></div>
          <p className="parent-card-footnote"><Solar name="info-circle" /> Nilai gabungan tugas, formatif, dan ujian tengah semester.</p>
        </ParentCard>

        <ParentCard className="parent-progress-card">
          <div className="parent-section-title"><h2>Progres Belajar Semester Ganjil</h2><span className="parent-target-badge"><Solar name="check-circle" /> Sesuai Target</span></div>
          <div className="parent-progress-summary">
          <div className="parent-progress-meta"><strong>75%</strong><span>tercapai</span><span className="parent-progress-count">18 / 24 Materi selesai</span></div>
          <div className="parent-progress-track" role="progressbar" aria-label="Progres belajar semester" aria-valuenow={75} aria-valuemin={0} aria-valuemax={100}><span /></div>
          </div>
          <div className="parent-progress-foot">
            <span>Semester Ganjil 2026/2027</span>
            <strong>Sisa 6 Modul</strong>
          </div>
        </ParentCard>
      </div>

      <div className="parent-lower-grid">
        <ParentCard className="parent-grades-card">
          <div className="parent-section-title parent-grades-title"><div><h2>Daftar Nilai Mata Pelajaran</h2><p>Rekap nilai semester ganjil</p></div><span className="parent-kktp-badge parent-kktp-blue"><Solar name="tuning-2" /> Standar KKTP: 75</span></div>
          <div className="parent-table-wrap" tabIndex={0} role="region" aria-label="Daftar nilai mata pelajaran"><table className="parent-grades-table">
            <thead><tr><th>Mata Pelajaran</th><th>Guru Pengampu</th><th>Tugas</th><th>Formatif</th><th>UTS</th><th>Status KKTP</th></tr></thead>
            <tbody>{parentSubjectResults.map((subject) => <tr className={subject.status === "Tuntas" ? undefined : "parent-row-attention"} key={subject.slug}>
              <td><strong>{subject.slug === "ipa" ? "IPA" : subject.name}</strong></td><td>{subject.teacher}</td><td><strong>{subject.task}</strong></td><td><strong>{subject.formative}</strong></td>
              <td><strong className={subject.uts < 75 ? "is-low" : ""}>{subject.uts}</strong></td>
              <td><span className={`parent-status ${subject.status === "Tuntas" ? "is-done" : "is-attention"}`}>{subject.status}</span></td>
            </tr>)}</tbody>
          </table></div>
          <div className="parent-table-footer"><span>Menampilkan {parentSubjectResults.length} mata pelajaran terdaftar</span><Link className="parent-table-footer-link" href="/orang-tua/hasil-belajar">Lihat Semua Hasil Belajar <Solar name="arrow-right" /></Link></div>
        </ParentCard>

        <aside className="parent-side-stack">
          <ParentCard className="parent-agenda-card"><div className="parent-section-title"><h2>Agenda &amp; Penilaian</h2></div><p className="parent-side-caption">Jadwal asesmen terdekat</p>
            <div className="parent-agenda-list">{agenda.map((item) => <article className={`parent-agenda-item is-${item.tone}`} key={item.title}><div className="parent-agenda-heading"><strong>{item.title}</strong><span>{item.tone === "warning" && <Solar name="hourglass" />}{item.status}</span></div><p><Solar name="calendar" /> {item.date}</p></article>)}</div>
          </ParentCard>
          <ParentCard className="parent-latest-card"><div className="parent-section-title"><h2>Nilai Terbaru</h2></div><p className="parent-side-caption">Aktivitas penilaian yang baru dinilai guru</p>
            <div className="parent-latest-result"><div className="parent-latest-heading"><div><strong>Kuis Formatif Bab 1</strong><small>Informatika</small></div><div className="parent-latest-score"><strong>92</strong><small>Tuntas</small></div></div><div className="parent-latest-bottom"><span><Solar name="check-read" /> Dinilai pada 24 Okt 2026</span></div></div>
          </ParentCard>
        </aside>
      </div>
    </div>
  );
}
