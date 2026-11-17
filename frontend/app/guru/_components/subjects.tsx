"use client";
import Link from "next/link";
import { useState } from "react";
import { Action, Badge, Button, Card, Chart, Dialog, Empty, Heading, Notice, Progress, Search, Stats, Table, Tabs } from "./ui";
import { subjects, materials, subjectUrl, classUrl, exportCsv, taskTitle, type Subject } from "./data";
import { useTeacherData } from "./store";
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
  return <Tabs active={base + tab} items={uniqueItems} />;
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
  return <><Heading title={`Detail Mata Pelajaran ${subject.name}`} action={<Action href={`${base}/materi/baru`}>+ Tambah Modul Materi</Action>} /><SubjectTabs subject={subject} tab="/materi" />{list.some(item => item.id === "bab-5" && item.status === "Draf") && <Notice tone="warning"><div className="tg-between"><div><h3>Bab 5: Pengantar Logika Percabangan berstatus Draf.</h3><p>Periksa isi dan sasaran rombel sebelum menerbitkan materi.</p></div><Action href={`${base}/materi/bab-5/edit`} secondary>Periksa & Publikasikan</Action></div></Notice>}<Stats items={[{ label: "Modul Diterbitkan", value: published, note: "Aktif dipelajari siswa", icon: "clipboard-check" }, { label: "Draf Belum Rilis", value: list.length - published, note: "Modul sedang disiapkan", warning: true }, { label: "Rata-rata Keterbacaan", value: "91%", note: "Tingkat interaksi siswa" }]} /><Card><div className="tg-toolbar"><Search value={search} onChange={setSearch} placeholder="Cari judul materi, bab, atau kata kunci..." /><select aria-label="Filter status materi" value={status} onChange={event => setStatus(event.target.value)}><option value="">Semua Status</option><option>Diterbitkan</option><option>Draf</option></select><Button tone="outline" onClick={() => exportCsv("daftar-materi", [["Judul", "Status", "Keterbacaan"], ...rows.map(row => [row.title, row.status, row.progress])])}>Ekspor CSV</Button></div><div className="tg-divider"><Table headers={["Bab & Judul Modul", "Berkas Digital", "Sasaran Rombel", "Keterbacaan", "Status", "Aksi Guru"]}>{rows.map(item => <tr key={item.id} className={item.status === "Draf" ? "is-warning" : ""}><td><strong>{item.title}</strong><small>{item.description}</small></td><td>{item.file}<br /><small>{item.date}</small></td><td>{subject.classes.join(", ")}</td><td>{item.status === "Diterbitkan" ? <Progress value={item.progress} label="Dibaca" tone="success" /> : "Belum ada data"}</td><td><Badge tone={item.status === "Draf" ? "warning" : "success"}>{item.status}</Badge></td><td><Action href={`${base}/materi/${item.id}/edit`} secondary>Edit Konten</Action></td></tr>)}</Table>{!rows.length && <Empty />}</div><div className="tg-table-foot">Menampilkan {rows.length} dari {list.length} modul</div></Card></>;
}
export function AssessmentList({ subject }: { subject: Subject }) {
  const base = subjectUrl(subject.id); const { data } = useTeacherData(); const [search, setSearch] = useState(""); const [type, setType] = useState(""); const [status, setStatus] = useState("");
  const list = [{ id: "tugas-01", title: taskTitle, type: "Tugas", status: "Belum dinilai" }, { id: "kuis-01", title: "Kuis 01: Logika Komputasional, Algoritma Dasar & Dekomposisi Masalah", type: "Kuis", status: "Ditutup" }, ...data.assessments.filter(item => item.subject === subject.id)];
  const rows = list.filter(item => item.title.toLowerCase().includes(search.toLowerCase()) && (!type || item.type === type) && (!status || item.status === status));
  return <><Heading title="Tugas & Asesmen Pembelajaran" action={<div className="tg-actions"><Action href={classUrl(subject.classes[0]) + "/nilai"} secondary>Rekap Nilai</Action><Action href={`${base}/asesmen/baru`}>+ Buat Asesmen Baru</Action></div>} /><SubjectTabs subject={subject} tab="/asesmen" /><Stats items={[{ label: "Asesmen Aktif", value: "2 Tugas", note: "Tugas pembelajaran berjalan" }, { label: "Menunggu Koreksi", value: "38 Berkas", note: "8A: 18 · 8B: 12 · 8C: 8", warning: true }, { label: "Pengumpulan", value: "92%", note: "Target pengumpulan tercapai" }, { label: "Terjadwal", value: "1 Asesmen", note: "Asesmen sumatif berikutnya" }]} /><Card><div className="tg-toolbar"><Search value={search} onChange={setSearch} placeholder="Cari judul tugas atau materi..." /><select aria-label="Tipe asesmen" value={type} onChange={event => setType(event.target.value)}><option value="">Semua Tipe</option><option>Tugas</option><option>Kuis</option><option>Tugas & Kuis Campuran</option></select><select aria-label="Status asesmen" value={status} onChange={event => setStatus(event.target.value)}><option value="">Semua Status</option><option>Belum dinilai</option><option>Ditutup</option><option>Draf</option><option>Diterbitkan</option></select></div></Card>{rows.map(item => <Card key={item.id} className="tg-assessment-card"><div className="tg-stack"><div className="tg-between"><div className="tg-inline"><Badge>{item.type}</Badge><Badge tone="muted">Kelas {subject.classes.join(", ")}</Badge><Badge tone={item.status === "Ditutup" ? "success" : "warning"}>{item.status}</Badge></div><span className="tg-small">Tenggat: 31 Okt 2026 · 23:59 WIB</span></div><h2>{item.title}</h2>{item.id === "tugas-01" ? <><div className="tg-subcard"><Progress value={92} label="90 dari 98 siswa sudah mengumpulkan" /><div className="tg-inline tg-small"><span>● 52 Sudah Dinilai</span><span>● 38 Menunggu Koreksi</span><span>● 8 Belum Mengumpulkan</span></div></div><div className="tg-grid-3">{subject.classes.map((group, index) => <div className="tg-subcard tg-soft" key={group}><strong>Kelas {group}</strong><Badge tone="warning">{[18, 12, 8][index] || 8} Tunggu</Badge></div>)}</div></> : item.id === "kuis-01" ? <div className="tg-metrics"><div><span className="tg-label">Rata-rata Nilai</span><h2>84.6</h2></div><div><span className="tg-label">Nilai Tertinggi</span><h2>100</h2></div><div><span className="tg-label">Perlu Tindak Lanjut</span><h2>4 Siswa</h2></div></div> : <Notice>Asesmen ini disimpan dalam pratinjau. Belum ada pengumpulan siswa.</Notice>}<div className="tg-actions">{["tugas-01", "kuis-01"].includes(item.id) ? <><Action href={`${base}/asesmen/${item.id}/analisis`} secondary>Lihat Hasil & Analisis</Action>{item.id === "tugas-01" && <Action href={`${base}/asesmen/tugas-01/pengumpulan`}>Periksa Pengumpulan (38 Berkas)</Action>}</> : <Action href={`${base}/asesmen/${item.id}/edit`} secondary>Edit Asesmen</Action>}</div></div></Card>)}{!rows.length && <Card><Empty /></Card>}<p className="tg-small">Menampilkan {rows.length} dari {list.length} asesmen</p></>;
}
