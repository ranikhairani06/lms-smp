"use client";

import { useState } from "react";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import AdminDirectoryToolbar from "@/app/admin/_components/AdminDirectoryToolbar";
import useAdminDirectoryFilter from "@/app/admin/_components/useAdminDirectoryFilter";
import { AdminStatRow, AdminTableIconButton, Button, Field, InfoBanner, Modal, PageHeading, Pagination, StatusBadge, TableEmpty, adminStyles as s } from "@/app/admin/_components/AdminUI";

const teachers = [
  { name: "Drs. Raden H. Sutanto, M.Pd.", nip: "197103151998021004", subject: "Informatika", task: "Kepala Lab Komputer", classes: "8A · 8B · 8C · +2", status: "Aktif (Sandi Diperbarui)", activity: "12 Menit lalu" },
  { name: "Nur Halimah, S.Si., M.Pd.", nip: "198207192006042018", subject: "Matematika", task: "Wali Kelas 9A", classes: "9A · 9B · 9C · 9D", status: "Aktif (Sandi Diperbarui)", activity: "Hari ini, 09:14" },
  { name: "Bambang Wijanarko, S.Pd.", nip: "198811042011011009", subject: "IPA Terpadu", task: "Wali Kelas 7C", classes: "7A · 7B · 7C", status: "Terkunci (Salah Sandi)", activity: "Kemarin, 14:02" },
  { name: "Siti Rahmawati, S.Pd.", nip: "199105212015032007", subject: "Bahasa Indonesia", task: "-", classes: "8D · 8E · 8F", status: "Aktif (Sandi Diperbarui)", activity: "1 jam lalu" },
  { name: "Ahmad Fauzi, S.Pd.I.", nip: "197904122005011006", subject: "Pendidikan Agama", task: "Pembina Rohis", classes: "7D · 7E · 7F", status: "Aktif (Sandi Diperbarui)", activity: "3 jam lalu" },
  { name: "Endah Kusumastuti, S.Pd.", nip: "198509142010012023", subject: "Bahasa Inggris", task: "Wali Kelas 8B", classes: "8A · 8B · 8C", status: "Aktif (Sandi Diperbarui)", activity: "Hari ini, 07:45" },
  { name: "Tri Prabowo, S.Or.", nip: "199302182019021008", subject: "PJOK", task: "Koord. Ekstrakurikuler", classes: "7A · 7B · 8A · +3", status: "Terkunci (Salah Sandi)", activity: "3 hari lalu" },
];

const getTeacherSearchText = (teacher: typeof teachers[number]) => `${teacher.name} ${teacher.nip} ${teacher.subject}`;
const matchesTeacherCategory = (teacher: typeof teachers[number], category: string) => category === "Semua Kategori" || teacher.status.includes(category);

const subjectTones: Record<string, "primary" | "info" | "success" | "warning" | "neutral"> = {
  Informatika: "primary",
  Matematika: "info",
  "IPA Terpadu": "success",
  "Bahasa Indonesia": "warning",
  "Pendidikan Agama": "warning",
  "Bahasa Inggris": "primary",
  PJOK: "neutral",
};

export default function GuruPage() {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", nip: "", subject: "", task: "", homeroom: "", classes: [] as string[], email: "", phone: "" });
  const [page, setPage] = useState(1);
  const { keyword, setKeyword, category, setCategory, filtered } = useAdminDirectoryFilter({
    items: teachers,
    getSearchText: getTeacherSearchText,
    matchesCategory: matchesTeacherCategory,
    initialCategory: "Semua Kategori",
  });
  const toggleClass = (item: string) => setForm((current) => ({ ...current, classes: current.classes.includes(item) ? current.classes.filter((value) => value !== item) : [...current.classes, item] }));
  const nameIsValid = form.name.trim().length > 0;
  const nipIsValid = form.nip.length === 18;
  const emailIsValid = form.email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const normalizedPhone = form.phone.replace(/[\s()-]/g, "");
  const phoneIsValid = normalizedPhone.length >= 8 && normalizedPhone.length <= 15 && /^\+?\d+$/.test(normalizedPhone);

  return (
    <div className={s.teacherManagementPage}>
      <PageHeading breadcrumbs={["LMS", "Manajemen Pengguna", "Manajemen Guru"]} title="Manajemen Guru" description="Direktori staf pendidik, pembagian tugas mengajar, dan kredensial akun guru SMP Terpadu."
        actions={<><Button variant="outline" tone="amber" icon="download-linear" onClick={() => alert("Pilih file Excel/CSV untuk proses import.")}>Import Data (Excel/CSV)</Button><Button icon="user-plus-linear" onClick={() => setModal(true)}>Tambah Guru Baru</Button></>} />
      {/* Bagian tampilan: statistik guru dan staf. */}
      <AdminStatRow columns={3} items={[
        { label: "Total Guru", value: "58", icon: "users-group-rounded-linear", tone: "primary" },
        { label: "Guru Bersertifikasi", value: "46", icon: "square-academic-cap-linear", tone: "success" },
        { label: "Wali Kelas Ditugaskan", value: "24", icon: "user-circle-linear", tone: "warning" },
      ]} />
      {/* Bagian tampilan: filter direktori guru. */}
      <AdminDirectoryToolbar
        keyword={keyword}
        onKeywordChange={setKeyword}
        searchPlaceholder="Cari nama guru, NIP, atau mata pelajaran..."
        category={category}
        onCategoryChange={setCategory}
        categoryOptions={["Semua Kategori", "Aktif", "Terkunci"]}
      />
      {/* Bagian tampilan: tabel guru, mata pelajaran, tugas, dan rombel yang diampu. */}
      <div className={`${s.tableWrap} ${s.teacherTableWrap}`}>
        <table className={`${s.dataTable} ${s.teacherTable} ${s.directoryTable}`}>
          <thead><tr><th>Nama Guru</th><th>NIP</th><th>Mata Pelajaran</th><th>Tugas Tambahan</th><th>Rombel Diampu</th><th>Status &amp; Kredensial</th><th>Aktivitas Terakhir</th><th>Aksi</th></tr></thead>
          <tbody>{filtered.map((teacher) => {
            const subjectTone = subjectTones[teacher.subject] ?? "primary";
            const statusTone = teacher.status.startsWith("Aktif") ? "primary" : teacher.status.startsWith("Terkunci") ? "danger" : "warning";
            const statusClass = statusTone === "primary" ? s.teacherStatusActive : statusTone === "danger" ? s.teacherStatusError : s.teacherStatusWarning;
            const classNames = teacher.classes.match(/\+?\d+[A-Z]?/g) ?? [];

            return <tr key={teacher.nip}>
            <td><span className={`${s.tableStrong} ${s.teacherName}`}>{teacher.name}</span></td><td className={s.teacherNip}>{teacher.nip}</td>
            <td><StatusBadge tone={subjectTone} className={s.teacherBadge}>{teacher.subject}</StatusBadge></td>
            <td>{teacher.task === "-" ? null : teacher.task.startsWith("Wali Kelas") ? <StatusBadge tone="primary" className={`${s.teacherBadge} ${s.teacherHomeroomTask}`}>{teacher.task}</StatusBadge> : <span className={s.teacherTaskTag}>{teacher.task}</span>}</td>
            <td><div className={s.teacherClassList}>{classNames.map((className) => <span key={`${teacher.nip}-${className}`} className={s.teacherClassChip}>{className}</span>)}</div></td>
            <td><StatusBadge tone={statusTone} className={`${s.teacherBadge} ${s.directoryBadge} ${s.directoryStatusBadge} ${s.teacherStatus} ${statusClass}`}>{teacher.status}</StatusBadge></td><td className={s.teacherActivity}>{teacher.activity}</td>
            <td><div className={s.tableActions}><AdminTableIconButton icon="eye-linear" title="Detail" ariaLabel="Detail" onClick={() => alert(`${teacher.name}\n${teacher.nip}\n${teacher.subject}`)} /><AdminTableIconButton icon="pen-linear" title="Edit" ariaLabel="Edit" onClick={() => setModal(true)} /></div></td>
          </tr>;
          })}{filtered.length === 0 && <TableEmpty colSpan={8} />}</tbody>
        </table>
        <Pagination current={page} total={7} onChange={setPage} label={`Menampilkan 1-${filtered.length} dari 58 guru`} />
      </div>

      {/* Bagian tampilan: modal alokasi akun guru, mata pelajaran, tugas tambahan, dan rombel. */}
      {modal && <Modal className={s.teacherModal} layout="studentForm" title="Tambah Guru & Staf" subtitle="Alokasikan akun pendidik baru, tugas pengampu mata pelajaran, dan wali kelas." onClose={() => setModal(false)} footer={<><span className={s.teacherModalFooterSpacer} /><div className={s.teacherModalFooterActions}><Button variant="outline" className={s.teacherCancelButton} onClick={() => setModal(false)}>Batal</Button><Button icon="diskette-linear" onClick={() => setModal(false)}>Simpan Guru &amp; Staf</Button></div></>}>
        <InfoBanner tone="primary"><strong>Kredensial Pendidik:</strong><p>NIP/NUPTK digunakan sebagai ID akun resmi. Password sementara digenerate otomatis dan wajib diperbarui pada login pertama.</p></InfoBanner>
        <div className={`${s.formGrid} ${s.teacherFormGrid}`}>
          <Field className={s.teacherModalField} label="Nama Lengkap & Gelar" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required valid={nameIsValid} placeholder="Nama lengkap dan gelar" />
          <Field className={s.teacherModalField} label="NIP / NUPTK" value={form.nip} onChange={(value) => setForm({ ...form, nip: value.replace(/\D/g, "").slice(0, 18) })} required valid={nipIsValid} validLabel="18 Digit Valid" placeholder="Masukkan NIP/NUPTK" />
          <label className={`${s.formField} ${s.teacherModalField}`}><span>Mata Pelajaran Utama <b>*</b></span><select required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}><option value="" disabled>Pilih mata pelajaran</option><option>Bahasa Indonesia</option><option>Matematika</option><option>Informatika</option><option>IPA Terpadu</option><option>Bahasa Inggris</option><option>Pendidikan Agama</option></select></label>
          <label className={`${s.formField} ${s.teacherModalField}`}><span>Tugas Tambahan <b>*</b></span><select required value={form.task} onChange={(e) => setForm({ ...form, task: e.target.value })}><option value="" disabled>Pilih tugas tambahan</option><option>Wali Kelas</option><option>Kepala Lab Komputer</option><option>Pembina Rohis</option><option>Koord. Ekstrakurikuler</option><option>Tidak Ada</option></select></label>
          {form.task === "Wali Kelas" && <div className={s.teacherHomeroomPanel}>
            <div className={s.teacherHomeroomHeader}><strong><AdminIcon name="users-group-rounded-linear" size={15} />Wali Kelas untuk:</strong><StatusBadge tone="success" className={s.teacherAllocationBadge}>Alokasi Aktif</StatusBadge></div>
            <label className={`${s.formField} ${s.teacherModalField}`}><select required aria-label="Wali Kelas untuk" value={form.homeroom} onChange={(e) => setForm({ ...form, homeroom: e.target.value })}><option value="" disabled>Pilih kelas dan ruang</option><option>Kelas 7D (Ruang 104)</option><option>Kelas 8A (Ruang 201)</option><option>Kelas 9A (Ruang 301)</option></select></label>
          </div>}
          <div className={`${s.formField} ${s.teacherModalField}`}><span>Rombongan Belajar yang Diampu <b>*</b></span><div className={s.teacherClassChoices}>{["Kelas 7A", "Kelas 7B", "Kelas 7C", "Kelas 7D", "Kelas 8A", "Kelas 8B"].map((item) => {
            const selected = form.classes.includes(item);
            return <label className={`${s.teacherClassChoice} ${selected ? s.teacherClassChoiceSelected : ""}`} key={item}><input type="checkbox" checked={selected} onChange={() => toggleClass(item)} />{selected && <AdminIcon name="check-read-linear" size={13} />}{item}</label>;
          })}<button type="button" className={s.teacherAddClass}>+ Tambah Rombel Lain</button></div></div>
          <div className={s.teacherEmailContact}>
            <Field className={s.teacherModalField} label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required valid={emailIsValid} placeholder="nama@smp.sch.id" type="email" />
            <Field className={s.teacherModalField} label="Kontak" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} required valid={phoneIsValid} placeholder="08xxxxxxxxxx" type="tel" />
          </div>
        </div>
      </Modal>}
    </div>
  );
}
