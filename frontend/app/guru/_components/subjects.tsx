"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Action, Badge, Button, Card, Chart, Dialog, Empty, Heading, Notice, Progress, Search, Stats, Table, Tabs } from "./ui";
import { subjects, materials, subjectUrl, classUrl, exportCsv, taskTitle, type Subject } from "./data";
import { assessmentKindOf, useTeacherData } from "./store";
import { Solar } from "../../siswa/_components/icon";

export function SubjectList() {
  const [search, setSearch] = useState(""); const [grade, setGrade] = useState("");
  const rows = subjects.filter(subject => `${subject.name} ${subject.code}`.toLowerCase().includes(search.toLowerCase()) && (!grade || subject.classes.some(group => group.startsWith(grade))));
  const updatedLabels: Record<string, string> = {
    // TODO-DATA: waktu pembaruan mengikuti contoh pada desain Figma.
    "informatika-8": "Diperbarui 2 jam lalu",
    "informatika-7": "Diperbarui kemarin",
    "informatika-9": "Diperbarui 3 hari lalu",
    "matematika-7": "Diperbarui hari ini",
  };

  return <div className="tg-subject-list">
    <Heading hero title="Mata Pelajaran" description="Daftar mata pelajaran yang diampu pada Tahun Ajaran 2026/2027" action={<Badge><Solar name="calendar" />Tahun Ajaran 2026/2027 {"\u2022"} Semester Ganjil</Badge>} />
    <Stats items={[
      { label: "TOTAL MAPEL DIAMPU", value: <><span className="tg-subject-stat-number">2</span><span className="tg-subject-stat-title">Mata Pelajaran Terdaftar</span></>, note: "Informatika & Matematika", icon: "book-2" },
      { label: "TOTAL ROMBEL MENGAJAR", value: <><span className="tg-subject-stat-number">8</span><span className="tg-subject-stat-title">Kelas Aktif</span></>, note: "Kelas 7A\u20137C, 8A\u20138C, 9A\u20139B", icon: "users-group-rounded" },
      { label: "TOTAL SISWA AKTIF", value: <><span className="tg-subject-stat-number">268</span><span className="tg-subject-stat-title">Siswa Terdaftar</span></>, note: "Terdaftar di Semester Ganjil", icon: "user" },
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
          <Progress value={subject.progress} label="Progres Materi Semester" />
          <div className="tg-between tg-divider tg-subject-updated"><small><Solar name="clock-circle" />{updatedLabels[subject.id]}</small><Action href={subjectUrl(subject.id)}>Buka Mata Pelajaran <Solar name="arrow-right" /></Action></div>
        </div>
      </Card>)}
    </div>
    {!rows.length && <Card><Empty text="Mata pelajaran tidak ditemukan" reset={() => { setSearch(""); setGrade(""); }} /></Card>}
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
  const base = subjectUrl(subject.id); const [semester, setSemester] = useState("Ganjil"); const [cp, setCp] = useState(false); const [message, setMessage] = useState("");
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
    <Heading title={`Detail Mata Pelajaran ${subject.name}`} action={<Button onClick={() => setCp(true)}>Kelola Capaian Pembelajaran (CP)</Button>} />
    <SubjectTabs subject={subject} />
    <Stats items={[
      { label: "Guru Pengampu", value: <span style={{ fontSize: "var(--text-l16-size)" }}>{teacher}</span>, note: "Guru mata pelajaran", icon: "user" },
      { label: "Rombel Terdaftar", value: subject.classes.join(", "), note: `${subject.students} Siswa Total`, icon: "users-group-rounded" },
      { label: "Ketuntasan KKTP", value: <>{subject.target.toFixed(1)} <small>Poin</small></>, note: "Kriteria Minimal Fase D", icon: "target" },
      { label: "Rata-rata Nilai", value: "86.4", note: <><span className="tg-summary-trend">+3.2%</span> Tinggi dari Semester Lalu</>, icon: "chart-square" },
    ]} />
    {message && <Notice>{message}</Notice>}
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
            <h3>{taskTitle}</h3><p className="tg-small">Desain konfigurasi simulasi Star-Bus dengan DHCP Server.</p>
            <div className="tg-summary-collection">
              <div className="tg-between tg-small"><span>Progres Pengumpulan</span><strong>90 / 98 Siswa Terkumpul</strong></div>
              <div className="tg-track" role="progressbar" aria-label="Progres Pengumpulan" aria-valuenow={90} aria-valuemin={0} aria-valuemax={100}><span style={{ width: "90%" }} /></div>
              <div className="tg-between tg-small"><span /><strong>90%</strong></div>
            </div>
          </div>
          <Action href={`${base}/asesmen/tugas-01/pengumpulan`}><Solar name="clipboard-check" />Periksa Tugas</Action>
        </div>
      </Card>
      <aside className="tg-stack">
        <Card title="Distribusi Nilai & Ketuntasan" action={<Badge tone="success">Sangat Memuaskan</Badge>}>
          <strong className="tg-grade-total">86.4 <small>/ 100 Rata-rata Gabungan</small></strong>
          <div className="tg-summary-chart-label tg-label">Distribusi Nilai Siswa</div><Chart maxBarHeight={56} />
          <div className="tg-stack tg-divider tg-summary-groups"><h3>Rincian Rombongan Belajar</h3>{subject.classes.map((group, index) => <Progress key={group} value={[86.4, 84.1, 85.7][index] || 85} label={group} />)}</div>
        </Card>
        <Card title="Modul Materi Terbaru" description="Aktivitas pembacaan bahan ajar siswa">
          <div className="tg-subcard tg-soft tg-summary-module">
            <span className="tg-summary-file-icon"><Solar name="file-text" /></span>
            <div className="tg-summary-module-copy">
              <h3>Modul 04: Perangkat Keras Jaringan & Subnetting</h3>
              <p className="tg-small">18 Okt 2026 • PDF (4.2 MB)</p>
              <div className="tg-summary-module-actions">
                <span className="tg-summary-read-status"><Solar name="check-circle" /><span className="tg-summary-read-label">94% siswa telah membaca</span></span>
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
  const base = subjectUrl(subject.id); const { data } = useTeacherData(); const [search, setSearch] = useState(""); const [status, setStatus] = useState("");
  const saved = data.materials.filter(item => item.subject === subject.id);
  const list = [...materials.map(item => ({ ...item, ...saved.find(savedItem => savedItem.id === item.id) })), ...saved.filter(item => !materials.some(original => original.id === item.id)).map(item => ({ ...item, progress: 0, file: item.files.join(", ") || "Konten teks", date: "Draf lokal" }))];
  const rows = list.filter(item => `${item.title} ${item.description}`.toLowerCase().includes(search.toLowerCase()) && (!status || item.status === status));
  const published = list.filter(item => item.status === "Diterbitkan").length;
  const draft = list.find(item => item.status === "Draf");
  return <div className="tg-material-list">
    <Heading title={`Detail Mata Pelajaran ${subject.name}`} action={<Action href={`${base}/materi/baru`}><Solar name="book-2" />Tambah Modul Materi</Action>} />
    <SubjectTabs subject={subject} tab="/materi" />
    {draft && <section className="tg-material-alert" role="status">
      <span className="tg-material-alert-icon"><Solar name="clipboard-list" /></span>
      <div className="tg-material-alert-copy"><h3>Perhatian Guru: {draft.title} berstatus Draf Belum Terbit.</h3><p>Terbitkan sekarang agar materi dapat diakses tepat waktu.</p></div>
      <Action href={`${base}/materi/${draft.id}/edit`} secondary><span>Publikasikan Sekarang</span><Solar name="arrow-right" /></Action>
    </section>}
    <Stats variant="compact" items={[
      { label: "MODUL DITERBITKAN", value: <><span>{published}</span><small>Modul Diunggah</small></>, note: "", icon: "clipboard-check" },
      { label: "DRAF BELUM RILIS", value: <><span>{list.length - published}</span><small>Modul Disiapkan</small></>, note: <>Bab 5 siap rilis, Bab 6 dalam penulisan</>, icon: "calendar", warning: true },
      { label: "RATA-RATA KETERBACAAN", value: <><span>91%</span><small>Tingkat Interaksi</small></>, note: "Berdasarkan log unduhan & pembacaan siswa", icon: "users-group-rounded" },
    ]} />
    <Card className="tg-material-filter-card"><div className="tg-toolbar">
      <Search value={search} onChange={setSearch} placeholder="Cari nama mata pelajaran atau kode..." />
      <select aria-label="Filter status materi" value={status} onChange={event => setStatus(event.target.value)}><option value="">Semua Status</option><option>Diterbitkan</option><option>Draf</option></select>
      <Button tone="outline" onClick={() => exportCsv("daftar-materi", [["Judul", "Status", "Keterbacaan"], ...rows.map(row => [row.title, row.status, row.progress])])}>Ekspor CSV</Button>
    </div></Card>
    <Card className="tg-material-table-card" title="Daftar Materi Pokok & Modul Ajar" action={<div className="tg-material-semesters" aria-label="Semester">
      {/* TODO-DATA: semester belum terhubung dengan data materi. */}
      <span aria-current="true">Ganjil</span><span>Genap</span>
    </div>}>
      <Table label="Daftar materi dan modul ajar" headers={["Bab & Judul Modul", "Berkas Digital", "Sasaran Rombel", "Keterbacaan Siswa", "Aksi Guru"]}>
        {rows.map(item => <tr key={item.id} className={item.status === "Draf" ? "is-warning" : ""}>
          <td><strong>{item.title}</strong><small>{item.description}</small>{item.status === "Draf" && <Badge tone="warning">Siap Terbit</Badge>}</td>
          <td><strong>{item.file}</strong><small>{item.date}</small></td>
          <td><div className="tg-material-groups">{subject.classes.map(group => <span key={group}>{group}</span>)}</div></td>
          <td>{item.status === "Diterbitkan" ? <Progress value={item.progress} label="Dibaca" tone="success" /> : <em className="tg-material-no-data">– Belum Ada Data –</em>}</td>
          <td><div className="tg-material-row-actions"><Action href={`${base}/materi/${item.id}/edit`} secondary>{item.status === "Draf" ? "Edit Konten" : "Edit"}</Action>{item.status === "Diterbitkan" && <span className="tg-material-check" aria-label="Telah diterbitkan"><Solar name="clipboard-check" /></span>}</div></td>
        </tr>)}
      </Table>
      {!rows.length && <Empty />}
      <div className="tg-table-foot"><span>Menampilkan <strong>{rows.length}</strong> dari <strong>{list.length} Modul</strong></span><div className="tg-pages" aria-label="Halaman daftar materi">
        {/* TODO-DATA: kontrol halaman mengikuti tampilan Figma; pagination belum tersedia. */}
        <span aria-hidden="true">‹</span><span aria-current="page">1</span><span aria-hidden="true">›</span>
      </div></div>
    </Card>
  </div>;
}
export function AssessmentList({ subject }: { subject: Subject }) {
  const base = subjectUrl(subject.id); const { data } = useTeacherData(); const searchParams = useSearchParams(); const isTaskView = searchParams.get("tugas") !== null;
  const [search, setSearch] = useState(""); const [type, setType] = useState(""); const [status, setStatus] = useState("");
  const taskList = [{ id: "tugas-01", title: taskTitle, type: "Tugas", status: "Belum dinilai" }, { id: "kuis-01", title: "Tugas 02: Analisis Komputer", type: "Tugas", status: "Belum dinilai" }, ...data.assessments.filter(item => item.subject === subject.id && assessmentKindOf(item) === "tugas")];
  // TODO-DATA: status dan statistik asesmen pada desain merupakan data pratinjau, bukan data backend.
  const assessmentTitle = "Kuis 01: Logika Komputasional, Algoritma Dasar & Dekomposisi Masalah";
  const assessmentList = [
    { id: "kuis-01-berjalan", routeId: "kuis-01", title: assessmentTitle, type: "Kuis", status: "Berjalan" },
    { id: "kuis-01-ditutup", routeId: "kuis-01", title: assessmentTitle, type: "Kuis", status: "Telah Ditutup" },
    ...data.assessments.filter(item => item.subject === subject.id && assessmentKindOf(item) === "kuis").map(item => ({ ...item, routeId: item.id })),
  ];
  const list = isTaskView ? taskList : assessmentList;
  const rows = list.filter(item => item.title.toLowerCase().includes(search.toLowerCase()) && (!type || item.type === type) && (!status || item.status === status));
  // TODO-DATA: rincian progres tugas ini mengikuti angka pratinjau yang sudah ditampilkan sebelumnya.
  const taskDistribution = [{ label: "Sudah Dinilai", count: 52, tone: "graded" }, { label: "Menunggu Koreksi", count: 38, tone: "pending" }, { label: "Belum Mengumpulkan", count: 8, tone: "missing" }];
  // TODO-DATA: rincian rombel tugas ini adalah contoh Figma dan belum berasal dari backend.
  const groupPending = subject.classes.map((group, index) => ({ group, pending: [18, 12, 8][index] || 8, students: [34, 32, 32][index] || 32, missing: [0, 2, 6][index] || 0, completed: [16, 18, 18][index] || 18 }));
  const gradeRoman: Record<string, string> = { "7": "VII", "8": "VIII", "9": "IX" };
  const assessmentMetrics = [
    { label: "Rata-Rata Nilai Sementara", value: "84.6", note: "≥ KKTP 75.0 (Tuntas)", tone: "average" },
    { label: "Nilai Tertinggi Sementara", value: "100", note: "Dicapai 12 Siswa", tone: "highest" },
    { label: "Nilai Terendah Sementara", value: "68.0", note: "Batas Remedial", tone: "lowest" },
    { label: "Perlu Tindak Lanjut", value: "4 Siswa", note: "Belum Mencapai KKTP", tone: "follow-up" },
  ];
  return <div className="tg-assessment-list">
    <Heading title={isTaskView ? "Tugas Pembelajaran" : "Asesmen Pembelajaran"} action={<div className="tg-actions tg-assessment-heading-actions">{isTaskView && <Action href={classUrl(subject.classes[0]) + "/nilai"} secondary>Rekap Nilai</Action>}<Action href={`${base}/asesmen/baru?jenis=${isTaskView ? "tugas" : "kuis"}`}><Solar name="pen-new-square" />{isTaskView ? "Buat Tugas Baru" : "Buat Asesmen Baru"}</Action></div>} />
    <SubjectTabs subject={subject} tab={isTaskView ? "/asesmen?tugas" : "/asesmen"} />
    {!isTaskView && <div className="tg-assessment-overview">
      {/* TODO-DATA: ringkasan aktif dan terjadwal belum bersumber dari data backend. */}
      <Card className="tg-assessment-summary"><div className="tg-assessment-summary-label"><span className="tg-assessment-summary-icon"><Solar name="clipboard-list" /></span><span>TOTAL ASESMEN AKTIF</span></div><strong>1 Asesmen Berjalan</strong></Card>
      <Card className="tg-assessment-summary"><div className="tg-assessment-summary-label"><span className="tg-assessment-summary-icon tg-assessment-summary-scheduled"><Solar name="calendar" /></span><span>ASESMEN TERJADWAL</span></div><strong>1 Asesmen</strong></Card>
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
      const routeId = "routeId" in item ? item.routeId : item.id;
      const taskRecord = isTaskView && ["tugas-01", "kuis-01"].includes(item.id);
      return <Card key={item.id} className={`tg-assessment-card tg-assessment-record ${taskRecord ? "tg-task-record" : item.status === "Berjalan" ? "tg-quiz-state-running" : item.status === "Telah Ditutup" ? "tg-quiz-state-closed" : ""}`}>
        <div className="tg-assessment-record-content">
          <div className="tg-assessment-record-heading">
            <div className="tg-assessment-record-meta">{taskRecord ? <Badge tone="error"><Solar name="clipboard-check" />{item.status}</Badge> : <Badge tone={item.status === "Berjalan" ? "info" : "warning"}><Solar name="smartphone" />{item.status}</Badge>}<Badge tone="muted">Kelas {subject.classes.join(", ")} ({subject.students} siswa)</Badge></div>
            <div className={`tg-assessment-deadline ${taskRecord ? "" : "tg-assessment-finished"}`}><span>{taskRecord ? "Tenggat Pengumpulan" : "Selesai Pada"}</span><strong>{taskRecord ? "31 Okt 2026 • 23:59 WIB" : "24 Okt 2026 • 10:30 WIB"}</strong></div>
          </div>
          <h2>{item.title}</h2>
          {taskRecord ? <>
            <div className="tg-assessment-progress-card">
              <div className="tg-assessment-progress-heading"><strong>Progres Pengoreksian Seluruh Rombel ({subject.students} Siswa)</strong><span>90 dari {subject.students} Sudah Mengumpulkan (92%)</span></div>
              <div className="tg-assessment-segmented-progress" role="progressbar" aria-label="Progres pengumpulan dan koreksi" aria-valuenow={92} aria-valuemin={0} aria-valuemax={100}>{taskDistribution.map(part => <span key={part.tone} className={`tg-assessment-segment tg-${part.tone}`} style={{ flexGrow: part.count }} />)}</div>
              <div className="tg-assessment-legend">{taskDistribution.map(part => <span key={part.tone} className={`tg-assessment-legend-${part.tone}`}><strong>{part.count}</strong> {part.label} ({Math.round(part.count / subject.students * 100)}%)</span>)}</div>
            </div>
            <div className="tg-assessment-groups">{groupPending.map(({ group, pending, students, missing, completed }, index) => <div className={`tg-assessment-group ${item.id === "tugas-01" && index === 0 || item.id === "kuis-01" && index === 1 ? "is-selected" : ""}`} key={group}><div><strong>Kelas {gradeRoman[group[0]] || group[0]}-{group.slice(1)}</strong><span>{students} Siswa • {missing ? `${missing} Belum Kumpul` : "100% Kumpul"}</span></div><div className="tg-assessment-group-status"><Badge tone="error">{pending} Tunggu</Badge><span className="tg-assessment-completed">{completed} Selesai</span></div></div>)}</div>
          </> : <div className="tg-quiz-metrics">{assessmentMetrics.map(metric => <div key={metric.label} className={`tg-quiz-metric tg-quiz-metric-${metric.tone}`}><strong>{metric.label}</strong><b>{metric.value}</b><span>{metric.note}</span></div>)}</div>}
          <div className="tg-assessment-record-actions">{taskRecord ? <><Action href={`${base}/asesmen/${routeId}/analisis`} secondary><Solar name="eye" />Lihat Hasil & Analisis</Action><Action href={`${base}/asesmen/${routeId}/pengumpulan`}><Solar name="clipboard-check" />Periksa Pengumpulan</Action></> : <Action href={`${base}/asesmen/${routeId}/analisis`} secondary><Solar name="eye" />Lihat Hasil & Analisis</Action>}</div>
        </div>
      </Card>;
    })}
    {!rows.length && <Card><Empty /></Card>}
    <Card className="tg-assessment-pagination"><span>Menampilkan <strong>{rows.length}</strong> dari <strong>{list.length}</strong> Asesmen Terdaftar</span><div className="tg-pages" aria-label="Halaman asesmen">
      {/* TODO-DATA: pagination belum tersedia; angka dan panah hanya mengikuti bentuk desain. */}
      <span className="is-disabled" aria-hidden="true">←</span><span aria-current="page">1</span><span>2</span><span>3</span><span aria-hidden="true">→</span>
    </div></Card>
  </div>;
}
