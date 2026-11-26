import Link from "next/link";
import Image from "next/image";
import { Solar } from "../siswa/_components/icon";
import { ParentCard } from "./parent-components";
import { display, getParentDashboard, parentSubjects, studentClass, studentName, studentNisn } from "./parent-api";
import { requireUser } from "@/lib/backend";
import { EmptyState } from "@/components/lms/state";

export default async function ParentDashboard() {
  const user = await requireUser("parent");
  const data = await getParentDashboard();
  const student = data.student;
  if (!student) return <EmptyState title="Belum ada siswa yang terhubung." description="Hubungi pihak sekolah untuk memeriksa tautan akun siswa." />;
  const subjects = parentSubjects(data.submissions);
  const alerts = data.alerts.filter((alert): alert is string => typeof alert === "string" && Boolean(alert.trim()));
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
          <h2>{studentName(student)}</h2>
          <p><Solar name="card" /> NISN: <strong>{studentNisn(student)}</strong></p>
          <p><Solar name="square-academic-cap" /> Kelas: <strong>{studentClass(student)}</strong></p>
          <p><Solar name="user" /> Wali Kelas: <strong>—</strong></p>
        </div>
        <div className="parent-year-chip"><Solar name="calendar" /><span>Tahun Ajaran<strong>—</strong></span></div>
      </ParentCard>

      <div className="parent-overview-grid">
        <ParentCard className="parent-average-card">
          <div className="parent-section-title"><h2>Rata-rata Nilai</h2><span className="parent-kktp-badge"><Solar name="check-circle" /> —</span></div>
          <div className="parent-average-content"><div className="parent-score-ring"><Solar name="square-academic-cap" /></div><div>
            <strong className="parent-average-score">—</strong>
              <span className="parent-score-outof"> / 100</span>
              <p className="parent-average-caption">
                Berdasarkan {subjects.length} mata pelajaran
              </p></div></div>
          <p className="parent-card-footnote"><Solar name="info-circle" /> —</p>
        </ParentCard>

        <ParentCard className="parent-progress-card">
          <div className="parent-section-title"><h2>Progres Belajar</h2><span className="parent-target-badge"><Solar name="check-circle" /> —</span></div>
          <div className="parent-progress-summary">
          <div className="parent-progress-meta"><strong>—</strong><span>tercapai</span><span className="parent-progress-count">—</span></div>
          <div className="parent-progress-track" role="progressbar" aria-label="Progres belajar semester" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100}><span /></div>
          </div>
          <div className="parent-progress-foot">
            <span>—</span>
            <strong>—</strong>
          </div>
        </ParentCard>
      </div>

      <div className="parent-lower-grid">
        <ParentCard className="parent-grades-card">
          <div className="parent-section-title parent-grades-title"><div><h2>Daftar Nilai Mata Pelajaran</h2><p>Rekap nilai</p></div><span className="parent-kktp-badge parent-kktp-blue"><Solar name="tuning-2" /> Standar KKTP: —</span></div>
          <div className="parent-table-wrap" tabIndex={0} role="region" aria-label="Daftar nilai mata pelajaran"><table className="parent-grades-table">
            <thead><tr><th>Mata Pelajaran</th><th>Guru Pengampu</th><th>Tugas</th><th>Formatif</th><th>UTS</th><th>Status KKTP</th></tr></thead>
            <tbody>{subjects.map((subject) => <tr key={subject.slug}>
              <td><strong>{subject.slug === "ipa" ? "IPA" : subject.name}</strong></td><td>{subject.teacher}</td><td><strong>{display(subject.task)}</strong></td><td><strong>{display(subject.formative)}</strong></td>
              <td><strong>{display(subject.uts)}</strong></td>
              <td><span className="parent-status is-neutral">—</span></td>
            </tr>)}{!subjects.length && <tr><td colSpan={6} className="parent-empty-state">Belum ada hasil belajar.</td></tr>}</tbody>
          </table></div>
          <div className="parent-table-footer"><span>Menampilkan {subjects.length} mata pelajaran terdaftar</span><Link className="parent-table-footer-link" href="/orang-tua/hasil-belajar">Lihat Semua Hasil Belajar <Solar name="arrow-right" /></Link></div>
        </ParentCard>

        <aside className="parent-side-stack">
          <ParentCard className="parent-agenda-card"><div className="parent-section-title"><h2>Agenda &amp; Penilaian</h2></div><p className="parent-side-caption">Jadwal asesmen terdekat</p>
            <div className="parent-agenda-list">{alerts.map((alert, index) => <article className="parent-agenda-item is-info" key={`${index}-${alert}`}><div className="parent-agenda-heading"><strong>{alert}</strong><span>—</span></div><p><Solar name="calendar" /> —</p></article>)}</div>
          </ParentCard>
          <ParentCard className="parent-latest-card"><div className="parent-section-title"><h2>Nilai Terbaru</h2></div><p className="parent-side-caption">Aktivitas penilaian yang baru dinilai guru</p>
            <div className="parent-latest-result"><div className="parent-latest-heading"><div><strong>—</strong><small>—</small></div><div className="parent-latest-score"><strong>—</strong><small>—</small></div></div><div className="parent-latest-bottom"><span><Solar name="check-read" /> —</span></div></div>
          </ParentCard>
        </aside>
      </div>
    </div>
  );
}
