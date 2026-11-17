import { notFound } from "next/navigation";
import { ParentCard, ParentPageHeading, ParentProgressBar, ParentStat } from "../../parent-components";
import { parentSubjectResults } from "../data";
import AssessmentTable from "./assessment-table";

export default async function ParentSubjectDetailPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject: slug } = await params;
  const subject = parentSubjectResults.find((item) => item.slug === slug);
  if (!subject) notFound();
  const components = [
    { label: "Tugas / LKPD", score: subject.task, weight: 30, tone: "blue" },
    { label: "Formatif / Kuis", score: subject.formative, weight: 30, tone: "amber" },
    { label: "UTS", score: subject.uts, weight: 40, tone: "green" },
  ];
  const total = components.reduce((sum, part) => sum + part.score * part.weight / 100, 0);
  const assessmentRows = [
    { name: slug === "matematika" ? "Latihan SPLDV: Persamaan Linier" : "Latihan Mandiri Bab 1", category: "Tugas", date: "12 Okt 2026", score: subject.task, status: "Selesai" },
    { name: slug === "matematika" ? "LKPD 02: Teorema Pythagoras" : "Lembar Kerja Peserta Didik 02", category: "Tugas", date: "15 Okt 2026", score: subject.task + 2, status: "Selesai" },
    { name: slug === "matematika" ? "Kuis Aljabar Linear" : "Kuis Formatif Bab 1", category: "Formatif", date: "20 Okt 2026", score: subject.formative - 2, status: "Selesai" },
    { name: slug === "matematika" ? "Kuis Bangun Ruang Sisi Datar" : "Kuis Formatif Bab 2", category: "Formatif", date: "22 Okt 2026", score: subject.formative + 2, status: "Selesai" },
    { name: "Ujian Tengah Semester", category: "UTS", date: "24 Okt 2026", score: subject.uts, status: "Selesai" },
    { name: slug === "matematika" ? "Tugas Mandiri Analisis Statistik" : "Tugas Mandiri Analisis Materi", category: "Tugas", date: "27 Okt 2026", score: subject.task - 2, status: "Selesai" },
  ];
  return <>
    <ParentPageHeading title={"Detail Hasil Belajar: " + subject.name + " Kelas VIII"} description="Rincian nilai tugas mandiri, lembar kerja, kuis, dan ujian tengah semester." action={{ href: "/orang-tua/hasil-belajar", label: "Kembali ke Hasil Belajar" }} />
    <div className="parent-stats-grid parent-detail-stats">
      <ParentStat label="NILAI AKHIR TERHITUNG" value={<>{total.toFixed(1)} <span>/ 100</span></>} note={total >= 75 ? "Di atas KKTP" : "Perlu perhatian"} tone="blue" />
      <ParentStat label="RATA-RATA TUGAS / LKPD" value={subject.task.toFixed(1)} note="3 tugas selesai" icon="clipboard-check" tone="purple" />
      <ParentStat label="RATA-RATA FORMATIF" value={subject.formative.toFixed(1)} note="2 kuis dikerjakan" icon="clipboard-text" tone="amber" />
      <ParentStat label="NILAI UTS" value={subject.uts.toFixed(1)} note="1 ujian tengah semester" icon="document-text" tone="green" />
    </div>
    <div className="parent-detail-grid">
      <AssessmentTable rows={assessmentRows} />
      <aside className="parent-detail-aside">
        <ParentCard className="parent-breakdown-card">
          <div className="parent-section-title parent-divided-heading"><div><h2>Ringkasan Nilai Komponen</h2><p>Simulasi perhitungan bobot nilai rapor</p></div></div>
          <div className="parent-breakdown-list">{components.map((part) => <div className={"tone-" + part.tone} key={part.label}>
            <div className="parent-breakdown-label"><strong>{part.label} ({part.weight}%)</strong><span>Kontribusi: <strong>{(part.score * part.weight / 100).toFixed(1)}</strong></span></div>
            <ParentProgressBar value={part.score} label={"Nilai " + part.label} />
            <p>Rata-rata: {part.score.toFixed(1)}</p>
          </div>)}</div>
          <div className="parent-total-score"><span>NILAI AKHIR TERHITUNG</span><strong>{total.toFixed(1)} <small>/ 100</small></strong></div>
        </ParentCard>
      </aside>
    </div>
  </>;
}
