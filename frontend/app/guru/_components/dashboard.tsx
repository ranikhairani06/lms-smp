"use client";
import Link from "next/link";
import { useState } from "react";
import { Card, Heading, Badge, Stats, Progress, Action, Button, Dialog, Period, Notice } from "./ui";
import { subjectUrl, classUrl } from "./data";
import { useTeacherData } from "./store";
import { Solar } from "../../siswa/_components/icon";

export default function Dashboard({ name }: { name: string }) {
  const { data, save } = useTeacherData();
  const [closing, setClosing] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const base = subjectUrl();
  return <>
    <Heading hero title={`Selamat datang, ${name}!`} description="Kelola pembelajaran dan asesmen siswa." action={<Period />} />
    <Stats items={[{ label: "Mapel Diampu", value: "2", note: "Informatika & Matematika", icon: "book-2" }, { label: "Total Kelas Diampu", value: "8", note: "Rombongan belajar aktif", icon: "users-group-rounded" }, { label: "Sedang Mengerjakan", value: "28", note: "Siswa dalam asesmen aktif", icon: "user" }, { label: "Perlu Dinilai", value: "42", note: "Berkas menunggu koreksi", icon: "clipboard-text", warning: true }]} />
    {message && <Notice>{message}</Notice>}
    <div className="tg-columns"><div className="tg-stack"><Card title="Asesmen & Kuis Aktif" action={<Link className="tg-link" href={`${base}/asesmen`}>Lihat Semua →</Link>}>
      {[{ id: "aljabar", name: "Kuis Aljabar 8A", group: "8A", subtitle: "Matematika · Semester Ganjil", percent: 82, count: "28 / 34 siswa", deadline: "Hari ini 15:00 WIB" }, { id: "logika", name: "Formatif Logika Komputasi 7A", group: "7A", subtitle: "Informatika · Dasar Berpikir Komputasional", percent: 34, count: "12 / 35 siswa", deadline: "Besok 10:00 WIB" }].map(item => <div className="tg-subcard" key={item.id}><div className="tg-between"><div className="tg-row"><span className="tg-icon-tile">{item.group}</span><div><h3>{item.name}</h3><p className="tg-small">{item.subtitle}</p></div></div><Badge tone={data.closed.includes(item.id) ? "muted" : "warning"}>{data.closed.includes(item.id) ? "Ditutup" : `Batas: ${item.deadline}`}</Badge></div><Progress value={item.percent} label={item.count} /><div className="tg-actions"><Action href={`${base}/asesmen/tugas-01/pengumpulan`} secondary><Solar name="eye" />Pantau</Action><Button tone="danger" disabled={data.closed.includes(item.id)} onClick={() => setClosing(item.id)}>Tutup</Button></div></div>)}
    </Card><Card title="Tugas Menunggu Penilaian" action={<span className="tg-small">Total: 42 dokumen</span>}>{["Latihan SPLDV (Persamaan Linier) 8A", "Proyek Flowchart (Algoritma) 7A"].map((title, index) => <div className="tg-subcard" key={title}><div className="tg-row"><span className="tg-icon-tile"><Solar name="clipboard-check" /></span><div><h3>{title}</h3><p className="tg-small">{index ? 24 : 18} berkas · <Badge tone="warning">Perlu Penilaian</Badge></p></div><Action href={`${base}/asesmen/tugas-01/pengumpulan`}>Nilai Sekarang →</Action></div></div>)}</Card></div>
    <aside className="tg-stack"><Card title="Jadwal Kelas yang Diampu">{["8A", "7A", "9A"].map((group, index) => <Link className="tg-subcard" href={classUrl(group)} key={group}><div className="tg-between"><h3>Kelas {group} · {index === 1 ? "Informatika" : "Matematika"}</h3><Badge>{index === 1 ? 35 : 34} Siswa</Badge></div><div className="tg-between tg-small"><span>{["Senin 07:30", "Selasa 09:00", "Rabu 07:30"][index]} WIB</span><span>{index === 1 ? "Lab Komputer" : "Ruang 201"}</span></div></Link>)}</Card><Card title="Ujian Terjadwal" action={<Badge tone="info">Terjadwal</Badge>}><div className="tg-subcard tg-soft"><span className="tg-label">Asesmen Sumatif Tengah Semester</span><h3>UTS Informatika Kelas VIII</h3><p className="tg-small">08 November 2026, 08:00 WIB<br />Durasi: 60 menit</p><div className="tg-inline">{["8A", "8B", "8C"].map(group => <Badge key={group}>{group}</Badge>)}</div></div><div className="tg-divider"><Action href={`${base}/asesmen/baru`} secondary>Kelola Ujian</Action></div></Card></aside></div>
    {closing && <Dialog title="Tutup asesmen ini?" onClose={() => setClosing(null)}><p>Status asesmen pada pratinjau akan berubah menjadi ditutup.</p><div className="tg-actions"><Button tone="outline" onClick={() => setClosing(null)}>Batal</Button><Button onClick={() => { try { save({ closed: [...data.closed, closing] }); setMessage("Asesmen ditutup pada pratinjau ini."); setClosing(null); } catch { setMessage("Perubahan belum tersimpan. Penyimpanan browser tidak tersedia."); } }}>Tutup Asesmen</Button></div></Dialog>}
  </>;
}
