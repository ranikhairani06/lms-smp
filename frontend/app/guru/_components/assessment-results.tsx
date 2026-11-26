"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { initials } from "@/lib/auth-types";
import { Action, Badge, Button, Card, Chart, Dialog, Empty, Heading, Notice, Progress, Search, Stats, Table } from "./ui";
import { exportCsv, subjectUrl, type Subject } from "./data";
import { Solar } from "../../siswa/_components/icon";
import { useTeacherResource, useTeacherMutation } from "./useTeacherApi";
import { displayDate, fieldErrorMessage, submissionClassName, submissionStudentName, submissionStudentNumber, type TeacherSubmission } from "./teacher-api";

function submissionAttachment(): string | undefined { return undefined; }

export function Submissions({ subject, assessment }: { subject: Subject; assessment: string }) {
  const base = `${subjectUrl(subject.id)}/asesmen/${assessment}`; const resource = useTeacherResource<TeacherSubmission[]>("submissions"); const [search, setSearch] = useState(""); const [group, setGroup] = useState(""); const [remind, setRemind] = useState("");
  const submissions = (resource.data || []).filter(item => String(item.assessment?.id) === assessment);
  const availableGroups = [...new Set(submissions.map(submissionClassName).filter(Boolean))];
  const rows = submissions.map(item => ({ submission: item, id: submissionStudentNumber(item), name: submissionStudentName(item), group: submissionClassName(item) || "—", tasks: 1, scores: [], progress: 0, activity: "—" })).filter(student => `${student.name} ${student.id}`.toLowerCase().includes(search.toLowerCase()) && (!group || student.group === group));
  const gradedCount = submissions.filter(item => typeof item.score === "number").length;
  const waitingCount = submissions.length - gradedCount;
  // TODO-DATA: nomor absen hanya contoh tampilan dari desain.
  const score = (student: typeof rows[number]) => typeof student.submission.score === "number" ? student.submission.score : "—";
  return <><Card className="tg-submission-header"><div className="tg-submission-header-copy"><Badge tone="warning"><Solar name="clock-circle" />Tenggat: {displayDate(submissions[0]?.assessment?.end_at)}</Badge><h1>{submissions[0]?.assessment?.title || "Pengumpulan"}</h1></div></Card><Stats variant="summary" items={[
    { label: "Total Pengumpulan", value: <><span>{submissions.length}</span><small>/ — Siswa</small></>, note: "", icon: "book-2", tone: "primary" },
    { label: "Menunggu Koreksi", value: `${waitingCount} Berkas`, note: "", icon: "clipboard-list", tone: "warning" },
    { label: "Selesai Dinilai", value: `${gradedCount} Siswa`, note: "", icon: "check-circle", tone: "success" },
    { label: "Belum Mengumpulkan", value: "—", note: "", icon: "info-circle", tone: "error" },
  ]} /><Card><div className="tg-toolbar"><Search value={search} onChange={setSearch} /><select aria-label="Filter rombel pengumpulan" value={group} onChange={event => setGroup(event.target.value)}><option value="">Semua Rombel</option>{availableGroups.map(value => <option key={value}>{value}</option>)}</select></div></Card><Card className="tg-submission-table"><Table headers={["No", "NISN", "Nama Lengkap Siswa", "Rombel", "Waktu Pengumpulan", "Berkas Lampiran", "Nilai", "Aksi"]}>{rows.map((student, index) => <tr key={student.submission.id} className={student.tasks === 0 ? "tg-submission-row-missing" : undefined}><td>{String(index + 1).padStart(2, "0")}</td><td>{student.id}</td><td><div className="tg-row"><span className="tg-avatar">{initials(student.name)}</span><div><strong>{student.name}</strong><small>Absen —</small></div></div></td><td><Badge>{student.group}</Badge></td><td><><small>{displayDate(student.submission.created_at)}</small><br /><Badge tone="success">Terkumpul</Badge></></td><td>—</td><td className="tg-score">{typeof score(student) !== "number" ? <span className="tg-submission-score-empty">—</span> : <span className="tg-submission-score-value">{score(student)}</span>}</td><td><Action href={`${base}/nilai/${student.submission.id}`} secondary={typeof score(student) === "number"}><Solar name={typeof score(student) !== "number" ? "pen-new-square" : "eye"} />{typeof score(student) !== "number" ? "Nilai" : "Ubah Nilai"}</Action></td></tr>)}</Table>{!rows.length && <Empty text={resource.error || (resource.loading ? "Memuat pengumpulan..." : "Tidak ada pengumpulan yang sesuai.")} reset={() => { setSearch(""); setGroup(""); void resource.reload(); }} />}<div className="tg-submission-footer"><span>Menampilkan <strong>{rows.length}</strong> dari <strong>—</strong> Siswa</span><div className="tg-submission-pages" aria-label="Pagination pratinjau"><span aria-disabled="true">&larr;</span><span aria-current="page">1</span><span aria-hidden="true">&rarr;</span></div></div></Card><div className="tg-submission-back"><Action href={`${subjectUrl(subject.id)}/asesmen`} secondary>&larr; Kembali ke Asesmen</Action></div>{remind && <Dialog title={`Pengingat untuk ${remind}`} onClose={() => setRemind("")}><div className="tg-stack tg-divider"><p>Halo {remind}, tugas belum dikumpulkan. Silakan lengkapi tugas atau hubungi guru jika ada kendala.</p><Notice>Ini adalah pratinjau pesan. Belum ada pesan yang dikirim.</Notice><Button tone="outline" onClick={() => setRemind("")}>Tutup Pratinjau</Button></div></Dialog>}</>;
}
export function Grading({ subject, assessment, studentId }: { subject: Subject; assessment: string; studentId: string }) {
  const router = useRouter(); const resource = useTeacherResource<TeacherSubmission[]>("submissions"); const submission = resource.data?.find(item => String(item.id) === studentId && String(item.assessment?.id) === assessment);
  const gradeMutation = useTeacherMutation("POST", `submissions/${studentId}/grade`, async () => { await resource.reload(); }, async () => { await resource.reload(); });
  const student = { id: submission ? submissionStudentNumber(submission) : "—", name: submission ? submissionStudentName(submission) : "—", group: submission ? submissionClassName(submission) || "—" : "—", scores: [], progress: 0, tasks: 0, activity: "—" };
  const scoreItems = (submission?.assessment?.questions || []).map(question => ({ title: question.prompt, max: question.points, criteria: [] as string[], type: question.type }));
  const [modified, setModified] = useState<{ scores: number[]; feedback: string } | null>(null); const form = modified || { scores: [], feedback: submission?.feedback || "" };
  const [message, setMessage] = useState(""); const [documentPage, setDocumentPage] = useState(1); const [zoom, setZoom] = useState(100); const [highlight, setHighlight] = useState(false);
  const total = modified ? form.scores.reduce((sum, value) => sum + value, 0) : submission?.score ?? 0; const totalPoints = scoreItems.reduce((sum, question) => sum + question.max, 0); const base = `${subjectUrl(subject.id)}/asesmen/${assessment}`;
  const changeScore = (index: number, score: number) => { const scores = [...form.scores]; scores[index] = Math.min(scoreItems[index]?.max ?? 100, Math.max(0, score)); setModified({ ...form, scores }); setMessage(""); };
  const saveGrade = async (next: boolean) => {
    if (!submission) { setMessage(resource.error || "Pengumpulan tidak ditemukan."); return; }
    const score = modified ? total : submission.score;
    if (modified && form.scores.length !== scoreItems.length) { setMessage("Lengkapi skor untuk setiap soal sebelum menyimpan."); return; }
    if (!totalPoints) { setMessage("Total poin soal tidak tersedia. Nilai belum dapat disimpan."); return; }
    if (typeof score !== "number" || score < 0 || score > 100 || score > totalPoints) { setMessage("Nilai harus antara 0–100 dan tidak boleh melebihi total poin soal."); return; }
    const result = await gradeMutation.run({ score, ...(form.feedback ? { feedback: form.feedback } : {}) });
    if (!result) { setMessage(fieldErrorMessage(gradeMutation.fieldErrors) || gradeMutation.error || "Nilai belum dapat disimpan."); return; }
    setMessage("Nilai berhasil disimpan.");
    if (next) {
      const nextSubmission = (resource.data || []).find(item => String(item.assessment?.id) === assessment && item.id !== submission.id && typeof item.score !== "number");
      router.push(nextSubmission ? `${base}/nilai/${nextSubmission.id}` : `${base}/pengumpulan`);
    }
  };
  const groupRoman = student.group.startsWith("8") ? "VIII" : student.group.startsWith("7") ? "VII" : student.group.startsWith("9") ? "IX" : "—";
  const groupSize = "—";
  const groupPosition = "—";
  const pageTitles = scoreItems.map(item => item.title);
  const pageText: string[] = [];
  const pageCount = Math.max(1, pageText.length);
  const passingScore = submission?.assessment?.passing_score;
  const attachedFile = submissionAttachment();
  const manualCriteria = scoreItems.map(() => [] as { label: string; points: number }[]);
  return <div className="tg-grading-page">
    <div className="tg-grading-heading">
      <Heading hero title={submission?.assessment?.title || "Penilaian Jawaban Siswa"} description="Penilaian Jawaban Siswa secara Manual Grading" action={<Badge><Solar name="users-group-rounded" />Rombel {student.group}<small>{groupSize} Siswa</small></Badge>} />
    </div>
    <div className="tg-grading-layout">
      <main className="tg-grading-left">
        <Card className="tg-grading-file">
          {/* TODO-DATA: metadata dan status berkas meniru contoh Figma; belum berasal dari unggahan siswa. */}
          <div className="tg-grading-file-info">
            <span className="tg-grading-file-icon">{attachedFile?.split(".").at(-1)?.toUpperCase() || "—"}</span>
            <div><strong>{attachedFile || "—"}</strong><Badge tone="success">{submission ? "Terkumpul" : "—"}</Badge><small>{displayDate(submission?.created_at)}</small></div>
          </div>
          <div className="tg-grading-file-actions">
            {/* TODO-DATA: file pada pratinjau belum memiliki URL unduhan atau kontrol layar penuh. */}
            <Button tone="outline" aria-label="Unduh berkas" disabled><Solar name="download-minimalistic" /></Button>
            <Button tone="outline" aria-label="Buka layar penuh" disabled><Solar name="maximize" /></Button>
          </div>
        </Card>
        <Card className="tg-grading-document-card">
          <div className="tg-grading-viewer-tools">
            <Button tone="outline" aria-pressed={highlight} onClick={() => setHighlight(!highlight)}>Sorot Jawaban</Button>
            <div className="tg-inline">
              <Button tone="outline" aria-label="Perkecil dokumen" disabled={zoom <= 80} onClick={() => setZoom(zoom - 10)}>−</Button>
              <span className="tg-small">{zoom}%</span>
              <Button tone="outline" aria-label="Perbesar dokumen" disabled={zoom >= 140} onClick={() => setZoom(zoom + 10)}>+</Button>
            </div>
          </div>
          <article className="tg-grading-paper">
            <Badge>Lembar Kerja Peserta Didik</Badge>
            <h2>{submission?.assessment?.title || "—"}</h2>
            <p className="tg-small">Nama: {student.name} · NISN: {student.id} · Kelas: {groupRoman}-{student.group.slice(-1)}</p>
            <h3>{documentPage}. {pageTitles[documentPage - 1] || "—"}</h3>
            <div className="tg-grading-answer">
              <p style={{ fontSize: `calc(var(--text-p12-size) * ${zoom / 100})`, lineHeight: `calc(var(--text-p12-line) * ${zoom / 100})`, background: highlight ? "var(--lms-secondary-soft)" : undefined }}>
                {pageText[documentPage - 1] || "—"}
              </p>
            </div>
            {/* TODO-DATA: garis jawaban adalah placeholder visual dokumen contoh. */}
            <div className="tg-grading-answer-lines" aria-hidden="true"><span /><span /><span /><span /><span /></div>
          </article>
          <div className="tg-grading-pagination">
            <Button tone="outline" disabled={documentPage === 1} aria-label="Halaman jawaban sebelumnya" onClick={() => setDocumentPage(documentPage - 1)}>‹</Button>
            <span>Halaman <strong>{documentPage}</strong> dari {pageCount}</span>
            <Button tone="outline" disabled={documentPage === pageCount} aria-label="Halaman jawaban berikutnya" onClick={() => setDocumentPage(documentPage + 1)}>›</Button>
          </div>
        </Card>
      </main>
      <aside className="tg-grading-right">
        <Card className="tg-grading-student">
          <span className="tg-avatar">{initials(student.name)}</span>
          <div><h2>{student.name}</h2><p className="tg-small">Kelas {groupRoman}-{student.group.slice(-1)}</p><p className="tg-small">NISN {student.id}</p></div>
          <Badge>Siswa {groupPosition} dari {groupSize}</Badge>
        </Card>
        <Card className="tg-grading-summary">
          <div className="tg-grading-summary-head">
            <div><span className="tg-label">AKUMULASI NILAI AKHIR</span><div className="tg-grade-total">{submission?.score ?? (modified ? total : "—")} <small>/ 100 Poin</small></div></div>
            <div className="tg-grading-summary-status"><Badge tone={typeof passingScore === "number" && total >= passingScore ? "success" : "warning"}><Solar name="check-circle" />{typeof passingScore !== "number" ? "—" : total >= passingScore ? "Tuntas KKTP" : "Perlu Bimbingan"}</Badge><small>{typeof passingScore === "number" ? `KKTP ${passingScore}` : "KKTP —"}</small></div>
          </div>
          <div className="tg-grading-scale" role="progressbar" aria-label="Akumulasi nilai akhir" aria-valuenow={total} aria-valuemin={0} aria-valuemax={100}>
            <span className="tg-grading-scale-value" style={{ width: Math.min(100, Math.max(0, total)) + "%" }} />
            <span className="tg-grading-kktp-marker"><Badge>KKTP 75</Badge></span>
          </div>
          <div className="tg-grading-scale-labels"><span>0</span><span>25</span><span>50</span><span>100</span></div>
        </Card>
        {scoreItems.map((item, index) => <Card className="tg-grading-question" key={item.title}>
          <div className="tg-grading-question-heading">
            <div className="tg-grading-question-title">
              <Badge>SOAL {String(index + 1).padStart(2, "0")}</Badge>
              <div><h2>{item.type}</h2><small>Bobot Soal: {item.max} Poin</small></div>
            </div>
            <strong className="tg-grading-question-score">{form.scores[index] ?? "—"} <small>/ {item.max} Poin</small></strong>
          </div>
          {false ? <div className="tg-grading-auto-row"><span aria-hidden="true">▣</span><span>Dinilai otomatis oleh sistem</span><strong>{form.scores[index] ?? "—"} / {item.max}</strong><span className="tg-grading-static-action">Lihat Jawaban</span></div> : <>
            <div className="tg-grading-criteria">
              {manualCriteria[index].map((criterion, criterionIndex) => <div className={"tg-grading-criterion " + (criterionIndex < 2 ? "is-earned" : "")} key={criterion.label}>
                <span className="tg-grading-check" aria-hidden="true">{criterionIndex < 2 ? "✓" : ""}</span>
                <span>{criterion.label}</span><strong>+{criterion.points}</strong>
              </div>)}
            </div>
            <div className="tg-grading-question-footer">
              <span>Subtotal: <strong>{form.scores[index] ?? "—"} / {item.max} Poin</strong></span>
              <span className="tg-grading-static-action">Atur poin manual</span>
            </div>
          </>}
          <div className="tg-grading-score-controls" aria-label={"Kontrol skor soal " + (index + 1)}>
            <Button tone="outline" aria-label={"Kurangi nilai soal " + (index + 1)} disabled={(form.scores[index] ?? 0) === 0} onClick={() => changeScore(index, (form.scores[index] ?? 0) - 1)}>−</Button>
            <input className="tg-grade-input" type="number" min={0} max={item.max} aria-label={"Skor soal " + (index + 1)} value={form.scores[index] ?? ""} onChange={event => changeScore(index, Number(event.target.value))} />
            <Button tone="outline" aria-label={"Tambah nilai soal " + (index + 1)} disabled={(form.scores[index] ?? 0) === item.max} onClick={() => changeScore(index, (form.scores[index] ?? 0) + 1)}>+</Button>
          </div>
        </Card>)}
        <Card className="tg-grading-feedback">
          <div className="tg-grading-feedback-heading"><strong>Catatan untuk Siswa</strong><span>{form.feedback.length} / 300 karakter</span></div>
          <textarea id="teacher-feedback" value={form.feedback} onChange={event => { setModified({ ...form, feedback: event.target.value }); setMessage(""); }} placeholder="Tuliskan catatan penilaian atau arahan perbaikan untuk siswa..." />
        </Card>
        {/* TODO-DATA: keterangan publikasi meniru catatan pada desain Figma. */}
        <div className="tg-grading-note"><Notice>Nilai tampil di dashboard siswa dan orang tua setelah disimpan. Draf tidak terlihat oleh siswa.</Notice></div>
        {message && <div role="status"><Notice>{message}</Notice></div>}
      </aside>
    </div>
    <div className="tg-grading-footer">
      <Action href={base + "/pengumpulan"} secondary>← Kembali</Action>
      <div className="tg-grading-student-nav">
        <Button tone="outline" aria-label="Siswa sebelumnya" disabled>‹</Button>
        <span>Siswa: <strong>{groupPosition} dari {groupSize}</strong> · <strong>{student.name}</strong></span>
        <Button tone="outline" aria-label="Siswa berikutnya" disabled>›</Button>
      </div>
      <div className="tg-actions"><Button tone="outline" onClick={() => saveGrade(false)}>Simpan Draf</Button><Button onClick={() => saveGrade(true)}>Simpan & Lanjut Siswa Berikutnya</Button></div>
    </div>
  </div>;
}
export function AssessmentAnalysis({ subject, assessment }: { subject: Subject; assessment: string }) {
  const resource = useTeacherResource<TeacherSubmission[]>("submissions"); const [search, setSearch] = useState(""); const [status, setStatus] = useState(""); const [publication, setPublication] = useState(false);
  const base = `${subjectUrl(subject.id)}/asesmen/${assessment}`;
  const submissions = (resource.data || []).filter(item => String(item.assessment?.id) === assessment);
  const allRows = submissions.map(item => ({ submission: item, id: submissionStudentNumber(item), name: submissionStudentName(item), group: submissionClassName(item) || "—", score: typeof item.score === "number" ? item.score : null }));
  const scores = allRows.map(row => row.score).filter((score): score is number => score !== null);
  const passingScore = submissions[0]?.assessment?.passing_score;
  const rows = allRows.filter(row => `${row.name} ${row.id}`.toLowerCase().includes(search.toLowerCase()) && (!status || (typeof passingScore === "number" && (status === "remedial" ? (row.score ?? -1) < passingScore : status === "excellent" ? (row.score ?? -1) >= 90 : (row.score ?? -1) >= passingScore))));
  const average = scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : null;
  const histogram = [0, 0, 0, 0, 0]; scores.forEach(score => { const index = score < 60 ? 0 : score < 70 ? 1 : score < 80 ? 2 : score < 90 ? 3 : 4; histogram[index] += 1; });
  const assessmentTitle = submissions[0]?.assessment?.title || "Analisis Hasil Asesmen";
  return <><Heading hero title={`Analisis Hasil Asesmen ${assessmentTitle}`} description={assessmentTitle} action={<Badge tone="warning">KKTP: {typeof passingScore === "number" ? passingScore : "—"}</Badge>} /><Stats items={[{ label: "Rata-rata Nilai Kelas", value: average === null ? "—" : `${average.toFixed(1)} / 100`, note: `Tercatat ${scores.length} nilai` }, { label: "Ketuntasan KKTP", value: typeof passingScore === "number" && scores.length ? `${(scores.filter(score => score >= passingScore).length / scores.length * 100).toFixed(1)}%` : "—", note: typeof passingScore === "number" ? `${scores.filter(score => score >= passingScore).length} dari ${scores.length} siswa tuntas` : "" }, { label: "Rentang Nilai", value: scores.length ? `${Math.max(...scores)} / ${Math.min(...scores)}` : "—", note: "Nilai maksimum / minimum" }, { label: "Perlu Intervensi", value: typeof passingScore === "number" ? `${scores.filter(score => score < passingScore).length} Siswa` : "—", note: "", warning: true }]} /><div className="tg-columns"><Card title="Distribusi Interval Nilai Siswa"><Chart values={scores.length ? histogram : []} labels={["0–59", "60–69", "70–79", "80–89", "90–100"]} /><div className="tg-inline tg-divider"><span className="tg-small">Pintasan Analisis:</span><Button tone="outline" onClick={() => setStatus("remedial")}>Di Bawah KKTP</Button><Button tone="outline" onClick={() => setStatus("excellent")}>Kelompok Unggul (≥ 90)</Button></div></Card><Card title="Diagnostik Butir Soal" description="Persentase pemenuhan capaian rubrik"><div className="tg-stack">{(submissions[0]?.assessment?.questions || []).map((item, index) => <div className="tg-subcard tg-soft" key={item.id}><Progress value={null} label={`${index + 1}. ${item.prompt}`} tone="success" emptyLabel="—" /><small>—</small></div>)}</div></Card></div><Card><div className="tg-toolbar"><Badge>Kelas —</Badge><select aria-label="Filter KKTP analisis" value={status} onChange={event => setStatus(event.target.value)}><option value="">Status KKTP: Semua</option><option value="passed">Tuntas</option><option value="remedial">Belum Tuntas</option><option value="excellent">Unggul (≥ 90)</option></select><Search value={search} onChange={setSearch} /></div><div className="tg-divider"><Table headers={["No", "NISN", "Nama Siswa", "Kelas", "Nilai Akhir", "Predikat", "Keterangan KKTP", "Aksi"]}>{rows.map((row, index) => <tr key={row.submission.id} className={row.score !== null && typeof passingScore === "number" && row.score < passingScore ? "is-warning" : ""}><td>{index + 1}</td><td>{row.id}</td><td><strong>{row.name}</strong></td><td>{row.group}</td><td className="tg-score">{row.score ?? "—"}</td><td><Badge>{"—"}</Badge></td><td><Badge tone={row.score !== null && typeof passingScore === "number" && row.score >= passingScore ? "success" : "error"}>{row.score === null || typeof passingScore !== "number" ? "—" : row.score >= passingScore ? "Tuntas" : "Belum Tuntas (Remedial)"}</Badge></td><td><Action href={`${base}/nilai/${row.submission.id}`} secondary>Lembar Jawaban</Action></td></tr>)}</Table>{!rows.length && <Empty text={resource.error || (resource.loading ? "Memuat analisis..." : undefined)} reset={() => { setSearch(""); setStatus(""); void resource.reload(); }} />}</div><p className="tg-small tg-divider">Menampilkan {rows.length} pengumpulan</p></Card><div className="tg-form-actions"><Action href={subjectUrl(subject.id) + "/asesmen"} secondary>← Kembali ke Asesmen</Action><div className="tg-actions"><Button tone="outline" onClick={() => exportCsv("analisis-nilai", [["NISN", "Nama", "Kelas", "Nilai"], ...rows.map(row => [row.id, row.name, row.group, row.score ?? "—"])])}>Unduh Rekap Nilai CSV</Button><Button onClick={() => setPublication(true)}>Pratinjau Publikasi Nilai</Button></div></div>{publication && <Dialog title="Pratinjau Publikasi Nilai" onClose={() => setPublication(false)}><div className="tg-stack tg-divider"><p>Rekap siap ditinjau untuk {allRows.length} pengumpulan.</p><Notice>Nilai pratinjau belum dikirim ke siswa atau orang tua.</Notice><Button onClick={() => setPublication(false)}>Selesai Meninjau</Button></div></Dialog>}</>;
}
