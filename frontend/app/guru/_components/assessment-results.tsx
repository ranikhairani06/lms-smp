"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { initials } from "@/lib/auth-types";
import { Action, Badge, Button, Card, Chart, Dialog, Empty, Heading, Notice, Progress, Search, Stats, Table } from "./ui";
import { exportCsv, students, subjectUrl, taskTitle, type Subject } from "./data";
import { useTeacherData } from "./store";
import { Solar } from "../../siswa/_components/icon";

const gradeKey = (subject: string, assessment: string, student: string) => `assessment:${subject}:${assessment}:${student}`;
export function Submissions({ subject, assessment }: { subject: Subject; assessment: string }) {
  const base = `${subjectUrl(subject.id)}/asesmen/${assessment}`; const { data } = useTeacherData(); const [search, setSearch] = useState(""); const [group, setGroup] = useState(""); const [remind, setRemind] = useState("");
  const rows = students.filter(student => `${student.name} ${student.id}`.toLowerCase().includes(search.toLowerCase()) && (!group || student.group === group));
  // TODO-DATA: nomor absen hanya contoh tampilan dari desain.
  const attendanceSamples: Record<string, string> = { "0098421001": "28", "0098421008": "04", "0098421015": "09", "0098421021": "12", "0098421025": "14", "0098421033": "16" };
  const score = (student: typeof students[number]) => { const saved = data.grades[gradeKey(subject.id, assessment, student.id)]; return saved ? saved.scores.reduce((sum, value) => sum + value, 0) : ["0098421008", "0098421021"].includes(student.id) ? student.scores[0] : "—"; };
  return <><Card className="tg-submission-header"><div className="tg-submission-header-copy"><Badge tone="warning"><Solar name="clock-circle" />Tenggat: 31 Okt 2026, 23:59 WIB</Badge><h1>{assessment === "tugas-01" ? "Pengumpulan Tugas 01: Analisis Topologi Jaringan Komputer & Skema LAN" : "Pengumpulan Tugas: Analisis Topologi Jaringan Komputer & Skema LAN"}</h1></div></Card><Stats variant="summary" items={[
    { label: "Total Pengumpulan", value: <><span>90</span><small>/ 98 Siswa</small></>, note: "Progres Kelas VIII", noteValue: "91.8%", icon: "book-2", tone: "primary", progress: 91.8 },
    { label: "Menunggu Koreksi", value: "38 Berkas", note: "5 berkas diunggah terlambat", noteIcon: "clock-circle", icon: "clipboard-list", tone: "warning" },
    { label: "Selesai Dinilai", value: "52 Siswa", note: "Rata-rata Nilai:", noteValue: "86.4 / 100", icon: "check-circle", tone: "success", progress: 86.4 },
    { label: "Belum Mengumpulkan", value: "8 Siswa", note: "", icon: "info-circle", tone: "error" },
  ]} /><Card><div className="tg-toolbar"><Search value={search} onChange={setSearch} /><select aria-label="Filter rombel pengumpulan" value={group} onChange={event => setGroup(event.target.value)}><option value="">Semua Rombel</option>{subject.classes.map(value => <option key={value}>{value}</option>)}</select></div></Card><Card className="tg-submission-table"><Table headers={["No", "NISN", "Nama Lengkap Siswa", "Rombel", "Waktu Pengumpulan", "Berkas Lampiran", "Nilai", "Aksi"]}>{rows.map((student, index) => <tr key={student.id} className={student.tasks === 0 ? "tg-submission-row-missing" : undefined}><td>{String(index + 1).padStart(2, "0")}</td><td>{student.id}</td><td><div className="tg-row"><span className="tg-avatar">{initials(student.name)}</span><div><strong>{student.name}</strong><small>Absen {attendanceSamples[student.id] ?? "—"}</small></div></div></td><td><Badge>{student.group}</Badge></td><td>{student.tasks === 0 ? "Belum Kumpul" : <><small>30 Okt 2026, 14:20 WIB</small><br /><Badge tone={student.id === "0098421015" ? "warning" : "success"}>{student.id === "0098421015" ? "Terlambat" : "Tepat Waktu"}</Badge></>}</td><td>{student.tasks === 0 ? "—" : <span className="tg-submission-file"><Solar name="pen-new-square" /><span>Topologi_{student.name.replaceAll(" ", "")}.pdf</span><small>(3.4 MB · contoh)</small></span>}</td><td className="tg-score">{typeof score(student) !== "number" ? <span className="tg-submission-score-empty">—</span> : <span className="tg-submission-score-value">{score(student)}</span>}</td><td>{student.tasks === 0 ? <Button className="tg-submission-remind" tone="outline" onClick={() => setRemind(student.name)}><Solar name="bell-bing" variant="bold" />Ingatkan</Button> : <Action href={`${base}/nilai/${student.id}`} secondary={typeof score(student) === "number"}><Solar name={typeof score(student) !== "number" ? "pen-new-square" : "eye"} />{typeof score(student) !== "number" ? "Nilai" : "Ubah Nilai"}</Action>}</td></tr>)}</Table>{!rows.length && <Empty />}{/* TODO-DATA: angka halaman contoh dari Figma; navigasi halaman belum tersedia di sumber data. */}<div className="tg-submission-footer"><span>Menampilkan <strong>{rows.length}</strong> dari <strong>{subject.students}</strong> Siswa (Halaman 1 dari {Math.ceil(subject.students / 6)})</span><div className="tg-submission-pages" aria-label="Pagination pratinjau"><span aria-disabled="true">&larr;</span><span aria-current="page">1</span><span>2</span><span>3</span><span aria-hidden="true">...</span><span>{Math.ceil(subject.students / 6)}</span><span>&rarr;</span></div></div></Card><div className="tg-submission-back"><Action href={`${subjectUrl(subject.id)}/asesmen`} secondary>&larr; Kembali ke Asesmen</Action></div>{remind && <Dialog title={`Pengingat untuk ${remind}`} onClose={() => setRemind("")}><div className="tg-stack tg-divider"><p>Halo {remind}, tugas Analisis Topologi Jaringan belum dikumpulkan. Silakan lengkapi tugas atau hubungi guru jika ada kendala.</p><Notice>Ini adalah pratinjau pesan. Belum ada pesan yang dikirim.</Notice><Button tone="outline" onClick={() => setRemind("")}>Tutup Pratinjau</Button></div></Dialog>}</>;
}
const rubric = [
  { title: "Analisis Topologi Star vs Bus", max: 40, criteria: ["Identifikasi switch sebagai sentral node", "Penjelasan isolasi kerusakan kabel node UTP", "Analisis latency & bandwidth bottleneck"] },
  { title: "Standar Pengkabelan TIA/EIA 568B Straight", max: 40, criteria: ["Urutan 8 pinout kabel sesuai standar", "Logika pemancar / penerima UTP RJ45", "Diagram konektor crimping"] },
  { title: "Simulasi Packet Tracer & Pengujian Ping", max: 20, criteria: ["Screenshot output Packet Tracer CLI", "Uji coba ICMP echo request antar subnet"] },
];
export function Grading({ subject, assessment, studentId }: { subject: Subject; assessment: string; studentId: string }) {
  const { data, save } = useTeacherData(); const router = useRouter(); const key = gradeKey(subject.id, assessment, studentId); const student = students.find(item => item.id === studentId)!;
  const [modified, setModified] = useState<{ scores: number[]; feedback: string } | null>(null); const form = modified || data.grades[key] || { scores: [32, 30, 16], feedback: "" };
  const [message, setMessage] = useState(""); const [documentPage, setDocumentPage] = useState(1); const [zoom, setZoom] = useState(100); const [highlight, setHighlight] = useState(false);
  const total = form.scores.reduce((sum, value) => sum + value, 0); const base = `${subjectUrl(subject.id)}/asesmen/${assessment}`;
  const changeScore = (index: number, score: number) => { setModified({ ...form, scores: form.scores.map((value, i) => i === index ? Math.min(rubric[i].max, Math.max(0, score)) : value) }); setMessage(""); };
  const saveGrade = (next: boolean) => { try { save({ grades: { ...data.grades, [key]: form } }); setMessage("Nilai dan umpan balik disimpan pada pratinjau browser ini."); if (next) { const nextStudent = students.slice(students.indexOf(student) + 1).find(item => item.tasks > 0); router.push(nextStudent ? `${base}/nilai/${nextStudent.id}` : `${base}/pengumpulan`); } } catch { setMessage("Nilai belum tersimpan. Periksa penyimpanan browser."); } };
  const groupRoman = student.group.startsWith("8") ? "VIII" : student.group.startsWith("7") ? "VII" : "IX";
  const groupStudents = students.filter(item => item.group === student.group);
  const groupSize = student.group === subject.classes[0] ? 34 : 32;
  const groupPosition = Math.max(1, groupStudents.indexOf(student) + 1);
  const pageTitles = ["Perbandingan Topologi Star vs Bus pada Skema Lab Komputer Sekolah", rubric[1].title, rubric[2].title];
  const pageText = [
    "Pada laboratorium komputer sekolah kami, topologi Star adalah arsitektur paling andal karena menggunakan perangkat switch terkelola sebagai konsentrator sentral. Jika salah satu kabel UTP klien (misalnya PC-03) putus atau mengalami gangguan, node workstation lain tetap terhubung dan tidak melumpuhkan seluruh segmen jaringan. Hal ini berbeda dengan topologi Bus yang menggunakan kabel koaksial tunggal tanpa switch.",
    "Urutan kabel straight mengikuti standar T568B: putih-oranye, oranye, putih-hijau, biru, putih-biru, hijau, putih-cokelat, cokelat. Kedua ujung kabel menggunakan urutan yang sama.",
    "Pengujian dilakukan menggunakan perintah ping antara komputer klien dan server. Hasil pengujian menunjukkan seluruh perangkat dalam satu subnet dapat terhubung."
  ];
  // TODO-DATA: kriteria dan tanda terpilih mengikuti contoh visual Figma; skor yang tersimpan tetap per soal.
  const manualCriteria = [
    [],
    [
      { label: "Kegagalan kabel workstation tidak melumpuhkan seluruh jaringan", points: 15 },
      { label: "Peran sentral Switch/Hub dalam manajemen lalu lintas", points: 15 },
      { label: "Perbandingan terminator pada bus", points: 10 }
    ],
    [
      { label: "Topologi hybrid sesuai (1 Server, 1 Switch, 4-6 PC)", points: 10 },
      { label: "Konfigurasi IP benar (Subnet & Gateway)", points: 6 },
      { label: "Nama dan nomor absen tercantum pada gambar", points: 4 }
    ]
  ];
  return <div className="tg-grading-page">
    <div className="tg-grading-heading">
      <Heading hero title={taskTitle} description="Penilaian Jawaban Siswa secara Manual Grading" action={<Badge><Solar name="users-group-rounded" />Rombel {student.group}<small>{groupSize} Siswa</small></Badge>} />
    </div>
    <div className="tg-grading-layout">
      <main className="tg-grading-left">
        <Card className="tg-grading-file">
          {/* TODO-DATA: metadata dan status berkas meniru contoh Figma; belum berasal dari unggahan siswa. */}
          <div className="tg-grading-file-info">
            <span className="tg-grading-file-icon">PDF</span>
            <div><strong>Topologi__{student.name.replaceAll(" ", "")}__{student.group}.pdf</strong><Badge tone="success">Tepat Waktu</Badge><small>3,4 MB · Diunggah 29 Okt 2026, 14:20 WIB</small></div>
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
            <Badge>Lembar Kerja Peserta Didik — Informatika</Badge>
            <h2>Studi Kasus Analisis & Implementasi Topologi Star</h2>
            <p className="tg-small">Nama: {student.name} · NISN: {student.id} · Kelas: {groupRoman}-{student.group.slice(-1)}</p>
            <h3>{documentPage}. {pageTitles[documentPage - 1]}</h3>
            <div className="tg-grading-answer">
              <p style={{ fontSize: `calc(var(--text-p12-size) * ${zoom / 100})`, lineHeight: `calc(var(--text-p12-line) * ${zoom / 100})`, background: highlight ? "var(--lms-secondary-soft)" : undefined }}>
                {documentPage === 1 && <span>Pada laboratorium komputer sekolah kami, topologi Star adalah arsitektur paling andal karena menggunakan perangkat switch terkelola sebagai konsentrator sentral.</span>}
                {documentPage === 1 && " "}{documentPage === 1 ? pageText[0].replace("Pada laboratorium komputer sekolah kami, topologi Star adalah arsitektur paling andal karena menggunakan perangkat switch terkelola sebagai konsentrator sentral. ", "") : pageText[documentPage - 1]}
              </p>
            </div>
            {/* TODO-DATA: garis jawaban adalah placeholder visual dokumen contoh. */}
            <div className="tg-grading-answer-lines" aria-hidden="true"><span /><span /><span /><span /><span /></div>
          </article>
          <div className="tg-grading-pagination">
            <Button tone="outline" disabled={documentPage === 1} aria-label="Halaman jawaban sebelumnya" onClick={() => setDocumentPage(documentPage - 1)}>‹</Button>
            <span>Halaman <strong>{documentPage}</strong> dari 3</span>
            <Button tone="outline" disabled={documentPage === 3} aria-label="Halaman jawaban berikutnya" onClick={() => setDocumentPage(documentPage + 1)}>›</Button>
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
            <div><span className="tg-label">AKUMULASI NILAI AKHIR</span><div className="tg-grade-total">{total} <small>/ 100 Poin</small></div></div>
            <div className="tg-grading-summary-status"><Badge tone={total >= 75 ? "success" : "warning"}><Solar name="check-circle" />{total >= 75 ? "Tuntas KKTP" : "Perlu Bimbingan"}</Badge><small>{total >= 75 ? "+" + (total - 75) + " poin di atas KKTP (75)" : "KKTP 75"}</small></div>
          </div>
          <div className="tg-grading-scale" role="progressbar" aria-label="Akumulasi nilai akhir" aria-valuenow={total} aria-valuemin={0} aria-valuemax={100}>
            <span className="tg-grading-scale-value" style={{ width: Math.min(100, Math.max(0, total)) + "%" }} />
            <span className="tg-grading-kktp-marker"><Badge>KKTP 75</Badge></span>
          </div>
          <div className="tg-grading-scale-labels"><span>0</span><span>25</span><span>50</span><span>100</span></div>
        </Card>
        {rubric.map((item, index) => <Card className="tg-grading-question" key={item.title}>
          <div className="tg-grading-question-heading">
            <div className="tg-grading-question-title">
              <Badge>SOAL {String(index + 1).padStart(2, "0")}</Badge>
              <div><h2>{index === 0 ? "Pilihan Ganda" : index === 1 ? "Uraian: Topologi Star vs Bus" : "Unggah Berkas: Skema Topologi Hybrid"}</h2><small>{index === 0 ? "Dinilai otomatis oleh sistem" : "Bobot Soal: " + item.max + " Poin"}</small></div>
            </div>
            <strong className="tg-grading-question-score">{form.scores[index]} <small>/ {item.max} Poin</small></strong>
          </div>
          {index === 0 ? <div className="tg-grading-auto-row"><span aria-hidden="true">▣</span><span>Dinilai otomatis oleh sistem</span><strong>{form.scores[index]} / {item.max}</strong><span className="tg-grading-static-action">Lihat Jawaban</span></div> : <>
            <div className="tg-grading-criteria">
              {manualCriteria[index].map((criterion, criterionIndex) => <div className={"tg-grading-criterion " + (criterionIndex < 2 ? "is-earned" : "")} key={criterion.label}>
                <span className="tg-grading-check" aria-hidden="true">{criterionIndex < 2 ? "✓" : ""}</span>
                <span>{criterion.label}</span><strong>+{criterion.points}</strong>
              </div>)}
            </div>
            <div className="tg-grading-question-footer">
              <span>Subtotal: <strong>{form.scores[index]} / {item.max} Poin</strong></span>
              <span className="tg-grading-static-action">Atur poin manual</span>
            </div>
          </>}
          <div className="tg-grading-score-controls" aria-label={"Kontrol skor soal " + (index + 1)}>
            <Button tone="outline" aria-label={"Kurangi nilai soal " + (index + 1)} disabled={form.scores[index] === 0} onClick={() => changeScore(index, form.scores[index] - 1)}>−</Button>
            <input className="tg-grade-input" type="number" min={0} max={item.max} aria-label={"Skor soal " + (index + 1)} value={form.scores[index]} onChange={event => changeScore(index, Number(event.target.value))} />
            <Button tone="outline" aria-label={"Tambah nilai soal " + (index + 1)} disabled={form.scores[index] === item.max} onClick={() => changeScore(index, form.scores[index] + 1)}>+</Button>
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
  const { data } = useTeacherData(); const [search, setSearch] = useState(""); const [status, setStatus] = useState(""); const [publication, setPublication] = useState(false);
  const base = `${subjectUrl(subject.id)}/asesmen/${assessment}`;
  const allRows = students.map((student, index) => ({ ...student, score: data.grades[gradeKey(subject.id, assessment, student.id)]?.scores.reduce((sum, score) => sum + score, 0) ?? [98, 92, 86, 82, 76, 64][index] }));
  const rows = allRows.filter(row => `${row.name} ${row.id}`.toLowerCase().includes(search.toLowerCase()) && (!status || (status === "remedial" ? row.score < 75 : status === "excellent" ? row.score >= 90 : row.score >= 75)));
  return <><Heading hero title={`Analisis Hasil Asesmen ${assessment === "kuis-01" ? "Kuis 01" : "Tugas 01"}`} description={taskTitle} action={<Badge tone="warning">KKTP: 75</Badge>} /><Stats items={[{ label: "Rata-rata Nilai Kelas", value: "82.4 / 100", note: "Tercatat 34 pengumpulan" }, { label: "Ketuntasan KKTP", value: "88.2%", note: "30 dari 34 siswa tuntas" }, { label: "Rentang Nilai", value: "98 / 58", note: "Nilai maksimum / minimum" }, { label: "Perlu Intervensi", value: "4 Siswa", note: "Butuh bimbingan terarah", warning: true }]} /><div className="tg-columns"><Card title="Distribusi Interval Nilai Siswa"><Chart values={[1, 3, 8, 14, 8]} labels={["0–59", "60–69", "70–79", "80–89", "90–100"]} /><div className="tg-inline tg-divider"><span className="tg-small">Pintasan Analisis:</span><Button tone="outline" onClick={() => setStatus("remedial")}>Di Bawah KKTP</Button><Button tone="outline" onClick={() => setStatus("excellent")}>Kelompok Unggul (≥ 90)</Button></div></Card><Card title="Diagnostik Butir Soal" description="Persentase pemenuhan capaian rubrik"><div className="tg-stack">{rubric.map((item, index) => <div className="tg-subcard tg-soft" key={item.title}><Progress value={[92, 81, 67][index]} label={`${index + 1}. ${item.title}`} tone={index === 2 ? "warning" : "success"} /><small>{index === 2 ? "11 siswa mengalami kesulitan" : "Capaian kompetensi terpenuhi"}</small></div>)}</div></Card></div><Card><div className="tg-toolbar"><Badge>Kelas {subject.classes.join(", ")}</Badge><select aria-label="Filter KKTP analisis" value={status} onChange={event => setStatus(event.target.value)}><option value="">Status KKTP: Semua</option><option value="passed">Tuntas</option><option value="remedial">Belum Tuntas</option><option value="excellent">Unggul (≥ 90)</option></select><Search value={search} onChange={setSearch} /></div><div className="tg-divider"><Table headers={["No", "NISN", "Nama Siswa", "Kelas", "Nilai Akhir", "Predikat", "Keterangan KKTP", "Aksi"]}>{rows.map((row, index) => <tr key={row.id} className={row.score < 75 ? "is-warning" : ""}><td>{index + 1}</td><td>{row.id}</td><td><strong>{row.name}</strong></td><td>{row.group}</td><td className="tg-score">{row.score}</td><td><Badge>{row.score >= 90 ? "A" : row.score >= 80 ? "B" : row.score >= 75 ? "C" : "D"}</Badge></td><td><Badge tone={row.score >= 75 ? "success" : "error"}>{row.score >= 75 ? "Tuntas" : "Belum Tuntas (Remedial)"}</Badge></td><td><Action href={`${base}/nilai/${row.id}`} secondary>Lembar Jawaban</Action></td></tr>)}</Table>{!rows.length && <Empty />}</div><p className="tg-small tg-divider">Menampilkan {rows.length} siswa contoh</p></Card><div className="tg-form-actions"><Action href={subjectUrl(subject.id) + "/asesmen"} secondary>← Kembali ke Asesmen</Action><div className="tg-actions"><Button tone="outline" onClick={() => exportCsv("analisis-nilai", [["NISN", "Nama", "Kelas", "Nilai"], ...rows.map(row => [row.id, row.name, row.group, row.score])])}>Unduh Rekap Nilai CSV</Button><Button onClick={() => setPublication(true)}>Pratinjau Publikasi Nilai</Button></div></div>{publication && <Dialog title="Pratinjau Publikasi Nilai" onClose={() => setPublication(false)}><div className="tg-stack tg-divider"><p>Rekap siap ditinjau untuk {allRows.length} siswa contoh.</p><Notice>Nilai pratinjau belum dikirim ke siswa atau orang tua.</Notice><Button onClick={() => setPublication(false)}>Selesai Meninjau</Button></div></Dialog>}</>;
}
