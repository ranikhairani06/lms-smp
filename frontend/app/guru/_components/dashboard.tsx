"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, Heading, Badge, Stats, Action, Button, Dialog, Notice } from "./ui";
import { subjectUrl, classUrl } from "./data";
import { useTeacherData } from "./store";
import { Solar } from "../../siswa/_components/icon";
import { useTeacherResource } from "./useTeacherApi";
import type { TeacherCourse } from "./teacher-api";

type DashboardData = { courses?: TeacherCourse[]; need_grading?: unknown; alerts?: unknown[] };

const activeAssessments: { id: string; name: string; group: string; subject: string; percent: number; count: string; deadline: string }[] = [];

const pendingAssessments: { title: string; files: number }[] = [];

const classSchedule: { group: string; subject: string; students: number; time: string; room: string }[] = [];

export default function Dashboard({ name }: { name: string }) {
  const { data, save } = useTeacherData();
  const dashboard = useTeacherResource<DashboardData>("dashboard");
  const [closing, setClosing] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const base = subjectUrl();
  const courseCount = dashboard.data?.courses?.length;
  const gradingCount = Array.isArray(dashboard.data?.need_grading)
    ? dashboard.data.need_grading.length
    : typeof dashboard.data?.need_grading === "number" ? dashboard.data.need_grading : undefined;

  return <div className="tg-dashboard">
    <Heading hero title={`Selamat datang, ${name}!`} description="Kelola pembelajaran dan asesmen siswa" action={<Badge><Solar name="calendar" />Tahun Ajaran — {"\u2022"} Semester —</Badge>} />

    <Stats items={[
      { label: "Mata Pelajaran Diampu", value: courseCount ?? "—", note: "", icon: "book-2" },
      { label: "Total Kelas Diampu", value: "—", note: "", icon: "users-group-rounded" },
      { label: "Perlu Dinilai", value: gradingCount ?? "—", note: "", icon: "clipboard-text", warning: true },
    ]} />

    {(dashboard.loading || dashboard.error || message) && <Notice tone={dashboard.error ? "error" : "info"}>{dashboard.error || message || "Memuat data dashboard..."}</Notice>}

    <div className="tg-columns">
      <div className="tg-stack">
        <Card title="Asesmen & Kuis Aktif" action={<Link className="tg-link" href={`${base}/asesmen`}>Lihat Semua <Solar name="arrow-right" /></Link>}>
          {activeAssessments.map(item => <div className="tg-subcard tg-assessment" key={item.id}>
            <div className="tg-between tg-assessment-heading">
              <div className="tg-row tg-assessment-title">
                <span className="tg-class-tile">{item.group}</span>
                <div><h3>{item.name}</h3><p className="tg-small">{item.subject}</p></div>
              </div>
              <Badge tone={item.id === "aljabar" ? "error" : "warning"}><Solar name="clock-circle" />Batas: {item.deadline}</Badge>
            </div>
            <div className="tg-progress">
              <div className="tg-between tg-small"><span>Progres Pengumpulan</span><strong>{item.count}</strong></div>
              <div className="tg-track" role="progressbar" aria-label={`Progres pengumpulan ${item.name}`} aria-valuenow={item.percent} aria-valuemin={0} aria-valuemax={100}>
                <span style={{ width: `${item.percent}%` }} />
              </div>
            </div>
            <div className="tg-actions tg-assessment-actions">
              <Action href={`${base}/asesmen/tugas-01/pengumpulan`} secondary><Solar name="eye" />Pantau</Action>
              <Button tone="danger" disabled={data.closed.includes(item.id)} onClick={() => setClosing(item.id)}>Tutup</Button>
            </div>
          </div>)}
        </Card>

        <Card title="Menunggu Penilaian" action={<Link className="tg-link" href={`${base}/asesmen`}>Lihat Semua <Solar name="arrow-right" /></Link>}>
          {pendingAssessments.map((item, index) => <div className="tg-subcard tg-pending" key={item.title}>
            <span className={`tg-pending-icon tg-pending-icon-${index}`}><Solar name={index === 0 ? "clipboard-check" : "pen-new-square"} /></span>
            <div className="tg-pending-copy"><h3>{item.title}</h3><p className="tg-small"><Solar name="document-text" />{item.files} berkas</p></div>
            <Action href={`${base}/asesmen/tugas-01/pengumpulan`}>Nilai Sekarang <Solar name="arrow-right" /></Action>
          </div>)}
        </Card>
      </div>

      <aside className="tg-stack">
        <Card title="Jadwal Kelas yang Diampu">
          {classSchedule.map(item => <Link className="tg-subcard tg-schedule" href={classUrl(item.group)} key={item.group}>
            <div className="tg-between"><h3>Kelas {item.group} · {item.subject}</h3><Badge>{item.students} Siswa</Badge></div>
            <div className="tg-between tg-small"><span><Solar name="clock-circle" />{item.time}</span><span>{item.room}</span></div>
          </Link>)}
        </Card>

        <Card title="Ujian Terjadwal" action={<Badge tone="info">Terjadwal</Badge>}>
          <div className="tg-subcard tg-soft tg-exam">
            <h3><span className="tg-exam-icon"><Solar name="documents" /></span>—</h3>
            <p className="tg-small"><span><Solar name="calendar" />—</span><span><Solar name="clock-circle" />Durasi: —</span></p>
            <div className="tg-exam-classes"><span>Rombongan Belajar Peserta:</span><div>—</div></div>
          </div>
          <div className="tg-divider"><Action href={`${base}/asesmen/baru`} secondary><Solar name="settings" />Kelola Ujian</Action></div>
        </Card>
      </aside>
    </div>

    {closing && <Dialog title="Tutup asesmen ini?" onClose={() => setClosing(null)}><p>Status asesmen pada pratinjau akan berubah menjadi ditutup.</p><div className="tg-actions"><Button tone="outline" onClick={() => setClosing(null)}>Batal</Button><Button onClick={() => { try { save({ closed: [...data.closed, closing] }); setMessage("Asesmen ditutup pada pratinjau ini."); setClosing(null); } catch { setMessage("Perubahan belum tersimpan. Penyimpanan browser tidak tersedia."); } }}>Tutup Asesmen</Button></div></Dialog>}
  </div>;
}
