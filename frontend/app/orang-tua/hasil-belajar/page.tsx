import Link from "next/link";
import { Solar } from "../../siswa/_components/icon";
import { ParentCard, ParentPageHeading, ParentStat } from "../parent-components";
import { parentSubjectResults } from "./data";

export default function ParentResultsPage() {
  const attentionCount = parentSubjectResults.filter((subject) => subject.status !== "Tuntas").length;
  const average = (parentSubjectResults.reduce((total, subject) => total + subject.average, 0) / parentSubjectResults.length).toFixed(1);
  return (
    <>
      <ParentPageHeading title="Hasil Belajar Peserta Didik" description="Ringkasan evaluasi formatif, sumatif, dan rekapitulasi nilai akademik ananda Andi Pratama pada Semester Ganjil TA 2026/2027." />
      <div className="parent-stats-grid parent-results-stats">
        <ParentStat label="RATA-RATA NILAI AKHIR" value={average} description="Skala evaluasi 0 – 100" note="Rangkuman nilai semester ganjil" badge="Di atas KKTP" tone="blue" />
        <ParentStat label="KETUNTASAN CAPAIAN" value={<>{parentSubjectResults.length - attentionCount} <span>dari {parentSubjectResults.length}</span></>} description="Mata Pelajaran" note="Mata pelajaran telah melampaui standar kompetensi" icon="check-circle" tone="blue" />
        <ParentStat label="PERLU PENDAMPINGAN" value={`${attentionCount} Mapel`} description="Bahasa Indonesia perlu perhatian" note="Dukungan belajar mandiri di rumah" icon="users-group-rounded" tone="amber" emphasis />
        <ParentStat label="TOTAL BEBAN BELAJAR" value={<>{parentSubjectResults.length} <span>Mata Pelajaran</span></>} note="Seluruh mata pelajaran aktif semester ini" tone="purple" />
      </div>
      <ParentCard className="parent-results-card">
        <div className="parent-section-title parent-results-heading"><div><h2>Rekapitulasi Nilai Capaian Pembelajaran Siswa</h2><p>Daftar akumulasi nilai tugas, asesmen formatif, dan ujian tengah semester.</p></div></div>
        <div className="parent-table-wrap" tabIndex={0} role="region" aria-label="Rekapitulasi hasil belajar"><table className="parent-results-table">
          <thead><tr><th>No</th><th>Mata Pelajaran</th><th>Guru Pengampu</th><th>KKTP</th><th>Tugas</th><th>Formatif</th><th>UTS</th><th>Nilai Akhir</th><th>Status</th><th>Rincian</th></tr></thead>
          <tbody>{parentSubjectResults.map((subject, index) => <tr key={subject.slug}>
            <td>{String(index + 1).padStart(2, "0")}</td><td><strong>{subject.name}</strong></td><td>{subject.teacher}</td>
            <td>75</td><td>{subject.task}</td><td>{subject.formative}</td><td>{subject.uts}</td>
            <td><strong className={subject.average < 75 ? "is-low" : "is-score"}>{subject.average}</strong></td>
            <td><span className={`parent-status ${subject.status === "Tuntas" ? "is-done" : "is-attention"}`}>{subject.status}</span></td>
            <td><Link className="parent-detail-link" href={`/orang-tua/hasil-belajar/${subject.slug}`} aria-label={`Lihat detail nilai ${subject.name}`}>Lihat Rincian <Solar name="alt-arrow-right" /></Link></td>
          </tr>)}</tbody>
        </table></div>
        <div className="parent-table-footer"><span>Menampilkan {parentSubjectResults.length} mata pelajaran</span><span>Halaman <strong>1</strong> dari 1</span></div>
      </ParentCard>
      <div className="parent-info-banner"><Solar name="info-circle" /><div><strong>Catatan Evaluasi Orang Tua</strong><p>Bapak/Ibu wali murid disarankan berkoordinasi dengan wali kelas dan guru pengampu terkait mata pelajaran yang belum mencapai Kriteria Ketercapaian Tujuan Pembelajaran (KKTP).</p></div></div>
    </>
  );
}
