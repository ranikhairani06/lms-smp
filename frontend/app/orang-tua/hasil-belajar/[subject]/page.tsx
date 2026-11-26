import { notFound } from "next/navigation";
import { ParentCard, ParentPageHeading, ParentProgressBar, ParentStat } from "../../parent-components";
import { assessmentCategory, display, getParentDashboard, parentSubjects } from "../../parent-api";
import AssessmentTable from "./assessment-table";

export default async function ParentSubjectDetailPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject: slug } = await params;
  const data = await getParentDashboard();
  const subject = parentSubjects(data.submissions).find((item) => item.slug === slug);
  if (!subject) notFound();
  const components = [
    { label: "Tugas / LKPD", score: subject.task, tone: "blue" },
    { label: "Formatif / Kuis", score: subject.formative, tone: "amber" },
    { label: "UTS", score: subject.uts, tone: "green" },
  ].filter((part): part is { label: string; score: number; tone: string } => part.score !== null);
  const assessmentRows = data.submissions.filter((submission) => submission.slug === slug).map((submission) => ({
    name: submission.assessmentName,
    category: assessmentCategory(submission.assessmentType),
    date: "—",
    score: submission.score,
    status: submission.score === null ? "Belum dinilai" : "Selesai",
  }));
  return <>
    <ParentPageHeading title={"Detail Hasil Belajar: " + subject.name} description="Rincian nilai asesmen yang tersedia." action={{ href: "/orang-tua/hasil-belajar", label: "Kembali ke Hasil Belajar" }} />
    <div className="parent-stats-grid parent-detail-stats">
      <ParentStat label="NILAI AKHIR TERHITUNG" value={<>— <span>/ 100</span></>} note="—" tone="blue" />
      <ParentStat label="RATA-RATA TUGAS / LKPD" value={display(subject.task)} note="—" icon="clipboard-check" tone="purple" />
      <ParentStat label="RATA-RATA FORMATIF" value={display(subject.formative)} note="—" icon="clipboard-text" tone="amber" />
      <ParentStat label="NILAI UTS" value={display(subject.uts)} note="—" icon="document-text" tone="green" />
    </div>
    <div className="parent-detail-grid">
      <AssessmentTable rows={assessmentRows} />
      <aside className="parent-detail-aside">
        <ParentCard className="parent-breakdown-card">
          <div className="parent-section-title parent-divided-heading"><div><h2>Ringkasan Nilai Komponen</h2><p>—</p></div></div>
          <div className="parent-breakdown-list">{components.map((part) => <div className={"tone-" + part.tone} key={part.label}>
            <div className="parent-breakdown-label"><strong>{part.label}</strong><span>—</span></div>
            <ParentProgressBar value={part.score} label={"Nilai " + part.label} />
            <p>Rata-rata: {part.score.toFixed(1)}</p>
          </div>)}</div>
          <div className="parent-total-score"><span>NILAI AKHIR TERHITUNG</span><strong>— <small>/ 100</small></strong></div>
        </ParentCard>
      </aside>
    </div>
  </>;
}
