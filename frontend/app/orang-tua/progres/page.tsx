import { Solar } from "../../siswa/_components/icon";
import { ParentCard, ParentPageHeading, ParentStat } from "../parent-components";
import { getParentDashboard, studentName } from "../parent-api";
import { EmptyState } from "@/components/lms/state";

export default async function ParentProgressPage() {
  const data = await getParentDashboard();
  if (!data.courseProgress.length) return <EmptyState title="Belum ada data progres belajar." description="Data progres akan tampil setelah tersedia." />;
  return <>
    <ParentPageHeading title="Pemantauan Progres Belajar Siswa" description={<>Pelacakan ketuntasan materi pembelajaran dan penyelesaian asesmen ananda <strong className="parent-inline-link">{studentName(data.student)}</strong>.</>} />
    <div className="parent-stats-grid parent-progress-stats">
      <ParentStat label="MATERI TUNTAS" value="—" note="—" icon="book-2" />
      <ParentStat label="ASESMEN SELESAI" value="—" note="—" icon="clipboard-check" tone="green" />
      <ParentStat label="TUGAS MENUNGGU" value="—" note="—" icon="clipboard-text" tone="amber" />
    </div>
    <div className="parent-progress-page-grid">
      <section className="parent-subject-progress-list" aria-label="Progres per mata pelajaran">
        <div className="parent-section-title parent-list-title"><div><h2>Progres per Mata Pelajaran</h2><p>Rincian pemenuhan materi dan ketuntasan tugas semester ganjil</p></div></div>
        <EmptyState title="Rincian progres belum tersedia." description="Rincian progres belajar belum tersedia." />
      </section>
      <aside className="parent-progress-aside">
        <ParentCard className="parent-upcoming-card">
          <div className="parent-section-title parent-divided-heading"><h2>Asesmen Terdekat</h2></div>
          <p className="parent-side-caption">Jadwal pengumpulan tugas mandiri atau ujian terdekat yang memerlukan motivasi orang tua:</p>
          <article className="parent-upcoming-item"><div><span className="parent-inline-link">—</span><span className="parent-status is-attention">—</span></div><h3>—</h3><p><Solar name="clock-circle" />—</p></article>
          <article className="parent-upcoming-item"><div><span>—</span><span className="parent-status is-neutral">—</span></div><h3>—</h3><p><Solar name="clock-circle" />—</p></article>
        </ParentCard>
        <div className="parent-progress-guide">
          <h2><Solar name="info-circle" />Keterangan &amp; Panduan</h2>
          <ul>
            <li><span className="guide-dot is-green" /><div><strong>Tuntas / Melampaui (75% – 100%)</strong><p>Ananda menguasai capaian pembelajaran dengan sangat baik.</p></div></li>
            <li><span className="guide-dot is-blue" /><div><strong>Sedang Berjalan (60% – 74%)</strong><p>Progres materi berjalan normal sesuai ritme sekolah.</p></div></li>
            <li><span className="guide-dot is-amber" /><div><strong>Perlu Perhatian (&lt; 60%)</strong><p>Disarankan pendampingan ekstra untuk mengejar ketertinggalan.</p></div></li>
          </ul>
        </div>
      </aside>
    </div>
  </>;
}
