"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type AuthUser, initials } from "@/lib/auth-types";
import { ApiError, apiRequest } from "@/lib/api";
import { Action, Badge, Button, Card, Empty, Heading, Notice, Period, Stats, Table } from "./ui";
import { exportCsv, mean, subjects, subjectUrl } from "./data";
import { useTeacherData } from "./store";
import { Solar } from "../../siswa/_components/icon";
import { useTeacherResource } from "./useTeacherApi";
import { courseForSubject, displayDate, submissionClassName, submissionStudentName, type TeacherCourse, type TeacherSubmission } from "./teacher-api";

export function ResultsExport() {
  const courses = useTeacherResource<TeacherCourse[]>("courses"); const submissions = useTeacherResource<TeacherSubmission[]>("submissions");
  const [subjectId, setSubjectId] = useState(""); const [groups, setGroups] = useState<string[] | null>(null); const [components, setComponents] = useState(["Tugas", "Kuis", "UTS", "UAS", "Akhir"]); const [downloaded, setDownloaded] = useState(false);
  const availableSubjects = (courses.data || []).flatMap(course => { const template = subjects.find(item => courseForSubject([course], item)); return template ? [{ ...template, name: course.name, code: "—", classes: [] }] : []; }).filter((item, index, all) => all.findIndex(candidate => candidate.id === item.id) === index);
  const subject = availableSubjects.find(item => item.id === subjectId) || availableSubjects[0];
  const selectedCourseIds = new Set((courses.data || []).filter(course => subject && courseForSubject([course], subject)).map(course => course.id));
  const availableGroups = [...new Set((submissions.data || []).filter(item => selectedCourseIds.has(item.course?.id || item.assessment?.course?.id || -1)).map(submissionClassName).filter(group => Boolean(group)))];
  const selectedGroups = groups ?? availableGroups;
  const studentRows = new Map<string, { id: string; name: string; group: string; scores: TeacherSubmission[] }>();
  (submissions.data || []).filter(item => selectedCourseIds.has(item.course?.id || item.assessment?.course?.id || -1) && selectedGroups.includes(submissionClassName(item))).forEach(item => {
    const group = submissionClassName(item); const student = item.student; const key = `${student?.id ?? item.id}:${group}`;
    const row = studentRows.get(key) || { id: student?.nisn || "—", name: student?.user?.name || "—", group, scores: [] };
    row.scores.push(item); studentRows.set(key, row);
  });
  const rows = [...studentRows.values()].map(row => {
    const averageFor = (type: string) => { const values = row.scores.filter(item => item.assessment?.assessment_type === type && typeof item.score === "number").map(item => item.score as number); return values.length ? mean(values).toFixed(1) : "—"; };
    return { ...row, values: { Tugas: "—", Kuis: "—", UTS: averageFor("midterm"), UAS: averageFor("final"), Akhir: "—" } };
  });
  const value = (row: typeof rows[number], component: string) => row.values[component as keyof typeof row.values];
  const courseError = courses.error || submissions.error;
  return <><Heading hero title="Ekspor Hasil Pembelajaran" description="Unduh rekap nilai dalam format CSV yang dapat dibuka di Excel." action={<Period />} /><div className="tg-export-columns"><Card title="Konfigurasi Ekspor"><div className="tg-stack"><label className="tg-field"><span className="tg-label">Mata Pelajaran</span><select value={subject?.id || ""} onChange={event => { setSubjectId(event.target.value); setGroups(null); setDownloaded(false); }}>{availableSubjects.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><fieldset className="tg-stack"><legend className="tg-label">Rombongan Belajar / Kelas</legend>{availableGroups.map(group => <label className="tg-check-row" key={group}><input type="checkbox" checked={selectedGroups.includes(group)} onChange={event => { setGroups(event.target.checked ? [...selectedGroups, group] : selectedGroups.filter(value => value !== group)); setDownloaded(false); }} /><span>Kelas {group}</span></label>)}</fieldset><fieldset className="tg-stack"><legend className="tg-label">Komponen Nilai</legend>{["Tugas", "Kuis", "UTS", "UAS", "Akhir"].map(component => <label className="tg-inline" key={component}><input type="checkbox" checked={components.includes(component)} onChange={event => { setComponents(event.target.checked ? [...components, component] : components.filter(value => value !== component)); setDownloaded(false); }} />{component === "Akhir" ? "Nilai Akhir Rapor" : component}</label>)}</fieldset><Notice tone="warning">Format berkas: CSV · kompatibel dengan Excel</Notice><p className="tg-small">{rows.length} siswa · {components.length} komponen nilai</p><Button disabled={!rows.length || !components.length} onClick={() => { exportCsv(`Nilai_${subject?.code || "hasil"}_${selectedGroups.join("-")}`, [["No", "NISN", "Nama Siswa", "Kelas", ...components], ...rows.map((row, index) => [index + 1, row.id, row.name, row.group, ...components.map(component => value(row, component))])]); setDownloaded(true); }}><Solar name="download-minimalistic" />Unduh CSV</Button>{downloaded && <div role="status"><Notice tone="success">Berkas rekap nilai berhasil dibuat.</Notice></div>}</div></Card><Card title="Pratinjau" action={<span className="tg-small">{rows.length} siswa</span>}><Table headers={["No", "NISN", "Nama Siswa", "Kelas", ...components]}>{rows.map((row, index) => <tr key={`${row.id}-${row.group}`}><td>{index + 1}</td><td>{row.id}</td><td><strong>{row.name}</strong></td><td>{row.group}</td>{components.map(component => <td key={component} className={component === "Akhir" ? "tg-score" : undefined}>{value(row, component)}</td>)}</tr>)}</Table>{!rows.length && <Empty text={courseError || (courses.loading || submissions.loading ? "Memuat hasil belajar..." : "Pilih kelas untuk menampilkan nilai.")} /> }<div className="tg-divider"><Notice>Berkas memuat data hasil pembelajaran yang tersedia pada pratinjau ini.</Notice></div></Card></div></>;
}type TeacherDashboardData = { alerts?: unknown[] };
export function Notifications() {
  const { data, save } = useTeacherData(); const [error, setError] = useState("");
  const dashboard = useTeacherResource<TeacherDashboardData>("dashboard"); const submissions = useTeacherResource<TeacherSubmission[]>("submissions"); const courses = useTeacherResource<TeacherCourse[]>("courses");
  const alerts = Array.isArray(dashboard.data?.alerts) ? dashboard.data.alerts : [];
  const alertItems = alerts.map((alert, index) => ({ id: `alert-${index}`, title: typeof alert === "string" ? alert : "Pembaruan pembelajaran", description: "—", time: "—", status: "—", tone: "info", icon: "info-circle", href: "/guru", action: "Lihat Detail", day: "—" }));
  const submissionItems = (submissions.data || []).map(item => {
    const course = item.course || courses.data?.find(value => value.id === item.assessment?.course?.id);
    const subject = course ? subjects.find(value => courseForSubject([course], value)) : undefined;
    const date = item.created_at ? new Date(item.created_at) : undefined;
    const now = new Date(); const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    const dateKey = date && !Number.isNaN(date.getTime()) ? date.toDateString() : "—";
    const day = dateKey === now.toDateString() ? "Hari Ini" : dateKey === yesterday.toDateString() ? "Kemarin" : date ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(date) : "—";
    const assessmentId = item.assessment?.id;
    const path = subject && assessmentId ? `${subjectUrl(subject.id)}/asesmen/${assessmentId}` : "/guru/hasil-belajar";
    return { id: `submission-${item.id}`, title: `${submissionStudentName(item)} mengumpulkan ${item.assessment?.title || "asesmen"}`, description: course?.name || "—", time: displayDate(item.created_at), status: "Terkumpul", tone: "success", icon: "document-add", href: `${path}/nilai/${item.id}`, action: typeof item.score === "number" ? "Ubah Nilai" : "Nilai Sekarang", day };
  });
  const notificationItems = [...submissionItems, ...alertItems];
  const days = [...new Set(notificationItems.map(item => item.day))];
  const unreadCount = notificationItems.filter(item => !data.read.includes(item.id)).length;
  const markRead = (ids: string[]) => { try { save({ read: [...new Set([...data.read, ...ids])] }); } catch { setError("Status baca belum tersimpan. Periksa penyimpanan browser."); } };
  const resourceError = dashboard.error || submissions.error || courses.error;
  return <><Heading hero title="Pusat Notifikasi Guru" description="Pantau pengumpulan tugas, status asesmen, dan pembaruan kelas." action={<Button tone="outline" disabled={!notificationItems.length || unreadCount === 0} onClick={() => markRead(notificationItems.map(item => item.id))}>Tandai Semua Sudah Dibaca</Button>} /><Stats items={[{ label: "Pengumpulan Tugas Baru", value: `${new Set((submissions.data || []).map(item => item.student?.nisn || (item.student?.id ? String(item.student.id) : `submission-${item.id}`))).size} Siswa`, note: "—", icon: "document-add" }, { label: "Belum Dibaca", value: unreadCount, note: "Notifikasi pembelajaran", warning: true }]} />{(error || resourceError) && <Notice tone="error">{error || resourceError}</Notice>}<Card>{days.map((day, dayIndex) => { const dayItems = notificationItems.filter(item => item.day === day); return <div key={day} className={dayIndex ? "tg-divider" : ""}><div className="tg-between"><h2>{day}</h2><Badge>{dayItems.length} Notifikasi</Badge></div><div className="tg-stack tg-divider">{dayItems.map(item => <div className={`tg-subcard ${data.read.includes(item.id) ? "" : "tg-soft"}`} key={item.id}><div className="tg-row"><span className="tg-icon-tile"><Solar name={item.icon} /></span><div><div className="tg-inline"><h3>{item.title}</h3><Badge tone={item.tone}>{item.status}</Badge></div><p className="tg-small">{item.description}</p><small>{item.time} · {data.read.includes(item.id) ? "Sudah dibaca" : "Belum dibaca"}</small></div><Link className="tg-button tg-button-outline" href={item.href} onClick={() => markRead([item.id])}>{item.action}</Link></div></div>)}</div></div>; })}</Card></>;
}
export function TeacherProfile({ user }: { user: AuthUser }) {
  const router = useRouter(); const [profile, setProfile] = useState(user);
  const courses = useTeacherResource<TeacherCourse[]>("courses"); const submissions = useTeacherResource<TeacherSubmission[]>("submissions");
  useEffect(() => {
    let active = true;
    void apiRequest<{ user: AuthUser }>("me").then(result => { if (active && result?.user) setProfile(result.user); }).catch(async cause => { if (cause instanceof ApiError && cause.status === 401) { await apiRequest("auth/logout", { method: "POST" }).catch(() => undefined); router.replace("/login?role=teacher&reason=session-expired"); } });
    return () => { active = false; };
  }, [router]);
  const fields = [["Nama Lengkap & Gelar", profile.name], ["NIP / ID Pegawai", profile.username], ["Tempat, Tanggal Lahir", "—"], ["Jenis Kelamin", "—"], ["Email Sekolah", profile.email || "—"], ["Nomor Telepon / WhatsApp", "—"], ["Status Kepegawaian", "—"], ["Pendidikan Terakhir", "—"]];
  const assignmentRows = (courses.data || []).flatMap(course => { const template = subjects.find(item => courseForSubject([course], item)); if (!template) return []; const groups = [...new Set((submissions.data || []).filter(item => (item.course?.id || item.assessment?.course?.id) === course.id).map(submissionClassName).filter(Boolean))]; return [{ id: course.id, subjectId: template.id, name: course.name, code: "—", groups, students: course.students_count, sessions: null as number | null }]; });
  return <><Heading title="Profil Guru & Pengaturan Akun" description="Informasi data pendidik, penugasan mengajar, dan keamanan akun." /><Card><div className="tg-between"><div className="tg-row"><span className="tg-avatar tg-profile-avatar">{initials(profile.name)}</span><div><h2>{profile.name}</h2><div className="tg-inline"><Badge>ID Pegawai: {profile.username}</Badge></div><p className="tg-small">—</p></div></div><div className="tg-stack"><Badge tone="success">Akun Guru</Badge><small>—</small></div></div></Card><Card title="Informasi Data Pribadi" description="Identitas akun pendidik yang terdaftar di sekolah" action={<Badge>Hanya Lihat</Badge>}><div className="tg-form-grid">{fields.map(([label, value]) => <div className="tg-field" key={label}><span className="tg-small">{label}</span><div className="tg-readonly">{value}</div></div>)}</div><div className="tg-divider"><Notice>Hubungi operator sekolah jika terdapat kesalahan pada identitas akun Anda.</Notice></div></Card><Card title="Penugasan & Beban Mengajar" description="Contoh alokasi mata pelajaran dan rombongan belajar Semester — TA —" action={<Period />}><Table headers={["Mata Pelajaran", "Kode Mapel", "Rombongan Belajar", "Jumlah Siswa", "Jam / Minggu", "Status"]}>{assignmentRows.map(item => <tr key={item.id}><td><Link href={subjectUrl(item.subjectId)}><strong>{item.name}</strong></Link></td><td><Badge>{item.code}</Badge></td><td>{item.groups.join(", ") || "—"}</td><td>{item.students ?? "—"} Siswa</td><td className="tg-score">—</td><td><Badge>—</Badge></td></tr>)}</Table><div className="tg-divider"><Notice tone="success"><h3>Total Beban Mengajar</h3>—</Notice></div></Card><Card title="Keamanan Akun" description="Pengelolaan kredensial akun guru"><Notice><h3>Jaga Kerahasiaan Kata Sandi</h3>Gunakan kata sandi yang kuat. Hubungi operator sekolah jika membutuhkan pemulihan akun.</Notice><div className="tg-divider"><Action href="/password-update" secondary>Ubah Kata Sandi</Action></div></Card></>;
}
