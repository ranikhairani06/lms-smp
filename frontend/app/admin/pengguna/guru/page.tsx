"use client";

import { useMemo, useState } from "react";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import { Button, Field, InfoBanner, Modal, PageHeading, Pagination, SearchField, SelectField, StatCard, StatusBadge, TableEmpty, adminStyles as s } from "@/app/admin/_components/AdminUI";

const teachers = [
  { name: "Drs. Raden H. Sutanto, M.Pd.", nip: "197103151998021004", subject: "Informatika", task: "Kepala Lab Komputer", classes: "8A · 8B · 8C · +2", status: "Aktif (Sandi Diperbarui)", activity: "12 Menit lalu" },
  { name: "Nur Halimah, S.Si., M.Pd.", nip: "198207192006042018", subject: "Matematika", task: "Wali Kelas 9A", classes: "9A · 9B · 9C · 9D", status: "Aktif (Sandi Diperbarui)", activity: "Hari ini, 09:14" },
  { name: "Bambang Wijanarko, S.Pd.", nip: "198811042011011009", subject: "IPA Terpadu", task: "Wali Kelas 7C", classes: "7A · 7B · 7C", status: "Terkunci (Salah Sandi)", activity: "Kemarin, 14:02" },
  { name: "Siti Rahmawati, S.Pd.", nip: "199105212015032007", subject: "Bahasa Indonesia", task: "-", classes: "8D · 8E · 8F", status: "Aktif (Sandi Diperbarui)", activity: "1 jam lalu" },
  { name: "Ahmad Fauzi, S.Pd.I.", nip: "197904122005011006", subject: "Pendidikan Agama", task: "Pembina Rohis", classes: "7D · 7E · 7F", status: "Aktif (Sandi Diperbarui)", activity: "3 jam lalu" },
  { name: "Endah Kusumastuti, S.Pd.", nip: "198509142010012023", subject: "Bahasa Inggris", task: "Wali Kelas 8B", classes: "8A · 8B · 8C", status: "Aktif (Sandi Diperbarui)", activity: "Hari ini, 07:45" },
  { name: "Tri Prabowo, S.Or.", nip: "199302182019021008", subject: "PJOK", task: "Koord. Ekstrakurikuler", classes: "7A · 7B · 8A · +3", status: "Terkunci (Salah Sandi)", activity: "3 hari lalu" },
];

export default function GuruPage() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("Semua Kategori");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", nip: "", subject: "Bahasa Indonesia", task: "Wali Kelas", homeroom: "Kelas 7D (Ruang 104)", classes: ["Kelas 7A", "Kelas 7B", "Kelas 7C"], email: "", phone: "" });
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => teachers.filter((teacher) => `${teacher.name} ${teacher.nip} ${teacher.subject}`.toLowerCase().includes(keyword.toLowerCase()) && (category === "Semua Kategori" || teacher.status.includes(category))), [keyword, category]);
  const toggleClass = (item: string) => setForm((current) => ({ ...current, classes: current.classes.includes(item) ? current.classes.filter((value) => value !== item) : [...current.classes, item] }));

  return (
    <>
      <PageHeading breadcrumbs={["LMS", "Manajemen Pengguna", "Manajemen Guru"]} title="Manajemen Guru" description="Direktori staf pendidik, pembagian tugas mengajar, dan kredensial akun guru SMP Terpadu."
        actions={<><Button variant="outline" icon="upload-linear" onClick={() => alert("Pilih file Excel/CSV untuk proses import.")}>Import Data (Excel/CSV)</Button><Button icon="user-plus-linear" onClick={() => setModal(true)}>Tambah Guru Baru</Button></>} />
      {/* Bagian tampilan: statistik guru dan staf. */}
      <div className={s.statGridThree}>
        <StatCard label="Total Guru" value="58" icon="users-group-rounded-linear" tone="primary" />
        <StatCard label="Guru Bersertifikasi" value="46" icon="graduation-cap-linear" tone="success" />
        <StatCard label="Wali Kelas Ditugaskan" value="24" icon="user-check-linear" tone="warning" />
      </div>
      {/* Bagian tampilan: filter direktori guru. */}
      <div className={s.toolbar}><SearchField value={keyword} onChange={setKeyword} placeholder="Cari nama guru, NIP, atau mata pelajaran..." /><div className={s.toolbarSpacer} /><SelectField value={category} onChange={setCategory} options={["Semua Kategori", "Aktif", "Terkunci"]} /></div>
      {/* Bagian tampilan: tabel guru, mata pelajaran, tugas, dan rombel yang diampu. */}
      <div className={s.tableWrap}>
        <table className={s.dataTable}>
          <thead><tr><th>Nama Guru</th><th>NIP</th><th>Mata Pelajaran</th><th>Tugas Tambahan</th><th>Rombel Diampu</th><th>Status &amp; Kredensial</th><th>Aktivitas Terakhir</th><th>Aksi</th></tr></thead>
          <tbody>{filtered.map((teacher) => <tr key={teacher.nip}>
            <td><span className={s.tableStrong}>{teacher.name}</span></td><td>{teacher.nip}</td><td><StatusBadge tone="primary">{teacher.subject}</StatusBadge></td><td>{teacher.task}</td><td>{teacher.classes}</td>
            <td><StatusBadge tone={teacher.status.startsWith("Aktif") ? "info" : "danger"}>{teacher.status}</StatusBadge></td><td>{teacher.activity}</td>
            <td><div className={s.tableActions}><button className={s.iconButton} title="Detail" onClick={() => alert(`${teacher.name}\n${teacher.nip}\n${teacher.subject}`)}><AdminIcon name="eye-linear" size={15} /></button><button className={s.iconButton} title="Edit" onClick={() => setModal(true)}><AdminIcon name="pen-linear" size={15} /></button></div></td>
          </tr>)}{filtered.length === 0 && <TableEmpty colSpan={8} />}</tbody>
        </table>
        <Pagination current={page} total={7} onChange={setPage} label={`Menampilkan 1-${filtered.length} dari 58 guru`} />
      </div>

      {/* Bagian tampilan: modal alokasi akun guru, mata pelajaran, tugas tambahan, dan rombel. */}
      {modal && <Modal title="Tambah Guru & Staf" subtitle="Alokasikan akun pendidik baru, tugas pengampu mata pelajaran, dan wali kelas." onClose={() => setModal(false)} footer={<><Button variant="outline" onClick={() => setModal(false)}>Batal</Button><Button icon="diskette-linear" onClick={() => setModal(false)}>Simpan Guru &amp; Staf</Button></>}>
        <InfoBanner><strong>Kredensial Pendidik:</strong><p>NIP/NUPTK digunakan sebagai ID akun resmi. Password sementara digenerate otomatis dan wajib diperbarui pada login pertama.</p></InfoBanner>
        <div className={s.formGrid}>
          <Field label="Nama Lengkap & Gelar" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required placeholder="Contoh: Dra. Sri Wahyuni, M.Pd." />
          <Field label="NIP / NUPTK" value={form.nip} onChange={(value) => setForm({ ...form, nip: value.replace(/\D/g, "").slice(0, 18) })} required hint="18 digit valid" placeholder="Masukkan NIP/NUPTK" />
          <label className={s.formField}><span>Mata Pelajaran Utama *</span><select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}><option>Bahasa Indonesia</option><option>Matematika</option><option>Informatika</option><option>IPA Terpadu</option><option>Bahasa Inggris</option><option>Pendidikan Agama</option></select></label>
          <label className={s.formField}><span>Tugas Tambahan *</span><select value={form.task} onChange={(e) => setForm({ ...form, task: e.target.value })}><option>Wali Kelas</option><option>Kepala Lab Komputer</option><option>Pembina Rohis</option><option>Koord. Ekstrakurikuler</option><option>Tidak Ada</option></select></label>
          {form.task === "Wali Kelas" && <label className={`${s.formField} ${s.formFull}`}><span>Wali Kelas untuk:</span><select value={form.homeroom} onChange={(e) => setForm({ ...form, homeroom: e.target.value })}><option>Kelas 7D (Ruang 104)</option><option>Kelas 8A (Ruang 201)</option><option>Kelas 9A (Ruang 301)</option></select></label>}
          <div className={`${s.formField} ${s.formFull}`}><span>Rombongan Belajar yang Diampu *</span><div className={s.choiceRow}>{["Kelas 7A", "Kelas 7B", "Kelas 7C", "Kelas 7D", "Kelas 8A", "Kelas 8B"].map((item) => <label className={s.choicePill} key={item}><input type="checkbox" checked={form.classes.includes(item)} onChange={() => toggleClass(item)} />{item}</label>)}</div></div>
          <Field label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required placeholder="nama@smp.sch.id" type="email" />
          <Field label="Kontak" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} required placeholder="08xxxxxxxxxx" />
        </div>
      </Modal>}
    </>
  );
}
