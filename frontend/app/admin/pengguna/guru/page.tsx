"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import useAdminDirectoryFilter from "@/app/admin/_components/useAdminDirectoryFilter";
import useCsvImport from "@/app/admin/_components/useCsvImport";
import {
  ManagementActionButtons,
  ManagementFormField as Field,
  ManagementModal as Modal,
  ManagementPageHeader as PageHeading,
  ManagementPagination as Pagination,
  ManagementStatCard,
  ManagementStatusBadge as StatusBadge,
  ManagementTable,
  ManagementToolbar,
  type ManagementStat,
} from "@/app/admin/pengguna/_components/ManagementComponents";
import { Button, InfoBanner, ManagementHeaderActions, TableEmpty, adminStyles as s } from "@/app/admin/_components/AdminUI";

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
  const router = useRouter();
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", nip: "", subject: "", task: "", homeroom: "", classes: [] as string[], email: "", phone: "" });
  const [touched, setTouched] = useState<Partial<Record<"name" | "nip" | "subject" | "task" | "homeroom" | "classes" | "email" | "phone", boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [page, setPage] = useState(1);
  const { keyword, setKeyword, category, setCategory, filtered } = useAdminDirectoryFilter({
    items: teachers,
    getSearchText: getTeacherSearchText,
    matchesCategory: matchesTeacherCategory,
    initialCategory: "Semua Kategori",
  });
  const csvImport = useCsvImport({
    endpoint: undefined,
    entityLabel: "data guru",
    onSuccess: () => {
      setKeyword("");
      setCategory("Semua Kategori");
      setPage(1);
      router.refresh();
    },
  });
  const toggleClass = (item: string) => setForm((current) => ({ ...current, classes: current.classes.includes(item) ? current.classes.filter((value) => value !== item) : [...current.classes, item] }));
  const nameIsValid = form.name.trim().length > 0;
  const nipIsValid = form.nip.length === 18;
  const emailIsValid = form.email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const normalizedPhone = form.phone.replace(/[\s()-]/g, "");
  const phoneIsValid = /^\d{8,15}$/.test(normalizedPhone);
  const fieldErrors = {
    name: form.name.trim() ? "" : "Nama lengkap wajib diisi.",
    nip: /^\d{18}$/.test(form.nip) ? "" : "NIP harus tepat 18 digit angka.",
    subject: form.subject ? "" : "Mata pelajaran wajib dipilih.",
    task: form.task ? "" : "Tugas tambahan wajib dipilih.",
    homeroom: form.task !== "Wali Kelas" || form.homeroom ? "" : "Kelas wali wajib dipilih.",
    classes: form.classes.length ? "" : "Pilih minimal satu rombongan belajar.",
    email: !form.email.trim() ? "Email wajib diisi." : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? "" : "Masukkan alamat email yang valid.",
    phone: !form.phone ? "Nomor HP wajib diisi." : phoneIsValid ? "" : "Nomor HP harus 8–15 digit angka.",
  };
  const shouldShowError = (field: keyof typeof fieldErrors) => submitAttempted || Boolean(touched[field]);
  const errorCount = Object.values(fieldErrors).filter(Boolean).length;
  const displayedErrorCount = (Object.keys(fieldErrors) as (keyof typeof fieldErrors)[]).filter((field) => shouldShowError(field) && Boolean(fieldErrors[field])).length;
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (errorCount > 0) return;
    setModal(false);
  };
  const statistics: ManagementStat[] = [
    { label: "Total Guru", value: "58", icon: "users-group-rounded-linear", tone: "primary" },
    { label: "Guru Bersertifikasi", value: "46", icon: "square-academic-cap-linear", tone: "success" },
    { label: "Wali Kelas Ditugaskan", value: "24", icon: "user-circle-linear", tone: "warning" },
  ];

  return (
    <div className={s.teacherManagementPage}>
      <PageHeading breadcrumbs={["LMS", "Manajemen Pengguna", "Manajemen Guru"]} title="Manajemen Guru" description="Direktori staf pendidik, pembagian tugas mengajar, dan kredensial akun guru SMP Terpadu."
        actions={<ManagementHeaderActions onImport={() => csvInputRef.current?.click()} onAdd={() => { setTouched({}); setSubmitAttempted(false); setModal(true); }} addLabel="Tambah Guru Baru" importing={csvImport.loading} />} />
      {/* Bagian tampilan: pemilih CSV serta hasil impor guru. */}
      <input ref={csvInputRef} type="file" accept=".csv,text/csv" hidden onChange={(event) => { const input = event.currentTarget; const file = input.files?.[0] ?? null; input.value = ""; void csvImport.importFile(file); }} aria-label="Pilih file CSV guru" />
      {csvImport.error && <InfoBanner tone="danger">{csvImport.error}</InfoBanner>}
      {csvImport.success && <InfoBanner tone="success">{csvImport.success}</InfoBanner>}
      {csvImport.rowErrorSummary && <InfoBanner tone="warning">Sebagian baris tidak diimpor: {csvImport.rowErrorSummary}</InfoBanner>}
      {/* Bagian tampilan: statistik guru dan staf. */}
      <div className={`${s.statGridThree} ${s.adminStatRow}`}>
        {statistics.map((item) => <ManagementStatCard key={item.label} item={item} />)}
      </div>
      {/* Bagian tampilan: filter direktori guru. */}
      <ManagementToolbar
        keyword={keyword}
        onKeywordChange={setKeyword}
        searchPlaceholder="Cari nama guru, NIP, atau mata pelajaran..."
        category={category}
        onCategoryChange={setCategory}
        categoryOptions={["Semua Kategori", "Aktif", "Terkunci"]}
      />
      {/* Bagian tampilan: tabel guru, mata pelajaran, tugas, dan rombel yang diampu. */}
      <ManagementTable className={s.teacherTableWrap} tableClassName={`${s.dataTable} ${s.teacherTable} ${s.directoryTable}`} footer={<Pagination variant="directory" current={page} total={7} onChange={setPage} label="Menampilkan 1-7 dari 46 guru" />}>
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
            <td><ManagementActionButtons><button type="button" className={s.teacherActionButton} title="Detail" aria-label={`Detail ${teacher.name}`} onClick={() => alert(`${teacher.name}\n${teacher.nip}\n${teacher.subject}`)}><AdminIcon name="eye-linear" size={14} />Detail</button><button type="button" className={s.teacherActionButton} title="Edit" aria-label={`Edit ${teacher.name}`} onClick={() => setModal(true)}><AdminIcon name="pen-linear" size={14} />Edit</button></ManagementActionButtons></td>
          </tr>;
          })}{filtered.length === 0 && <TableEmpty colSpan={8} />}</tbody>
      </ManagementTable>

      {/* Bagian tampilan: modal alokasi akun guru, mata pelajaran, tugas tambahan, dan rombel. */}
      {modal && <Modal className={s.teacherModal} layout="studentForm" title="Tambah Guru & Staf" subtitle="Alokasikan akun pendidik baru, tugas pengampu mata pelajaran, dan wali kelas." onClose={() => setModal(false)} footer={<>{displayedErrorCount > 0 && <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", maxWidth: "220px", color: "var(--color-error)", fontSize: "var(--text-l12-size)", lineHeight: "var(--text-l12-line)" }}><AdminIcon name="danger-triangle-linear" size={16} />Pastikan {displayedErrorCount} kolom bermasalah telah diperbaiki</div>}<span className={s.teacherModalFooterSpacer} /><div className={s.teacherModalFooterActions}><Button variant="outline" className={s.teacherCancelButton} onClick={() => setModal(false)}>Batal</Button><Button type="submit" form="teacher-form" icon="diskette-linear" disabled={displayedErrorCount > 0}>Simpan Guru &amp; Staf</Button></div></>}>
        <form id="teacher-form" onSubmit={handleSubmit} noValidate>
        <InfoBanner tone="primary"><strong>Kredensial Pendidik:</strong><p>NIP/NUPTK digunakan sebagai ID akun resmi. Password sementara digenerate otomatis dan wajib diperbarui pada login pertama.</p></InfoBanner>
        <div className={`${s.formGrid} ${s.teacherFormGrid}`}>
          <Field className={s.teacherModalField} label="Nama Lengkap & Gelar" value={form.name} onChange={(value) => setForm({ ...form, name: value })} onBlur={() => setTouched((current) => ({ ...current, name: true }))} error={shouldShowError("name") ? fieldErrors.name : undefined} required valid={nameIsValid} placeholder="Nama lengkap dan gelar" />
          <Field className={s.teacherModalField} label="NIP / NUPTK" value={form.nip} onChange={(value) => setForm({ ...form, nip: value.replace(/\D/g, "").slice(0, 18) })} onBlur={() => setTouched((current) => ({ ...current, nip: true }))} error={shouldShowError("nip") ? fieldErrors.nip : undefined} required valid={nipIsValid} validLabel="18 Digit Valid" placeholder="Masukkan NIP/NUPTK" inputMode="numeric" maxLength={18} />
          <label className={`${s.formField} ${s.teacherModalField} ${shouldShowError("subject") && fieldErrors.subject ? s.formFieldInvalid : ""}`}><span>Mata Pelajaran Utama <b>*</b></span><select aria-invalid={shouldShowError("subject") && Boolean(fieldErrors.subject)} onBlur={() => setTouched((current) => ({ ...current, subject: true }))} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}><option value="" disabled>Pilih mata pelajaran</option><option>Bahasa Indonesia</option><option>Matematika</option><option>Informatika</option><option>IPA Terpadu</option><option>Bahasa Inggris</option><option>Pendidikan Agama</option></select>{shouldShowError("subject") && fieldErrors.subject && <small className={s.fieldError} role="alert"><AdminIcon name="danger-triangle-linear" size={14} />{fieldErrors.subject}</small>}</label>
          <label className={`${s.formField} ${s.teacherModalField} ${shouldShowError("task") && fieldErrors.task ? s.formFieldInvalid : ""}`}><span>Tugas Tambahan <b>*</b></span><select aria-invalid={shouldShowError("task") && Boolean(fieldErrors.task)} onBlur={() => setTouched((current) => ({ ...current, task: true }))} value={form.task} onChange={(e) => setForm({ ...form, task: e.target.value, homeroom: "" })}><option value="" disabled>Pilih tugas tambahan</option><option>Wali Kelas</option><option>Kepala Lab Komputer</option><option>Pembina Rohis</option><option>Koord. Ekstrakurikuler</option><option>Tidak Ada</option></select>{shouldShowError("task") && fieldErrors.task && <small className={s.fieldError} role="alert"><AdminIcon name="danger-triangle-linear" size={14} />{fieldErrors.task}</small>}</label>
          {form.task === "Wali Kelas" && <div className={s.teacherHomeroomPanel}>
            <div className={s.teacherHomeroomHeader}><strong><AdminIcon name="users-group-rounded-linear" size={15} />Wali Kelas untuk: *</strong><StatusBadge tone="success" className={s.teacherAllocationBadge}>Alokasi Aktif</StatusBadge></div>
            <label className={`${s.formField} ${s.teacherModalField} ${shouldShowError("homeroom") && fieldErrors.homeroom ? s.formFieldInvalid : ""}`}><select required aria-label="Wali Kelas untuk" aria-invalid={shouldShowError("homeroom") && Boolean(fieldErrors.homeroom)} onBlur={() => setTouched((current) => ({ ...current, homeroom: true }))} value={form.homeroom} onChange={(e) => setForm({ ...form, homeroom: e.target.value })}><option value="" disabled>Pilih kelas dan ruang</option><option>Kelas 7D (Ruang 104)</option><option>Kelas 8A (Ruang 201)</option><option>Kelas 9A (Ruang 301)</option></select>{shouldShowError("homeroom") && fieldErrors.homeroom && <small className={s.fieldError} role="alert"><AdminIcon name="danger-triangle-linear" size={14} />{fieldErrors.homeroom}</small>}</label>
          </div>}
          <div className={`${s.formField} ${s.teacherModalField} ${shouldShowError("classes") && fieldErrors.classes ? s.formFieldInvalid : ""}`} role="group" aria-label="Rombongan Belajar yang Diampu" aria-describedby={shouldShowError("classes") && fieldErrors.classes ? "teacher-classes-error" : undefined}><span>Rombongan Belajar yang Diampu <b>*</b></span><div className={s.teacherClassChoices} onBlur={() => setTouched((current) => ({ ...current, classes: true }))}>{["Kelas 7A", "Kelas 7B", "Kelas 7C", "Kelas 7D", "Kelas 8A", "Kelas 8B"].map((item) => {
            const selected = form.classes.includes(item);
            return <label className={`${s.teacherClassChoice} ${selected ? s.teacherClassChoiceSelected : ""}`} key={item}><input type="checkbox" checked={selected} onChange={() => toggleClass(item)} />{selected && <AdminIcon name="check-read-linear" size={13} />}{item}</label>;
          })}<button type="button" className={s.teacherAddClass}>+ Tambah Rombel Lain</button></div>{shouldShowError("classes") && fieldErrors.classes && <small id="teacher-classes-error" className={s.fieldError} role="alert"><AdminIcon name="danger-triangle-linear" size={14} />{fieldErrors.classes}</small>}</div>
          <div className={s.teacherEmailContact}>
            <Field className={s.teacherModalField} label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} onBlur={() => setTouched((current) => ({ ...current, email: true }))} error={shouldShowError("email") ? fieldErrors.email : undefined} required valid={emailIsValid} placeholder="nama@smp.sch.id" type="email" />
            <Field className={s.teacherModalField} label="Kontak" value={form.phone} onChange={(value) => setForm({ ...form, phone: value.replace(/\D/g, "").slice(0, 15) })} onBlur={() => setTouched((current) => ({ ...current, phone: true }))} error={shouldShowError("phone") ? fieldErrors.phone : undefined} required valid={phoneIsValid} placeholder="08xxxxxxxxxx" type="tel" inputMode="numeric" maxLength={15} />
          </div>
        </div>
        </form>
      </Modal>}
    </div>
  );
}
