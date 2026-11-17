import { Solar } from "../../siswa/_components/icon";
import { ParentCard, ParentPageHeading, ParentProgressBar, ParentStat } from "../parent-components";

const subjects = [
  { name: "Informatika", teacher: "Hendro Gunawan, S.Kom.", progress: 65, target: "Target SKK: 75%", modules: "6 dari 10 Selesai", moduleNote: "4 materi tersisa", tasks: "4 dari 5 Terkumpul", taskNote: "1 tugas deadline dekat", activity: "Hari ini, 09:42 WIB", activityNote: "Mengerjakan Kuis Scratch" },
  { name: "Matematika", teacher: "Siti Nurhayati, M.Pd.", progress: 80, target: "Melampaui Target", modules: "8 dari 10 Selesai", moduleNote: "2 modul lanjutan", tasks: "5 dari 5 Terkumpul", taskNote: "Seluruh tugas tuntas", activity: "Kemarin, 14:15 WIB", activityNote: "Latihan Soal Pythagoras" },
  { name: "Ilmu Pengetahuan Alam (IPA)", teacher: "Bambang Santoso, M.Si.", progress: 70, target: "Target SKK: 70%", modules: "7 dari 10 Selesai", moduleNote: "Struktur Sel & Jaringan", tasks: "3 dari 5 Terkumpul", taskNote: "1 laporan praktikum berjalan", activity: "2 Hari Lalu, 10:20 WIB", activityNote: "Menonton Video Pembelajaran" },
  { name: "Bahasa Indonesia", teacher: "Ratna Dewi, S.Pd.", progress: 90, target: "Hampir Selesai Semester", modules: "9 dari 10 Selesai", moduleNote: "Teks Laporan Hasil Observasi", tasks: "5 dari 5 Terkumpul", taskNote: "Tuntas seluruh portofolio", activity: "3 Hari Lalu, 16:00 WIB", activityNote: "Pengunggahan Draf Puisi" },
];

export default function ParentProgressPage() {
  return <>
    <ParentPageHeading title="Pemantauan Progres Belajar Siswa" description={<>Pelacakan ketuntasan materi pembelajaran dan penyelesaian asesmen ananda <strong className="parent-inline-link">Andi Pratama</strong>.</>} />
    <div className="parent-stats-grid parent-progress-stats">
      <ParentStat label="MATERI TUNTAS" value={<>48 <span>/ 64 Bab</span></>} note="75% total silabus dipelajari" icon="book-2" />
      <ParentStat label="ASESMEN SELESAI" value={<>6 <span>/ 8 Ujian</span></>} note="Predikat: Sangat Memuaskan" icon="clipboard-check" tone="green" />
      <ParentStat label="TUGAS MENUNGGU" value={<>3 <span>Tugas Aktif</span></>} note="Fokus pendampingan ananda" icon="clipboard-text" tone="amber" />
    </div>
    <div className="parent-progress-page-grid">
      <section className="parent-subject-progress-list" aria-label="Progres per mata pelajaran">
        <div className="parent-section-title parent-list-title"><div><h2>Progres per Mata Pelajaran</h2><p>Rincian pemenuhan materi dan ketuntasan tugas semester ganjil</p></div></div>
        {subjects.map((subject) => <ParentCard className={"parent-subject-progress " + (subject.progress >= 75 ? "is-green" : "is-blue")} key={subject.name}>
          <div className="parent-subject-progress-head">
            <div><h2>{subject.name}</h2><p>Guru Pengampu: {subject.teacher}</p></div>
            <div className="parent-subject-progress-value"><div><strong>{subject.progress}%</strong><span>Tuntas</span></div><small>{subject.target}</small></div>
          </div>
          <ParentProgressBar value={subject.progress} label={"Progres " + subject.name} />
          <div className="parent-module-metrics">
            <div><span>MODUL MATERI</span><strong>{subject.modules}</strong><p>{subject.moduleNote}</p></div>
            <div><span>TUGAS &amp; ASESMEN</span><strong>{subject.tasks}</strong><p className={subject.progress >= 75 ? "is-positive" : subject.name === "Informatika" ? "is-low" : ""}>{subject.taskNote}</p></div>
            <div><span>AKTIVITAS TERAKHIR</span><strong>{subject.activity}</strong><p>{subject.activityNote}</p></div>
          </div>
        </ParentCard>)}
      </section>
      <aside className="parent-progress-aside">
        <ParentCard className="parent-upcoming-card">
          <div className="parent-section-title parent-divided-heading"><h2>Asesmen Terdekat</h2></div>
          <p className="parent-side-caption">Jadwal pengumpulan tugas mandiri atau ujian terdekat yang memerlukan motivasi orang tua:</p>
          <article className="parent-upcoming-item"><div><span className="parent-inline-link">Informatika</span><span className="parent-status is-attention">3 Hari Lagi</span></div><h3>Tugas 01: Logika Algoritma Dasar &amp; Flowchart</h3><p><Solar name="clock-circle" />Batas: 31 Okt 2026, 23:59 WIB</p></article>
          <article className="parent-upcoming-item"><div><span>IPA Terpadu</span><span className="parent-status is-neutral">Mendatang</span></div><h3>Sumatif Tengah Semester: Sistem Respirasi &amp; Ekskresi</h3><p><Solar name="clock-circle" />08 Nov 2026, 08:00 WIB</p></article>
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
