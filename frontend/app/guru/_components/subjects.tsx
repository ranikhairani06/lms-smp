"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Action, Badge, Button, Card, Chart, Dialog, Empty, Heading, Notice, Progress, Search, Stats, Table, Tabs } from "./ui";
import { subjects, subjectUrl, classUrl, exportCsv, type Subject } from "./data";
import { Solar } from "../../siswa/_components/icon";
import { useTeacherCourse, useTeacherResource } from "./useTeacherApi";
import { courseForSubject, displayDate, type TeacherAssessment, type TeacherCourse, type TeacherMaterial, type TeacherSection, type TeacherSubmission } from "./teacher-api";

const gradeRoman: Record<string, string> = { "7": "VII", "8": "VIII", "9": "IX" };

export function SubjectList() {
  const [search, setSearch] = useState(""); const [grade, setGrade] = useState("");
  const resource = useTeacherResource<TeacherCourse[]>("courses");
  const rows = (resource.data || []).flatMap(course => {
    const template = subjects.find(subject => courseForSubject([course], subject));
    return template ? [{ ...template, name: course.name, code: "—", description: course.description || "", classes: [], students: course.students_count ?? 0, sessions: null, progress: null, target: null }] : [];
  }).filter(subject => `${subject.name} ${subject.code}`.toLowerCase().includes(search.toLowerCase()) && (!grade || subject.id.endsWith(`-${grade}`)));
  const totalStudents = resource.data?.reduce((sum, course) => sum + (course.students_count ?? 0), 0);

  return <div className="tg-subject-list">
    <Heading hero title="Mata Pelajaran" description="Daftar mata pelajaran yang diampu pada Tahun Ajaran —" action={<Badge><Solar name="calendar" />Tahun Ajaran — {"\u2022"} Semester —</Badge>} />
    <Stats items={[
      { label: "TOTAL MAPEL DIAMPU", value: <><span className="tg-subject-stat-number">{resource.data?.length ?? "—"}</span><span className="tg-subject-stat-title">Mata Pelajaran Terdaftar</span></>, note: "", icon: "book-2" },
      { label: "TOTAL ROMBEL MENGAJAR", value: <><span className="tg-subject-stat-number">—</span><span className="tg-subject-stat-title">Kelas Aktif</span></>, note: "", icon: "users-group-rounded" },
      { label: "TOTAL SISWA AKTIF", value: <><span className="tg-subject-stat-number">{totalStudents ?? "—"}</span><span className="tg-subject-stat-title">Siswa Terdaftar</span></>, note: "", icon: "user" },
    ]} />
    <Card className="tg-subject-filters"><div className="tg-toolbar"><Search value={search} onChange={setSearch} placeholder="Cari nama mata pelajaran atau kode..." /><select aria-label="Filter kategori mata pelajaran" value={grade} onChange={event => setGrade(event.target.value)}><option value="">Semua Kategori</option>{[7, 8, 9].map(level => <option key={level} value={level}>Kelas {level}</option>)}</select></div></Card>
    <div className="tg-grid-2 tg-subject-cards">
      {rows.map(subject => <Card key={subject.id} className={`tg-subject-card ${subject.id === "matematika-7" ? "tg-subject-card-math" : ""}`}>
        <div className="tg-stack">
          <div className="tg-subject-intro">
            <Badge tone={subject.id === "matematika-7" ? "warning" : "primary"}>{subject.code}</Badge>
            <div className="tg-subject-title"><h3>{subject.name}</h3><p className="tg-small">{subject.description}</p></div>
          </div>
          <div className="tg-between tg-subject-classes">
            <div className="tg-inline tg-small"><span>Rombel:</span>{subject.classes.map(group => <Link className="tg-subject-group" key={group} href={classUrl(group)}><Badge>{group}</Badge></Link>)}</div>
            <Badge>{subject.students} Siswa Total</Badge>
          </div>
          <Progress value={subject.progress} label="Progres Materi Semester" emptyLabel="—" />
          <div className="tg-between tg-divider tg-subject-updated"><small><Solar name="clock-circle" />—</small><Action href={subjectUrl(subject.id)}>Buka Mata Pelajaran <Solar name="arrow-right" /></Action></div>
        </div>
      </Card>)}
    </div>
    {!rows.length && <Card><Empty text={resource.error || (resource.loading ? "Memuat data mata pelajaran..." : "Mata pelajaran tidak ditemukan")} reset={() => { setSearch(""); setGrade(""); void resource.reload(); }} /></Card>}
  </div>;
}
export function SubjectTabs({ subject, tab = "" }: { subject: Subject; tab?: string }) {
  const base = subjectUrl(subject.id);
  const items = [
    { label: "Ringkasan & Silabus", href: base },
    { label: "Daftar Materi", href: base + "/materi" },
    { label: "Daftar Tugas", href: base + "/asesmen?tugas" },
    { label: "Daftar Asesmen", href: base + "/asesmen" },
  ];
  const uniqueItems = items.filter((item, index, all) => all.findIndex(candidate => candidate.label === item.label) === index);
  return <Tabs active={base + tab} items={uniqueItems} className="tg-subject-tabs" />;
}
export function SubjectSummary({ subject, teacher }: { subject: Subject; teacher: string }) {
  const base = subjectUrl(subject.id); const courseState = useTeacherCourse(subject); const apiCourse = courseState.course; const courseSections = (apiCourse?.sections || []) as TeacherSection[]; const apiAssessments = courseSections.flatMap(section => section.assessments || []) as TeacherAssessment[]; const apiMaterials = courseSections.flatMap(section => section.materials || []) as TeacherMaterial[]; const latestMaterial = apiMaterials.at(-1); const [semester, setSemester] = useState("Ganjil"); const [cp, setCp] = useState(false); const [message, setMessage] = useState("");
  const titles = semester === "Ganjil" ? [
    { element: "Berpikir Komputasional", title: "Dekomposisi" },
    { element: "Teknologi Informasi & Komunikasi", title: "Aplikasi..." },
    { element: "Sistem Komputer", title: "Mekanisme..." },
    { element: "Jaringan Komputer & Internet", title: "Perangkat..." },
  ] : [
    { element: "Analisis Data", title: "Pengolahan Data" },
    { element: "Dampak Sosial Informatika", title: "Etika Digital" },
    { element: "Praktik Lintas Bidang", title: "Proyek Informatika" },
  ];
  return <div className="tg-subject-summary">
    <Heading title={`Detail Mata Pelajaran ${apiCourse?.name || "—"}`} action={<Button onClick={() => setCp(true)}>Kelola Capaian Pembelajaran (CP)</Button>} />
    <SubjectTabs subject={subject} />
    <Stats items={[
      { label: "Guru Pengampu", value: <span style={{ fontSize: "var(--text-l16-size)" }}>{teacher}</span>, note: "Guru mata pelajaran", icon: "user" },
      { label: "Rombel Terdaftar", value: "—", note: `${apiCourse?.students_count ?? "—"} Siswa Total`, icon: "users-group-rounded" },
      { label: "Ketuntasan KKTP", value: <>— <small>Poin</small></>, note: "", icon: "target" },
      { label: "Rata-rata Nilai", value: "—", note: "", icon: "chart-square" },
    ]} />
    {(courseState.error || message) && <Notice tone={courseState.error ? "error" : "info"}>{courseState.error || message}</Notice>}
    <div className="tg-columns">
      <Card title="Alur Tujuan Pembelajaran" action={<select aria-label="Semester silabus" value={semester} onChange={event => setSemester(event.target.value)}><option>Ganjil</option><option>Genap</option></select>}>
        <Table headers={["No", "Elemen CP", "Judul Materi", "Status", "Aksi"]}>
          {titles.map((item, index) => <tr key={item.element} className={index === 3 && semester === "Ganjil" ? "is-active" : ""}>
            <td>{String(index + 1).padStart(2, "0")}</td><td><strong>{item.element}</strong></td><td>{item.title}</td>
            <td><Badge tone={semester === "Genap" ? "muted" : index < 3 ? "success" : "primary"}>{semester === "Genap" ? "Belum" : index < 3 ? "Selesai" : "Berjalan"}</Badge></td>
            <td>{index === 3 && semester === "Ganjil" ? <Action href={`${base}/materi/bab-4/edit`}><Solar name="eye" />Buka Materi</Action> : <Link className="tg-link" href={`${base}/materi`}>Rincian <Solar name="arrow-right" /></Link>}</td>
          </tr>)}
        </Table>
        <div className="tg-divider tg-stack tg-summary-task">
          <div className="tg-between"><h3>Tugas & Asesmen Berjalan</h3><Link className="tg-link" href={`${base}/asesmen`}>Lihat Semua Tugas <Solar name="arrow-right" /></Link></div>
          <div className="tg-subcard tg-soft">
            <p className="tg-summary-deadline"><Solar name="clock-circle" />Hari ini, 23:59 WIB</p>
            <h3>{apiAssessments[0]?.title || "—"}</h3><p className="tg-small">{apiAssessments[0]?.description || "—"}</p>
            <div className="tg-summary-collection">
              <div className="tg-between tg-small"><span>Progres Pengumpulan</span><strong>— / — Siswa Terkumpul</strong></div>
              <div className="tg-track" role="progressbar" aria-label="Progres Pengumpulan" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100}><span style={{ width: "0%" }} /></div>
              <div className="tg-between tg-small"><span /><strong>—</strong></div>
            </div>
          </div>
          <Action href={`${base}/asesmen/tugas-01/pengumpulan`}><Solar name="clipboard-check" />Periksa Tugas</Action>
        </div>
      </Card>
      <aside className="tg-stack">
        <Card title="Distribusi Nilai & Ketuntasan" action={<Badge tone="success">Sangat Memuaskan</Badge>}>
          <strong className="tg-grade-total">— <small>/ 100 Rata-rata Gabungan</small></strong>
          <div className="tg-summary-chart-label tg-label">Distribusi Nilai Siswa</div><Chart values={[]} labels={[]} maxBarHeight={56} />
          <div className="tg-stack tg-divider tg-summary-groups"><h3>Rincian Rombongan Belajar</h3></div>
        </Card>
        <Card title="Modul Materi Terbaru" description="Aktivitas pembacaan bahan ajar siswa">
          <div className="tg-subcard tg-soft tg-summary-module">
            <span className="tg-summary-file-icon"><Solar name="file-text" /></span>
            <div className="tg-summary-module-copy">
              <h3>{latestMaterial?.title || "—"}</h3>
              <p className="tg-small">{latestMaterial ? `${displayDate(latestMaterial.created_at)} · ${latestMaterial.type}` : "—"}</p>
              <div className="tg-summary-module-actions">
                <span className="tg-summary-read-status"><Solar name="check-circle" /><span className="tg-summary-read-label">—</span></span>
                <Action href={`${base}/materi/bab-4/edit`} secondary>Lihat Modul <Solar name="arrow-right" /></Action>
              </div>
            </div>
          </div>
          <div className="tg-divider tg-summary-upload"><Action href={`${base}/materi/baru`} secondary><Solar name="pen-new-square" />Unggah Dokumen Bahan Ajar Tambahan</Action></div>
        </Card>
      </aside>
    </div>
    {cp && <Dialog title="Capaian Pembelajaran" onClose={() => setCp(false)}><form className="tg-stack tg-divider" onSubmit={event => { event.preventDefault(); const value = new FormData(event.currentTarget).get("cp"); try { sessionStorage.setItem(`teacher-cp-${subject.id}`, String(value)); setMessage("Capaian pembelajaran disimpan pada pratinjau sesi ini."); setCp(false); } catch { setMessage("Penyimpanan browser tidak tersedia."); } }}><label className="tg-field"><span>Tujuan Pembelajaran</span><textarea name="cp" required defaultValue={typeof window === "undefined" ? "" : sessionStorage.getItem(`teacher-cp-${subject.id}`) || "Peserta didik mampu merancang konfigurasi topologi jaringan lokal dan menjelaskan cara kerja jaringan komputer."} /></label><Button type="submit">Simpan Capaian</Button></form></Dialog>}
  </div>;
}
export function MaterialList({ subject }: { subject: Subject }) {
  const base = subjectUrl(subject.id); const courseState = useTeacherCourse(subject); const [search, setSearch] = useState(""); const [status, setStatus] = useState("");
  const list = ((courseState.course?.sections || []) as TeacherSection[]).flatMap(section => (section.materials || []) as TeacherMaterial[]).map(item => ({ id: String(item.id), title: item.title, description: "", progress: null as number | null, file: item.file_path || item.type, date: displayDate(item.created_at), status: "—" as string, content: item.body || "", files: item.file_path ? [item.file_path] : [] }));
  const availableGroups: string[] = [];
  const rows = list.filter(item => `${item.title} ${item.description}`.toLowerCase().includes(search.toLowerCase()) && (!status || item.status === status));
  const published = "—";
  const draft = list.find(item => item.status === "Draf");
  return <div className="tg-material-list">
    <Heading title={`Detail Mata Pelajaran ${courseState.course?.name || "—"}`} action={<Action href={`${base}/materi/baru`}><Solar name="book-2" />Tambah Modul Materi</Action>} />
    <SubjectTabs subject={subject} tab="/materi" />
    {draft && <section className="tg-material-alert" role="status">
      <span className="tg-material-alert-icon"><Solar name="clipboard-list" /></span>
      <div className="tg-material-alert-copy"><h3>Perhatian Guru: {draft.title} berstatus Draf Belum Terbit.</h3><p>Terbitkan sekarang agar materi dapat diakses tepat waktu.</p></div>
      <Action href={`${base}/materi/${draft.id}/edit`} secondary><span>Publikasikan Sekarang</span><Solar name="arrow-right" /></Action>
    </section>}
    <Stats variant="compact" items={[
      { label: "MODUL DITERBITKAN", value: <><span>{published}</span><small>Modul Diunggah</small></>, note: "", icon: "clipboard-check" },
      { label: "DRAF BELUM RILIS", value: <><span>—</span><small>Modul Disiapkan</small></>, note: "", icon: "calendar", warning: true },
      { label: "RATA-RATA KETERBACAAN", value: <><span>—</span><small>Tingkat Interaksi</small></>, note: "", icon: "users-group-rounded" },
    ]} />
    <Card className="tg-material-filter-card"><div className="tg-toolbar">
      <Search value={search} onChange={setSearch} placeholder="Cari nama mata pelajaran atau kode..." />
      <select aria-label="Filter status materi" value={status} onChange={event => setStatus(event.target.value)}><option value="">Semua Status</option><option>Diterbitkan</option><option>Draf</option></select>
      <Button tone="outline" onClick={() => exportCsv("daftar-materi", [["Judul", "Status", "Keterbacaan"], ...rows.map(row => [row.title, row.status, row.progress ?? "—"])])}>Ekspor CSV</Button>
    </div></Card>
    <Card className="tg-material-table-card" title="Daftar Materi Pokok & Modul Ajar" action={<div className="tg-material-semesters" aria-label="Semester">
      {/* TODO-DATA: semester belum terhubung dengan data materi. */}
      <span aria-current="true">Ganjil</span><span>Genap</span>
    </div>}>
      <Table label="Daftar materi dan modul ajar" headers={["Bab & Judul Modul", "Berkas Digital", "Sasaran Rombel", "Keterbacaan Siswa", "Aksi Guru"]}>
        {rows.map(item => <tr key={item.id} className={item.status === "Draf" ? "is-warning" : ""}>
          <td><strong>{item.title}</strong><small>{item.description}</small>{item.status === "Draf" && <Badge tone="warning">Siap Terbit</Badge>}</td>
          <td><strong>{item.file}</strong><small>{item.date}</small></td>
          <td><div className="tg-material-groups">{availableGroups.map(group => <span key={group}>{group}</span>)}</div></td>
          <td>{item.status === "Diterbitkan" ? <Progress value={item.progress} label="Dibaca" tone="success" emptyLabel="—" /> : <em className="tg-material-no-data">– Belum Ada Data –</em>}</td>
          <td><div className="tg-material-row-actions"><Action href={`${base}/materi/${item.id}/edit`} secondary>{item.status === "Draf" ? "Edit Konten" : "Edit"}</Action>{item.status === "Diterbitkan" && <span className="tg-material-check" aria-label="Telah diterbitkan"><Solar name="clipboard-check" /></span>}</div></td>
        </tr>)}
      </Table>
      {!rows.length && <Empty text={courseState.error || (courseState.loading ? "Memuat materi..." : undefined)} reset={() => { setSearch(""); setStatus(""); void courseState.reload(); }} />}
      <div className="tg-table-foot"><span>Menampilkan <strong>{rows.length}</strong> dari <strong>{list.length} Modul</strong></span><div className="tg-pages" aria-label="Halaman daftar materi">
        {/* TODO-DATA: kontrol halaman mengikuti tampilan Figma; pagination belum tersedia. */}
        <span aria-hidden="true">‹</span><span aria-current="page">1</span><span aria-hidden="true">›</span>
      </div></div>
    </Card>
  </div>;
}
export function AssessmentList({ subject }: { subject: Subject }) {
  const base = subjectUrl(subject.id); const courseState = useTeacherCourse(subject); const submissionsState = useTeacherResource<TeacherSubmission[]>("submissions"); const searchParams = useSearchParams(); const isTaskView = searchParams.get("tugas") !== null;
  const [search, setSearch] = useState(""); const [type, setType] = useState(""); const [status, setStatus] = useState("");
  const assessments = ((courseState.course?.sections || []) as TeacherSection[]).flatMap(section => (section.assessments || []) as TeacherAssessment[]);
  const assessmentList = assessments.map(item => ({ ...item, id: String(item.id), routeId: String(item.id), type: item.assessment_type, status: item.is_published ? "Diterbitkan" : "Draf" }));
  const taskList: typeof assessmentList = [];
  const list = isTaskView ? taskList : assessmentList;
  const rows = list.filter(item => item.title.toLowerCase().includes(search.toLowerCase()) && (!type || item.type === type) && (!status || item.status === status));
  const groupPending: { group: string; pending: number; students: number; missing: number; completed: number }[] = [];
  const assessmentMetrics = [
    { label: "Rata-Rata Nilai Sementara", value: "—", note: "", tone: "average" },
    { label: "Nilai Tertinggi Sementara", value: "—", note: "", tone: "highest" },
    { label: "Nilai Terendah Sementara", value: "—", note: "", tone: "lowest" },
    { label: "Perlu Tindak Lanjut", value: "—", note: "", tone: "follow-up" },
  ];
  return <div className="tg-assessment-list">
    <Heading title={isTaskView ? "Tugas Pembelajaran" : "Asesmen Pembelajaran"} action={<div className="tg-actions tg-assessment-heading-actions">{isTaskView && <Action href={classUrl(subject.classes[0]) + "/nilai"} secondary>Rekap Nilai</Action>}<Action href={`${base}/asesmen/baru?jenis=${isTaskView ? "tugas" : "kuis"}`}><Solar name="pen-new-square" />{isTaskView ? "Buat Tugas Baru" : "Buat Asesmen Baru"}</Action></div>} />
    <SubjectTabs subject={subject} tab={isTaskView ? "/asesmen?tugas" : "/asesmen"} />
    {!isTaskView && <div className="tg-assessment-overview">
      {/* TODO-DATA: ringkasan aktif dan terjadwal belum bersumber dari data backend. */}
      <Card className="tg-assessment-summary"><div className="tg-assessment-summary-label"><span className="tg-assessment-summary-icon"><Solar name="clipboard-list" /></span><span>TOTAL ASESMEN AKTIF</span></div><strong>{assessmentList.filter(item => item.is_published).length} Asesmen</strong></Card>
      <Card className="tg-assessment-summary"><div className="tg-assessment-summary-label"><span className="tg-assessment-summary-icon tg-assessment-summary-scheduled"><Solar name="calendar" /></span><span>ASESMEN TERJADWAL</span></div><strong>{assessmentList.filter(item => item.start_at).length} Asesmen</strong></Card>
    </div>}
    <Card className="tg-assessment-filter-card"><div className="tg-toolbar">
      <Search value={search} onChange={setSearch} placeholder={isTaskView ? "Cari judul tugas..." : "Cari judul asesmen..."} />
      <span className="tg-assessment-sort-label">Urutkan:</span>
      {/* TODO-DATA: pengurutan waktu belum tersedia; kontrol ditampilkan mengikuti desain. */}
      <select aria-label="Urutkan waktu" disabled><option>Semua Waktu</option></select>
      <select aria-label="Kategori asesmen" value={type} onChange={event => setType(event.target.value)}><option value="">Semua Kategori</option><option>Tugas</option><option>Kuis</option><option>Tugas & Kuis Campuran</option></select>
      <select className="tg-assessment-status-filter" aria-label="Status asesmen" value={status} onChange={event => setStatus(event.target.value)}><option value="">Semua Status</option><option>Belum dinilai</option><option>Berjalan</option><option>Telah Ditutup</option><option>Ditutup</option><option>Draf</option><option>Diterbitkan</option></select>
    </div></Card>
    {rows.map(item => {
      const routeId = item.routeId;
      const taskRecord = isTaskView;
      const itemSubmissions = (submissionsState.data || []).filter(submission => String(submission.assessment?.id) === String(item.id));
      const itemGraded = itemSubmissions.filter(submission => typeof submission.score === "number").length;
      const itemWaiting = itemSubmissions.length - itemGraded;
      const taskDistribution = [{ label: "Sudah Dinilai", count: itemGraded, tone: "graded" }, { label: "Menunggu Koreksi", count: itemWaiting, tone: "pending" }];
      const itemPercent = itemSubmissions.length ? Math.round(itemGraded / itemSubmissions.length * 100) : 0;
      return <Card key={item.id} className={`tg-assessment-card tg-assessment-record ${taskRecord ? "tg-task-record" : item.status === "Berjalan" ? "tg-quiz-state-running" : item.status === "Telah Ditutup" ? "tg-quiz-state-closed" : ""}`}>
        <div className="tg-assessment-record-content">
          <div className="tg-assessment-record-heading">
            <div className="tg-assessment-record-meta">{taskRecord ? <Badge tone="error"><Solar name="clipboard-check" />{item.status}</Badge> : <Badge tone={item.status === "Diterbitkan" ? "info" : "warning"}><Solar name="smartphone" />{item.status}</Badge>}<Badge tone="muted">Kelas — ({courseState.course?.students_count ?? "—"} siswa)</Badge></div>
            <div className={`tg-assessment-deadline ${taskRecord ? "" : "tg-assessment-finished"}`}><span>{taskRecord ? "Tenggat Pengumpulan" : "Selesai Pada"}</span><strong>{displayDate(item.end_at)}</strong></div>
          </div>
          <h2>{item.title}</h2>
          {taskRecord ? <>
            <div className="tg-assessment-progress-card">
              <div className="tg-assessment-progress-heading"><strong>Progres Pengoreksian Seluruh Rombel ({courseState.course?.students_count ?? "—"} Siswa)</strong><span>{itemSubmissions.length} pengumpulan dari — siswa</span></div>
              <div className="tg-assessment-segmented-progress" role="progressbar" aria-label="Progres pengumpulan dan koreksi" aria-valuenow={itemPercent} aria-valuemin={0} aria-valuemax={100}>{taskDistribution.map(part => <span key={part.tone} className={`tg-assessment-segment tg-${part.tone}`} style={{ flexGrow: part.count }} />)}</div>
              <div className="tg-assessment-legend">{taskDistribution.map(part => <span key={part.tone} className={`tg-assessment-legend-${part.tone}`}><strong>{part.count}</strong> {part.label} ({itemSubmissions.length ? Math.round(part.count / itemSubmissions.length * 100) : 0}%)</span>)}</div>
            </div>
            <div className="tg-assessment-groups">{groupPending.map(({ group, pending, students, missing, completed }, index) => <div className={`tg-assessment-group ${item.id === "tugas-01" && index === 0 || item.id === "kuis-01" && index === 1 ? "is-selected" : ""}`} key={group}><div><strong>Kelas {gradeRoman[group[0]] || group[0]}-{group.slice(1)}</strong><span>{students} Siswa • {missing ? `${missing} Belum Kumpul` : "100% Kumpul"}</span></div><div className="tg-assessment-group-status"><Badge tone="error">{pending} Tunggu</Badge><span className="tg-assessment-completed">{completed} Selesai</span></div></div>)}</div>
          </> : <div className="tg-quiz-metrics">{assessmentMetrics.map(metric => <div key={metric.label} className={`tg-quiz-metric tg-quiz-metric-${metric.tone}`}><strong>{metric.label}</strong><b>{metric.value}</b><span>{metric.note}</span></div>)}</div>}
          <div className="tg-assessment-record-actions">{taskRecord ? <><Action href={`${base}/asesmen/${routeId}/analisis`} secondary><Solar name="eye" />Lihat Hasil & Analisis</Action><Action href={`${base}/asesmen/${routeId}/pengumpulan`}><Solar name="clipboard-check" />Periksa Pengumpulan</Action></> : <Action href={`${base}/asesmen/${routeId}/analisis`} secondary><Solar name="eye" />Lihat Hasil & Analisis</Action>}</div>
        </div>
      </Card>;
    })}
    {!rows.length && <Card><Empty text={courseState.error || submissionsState.error || (courseState.loading || submissionsState.loading ? "Memuat asesmen..." : undefined)} reset={() => { setSearch(""); setType(""); setStatus(""); void courseState.reload(); void submissionsState.reload(); }} /></Card>}
    <Card className="tg-assessment-pagination"><span>Menampilkan <strong>{rows.length}</strong> dari <strong>{list.length}</strong> Asesmen Terdaftar</span><div className="tg-pages" aria-label="Halaman asesmen">
      {/* TODO-DATA: pagination belum tersedia; angka dan panah hanya mengikuti bentuk desain. */}
      <span className="is-disabled" aria-hidden="true">←</span><span aria-current="page">1</span><span>2</span><span>3</span><span aria-hidden="true">→</span>
    </div></Card>
  </div>;
}
