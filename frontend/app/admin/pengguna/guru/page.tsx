"use client";

import { useRef, useState, type FormEvent } from "react";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import useAdminDirectoryFilter from "@/app/admin/_components/useAdminDirectoryFilter";
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
import { ErrorState, LoadingState } from "@/components/lms/state";
import { useAdminMutation, useAdminResource } from "@/app/admin/_components/useAdminApi";

type TeacherDirectoryItem = { name: string; nip: string; subject: string; status: string };
type ApiTeacher = { id: number; employee_no: string; phone?: string | null; user?: { name?: string; email?: string | null; is_active?: boolean; must_change_password?: boolean } };

const getTeacherSearchText = (teacher: TeacherDirectoryItem) => `${teacher.name} ${teacher.nip} ${teacher.subject}`;
const matchesTeacherCategory = (teacher: TeacherDirectoryItem, category: string) => {
  if (category === "Semua Kategori") return true;
  if (category === "Terkunci") return teacher.status === "Nonaktif" || teacher.status === "Terkunci";
  return teacher.status === category;
};

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
  const csvInputRef = useRef<HTMLInputElement>(null);
  const teacherResource = useAdminResource<ApiTeacher[]>("teachers");
  const [apiMessage, setApiMessage] = useState("");
  const [apiMessageTone, setApiMessageTone] = useState<"success" | "warning">("success");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [editingTeacher, setEditingTeacher] = useState<ApiTeacher | null>(null);
  const [deleteTeacher, setDeleteTeacher] = useState<ApiTeacher | null>(null);
  const teacherRows = (teacherResource.data ?? []).map((item) => ({
    id: item.id,
    name: item.user?.name ?? "—",
    nip: item.employee_no,
    subject: "—",
    task: "-",
    classes: "",
    status: item.user?.is_active === false ? "Nonaktif" : item.user?.must_change_password ? "Belum Ganti Password" : "Aktif",
    activity: "—",
    email: item.user?.email ?? "",
    phone: item.phone ?? "",
  }));
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", nip: "", subject: "", task: "", homeroom: "", classes: [] as string[], email: "", phone: "" });
  const [touched, setTouched] = useState<Partial<Record<"name" | "nip" | "subject" | "task" | "homeroom" | "classes" | "email" | "phone", boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [page, setPage] = useState(1);
  const refreshTeachers = async () => { await teacherResource.reload(); };
  const createTeacher = useAdminMutation("POST", "teachers", async () => { setApiMessage("Data guru berhasil ditambahkan."); setModal(false); await refreshTeachers(); }, refreshTeachers);
  const updateTeacher = useAdminMutation("PUT", `teachers/${editingTeacher?.id ?? "0"}`, async () => { setApiMessage("Data guru berhasil diperbarui."); setModal(false); await refreshTeachers(); }, refreshTeachers);
  const removeTeacher = useAdminMutation("DELETE", `teachers/${deleteTeacher?.id ?? "0"}`, async () => { setApiMessage("Data guru berhasil dihapus."); setApiMessageTone("success"); setDeleteTeacher(null); await refreshTeachers(); }, refreshTeachers);
  const { keyword, setKeyword, category, setCategory, filtered } = useAdminDirectoryFilter({
    items: teacherRows,
    getSearchText: getTeacherSearchText,
    matchesCategory: matchesTeacherCategory,
    initialCategory: "Semua Kategori",
  });
  const changeKeyword = (value: string) => {
    setKeyword(value);
    setPage(1);
  };
  const changeCategory = (value: string) => {
    setCategory(value);
    setPage(1);
  };
  const toggleClass = (item: string) => setForm((current) => ({ ...current, classes: current.classes.includes(item) ? current.classes.filter((value) => value !== item) : [...current.classes, item] }));
  const nameIsValid = form.name.trim().length > 0;
  const nipIsValid = form.nip.length === 18;
  const emailIsValid = form.email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const normalizedPhone = form.phone.replace(/[\s()-]/g, "");
  const phoneIsValid = /^\d{8,15}$/.test(normalizedPhone);
  const fieldErrors = {
    name: form.name.trim() ? "" : "Nama lengkap wajib diisi.",
    nip: /^\d{18}$/.test(form.nip) ? "" : "NIP harus tepat 18 digit angka.",
    subject: "",
    task: "",
    homeroom: "",
    classes: "",
    email: !form.email.trim() ? "Email wajib diisi." : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? "" : "Masukkan alamat email yang valid.",
    phone: !form.phone ? "Nomor HP wajib diisi." : phoneIsValid ? "" : "Nomor HP harus 8–15 digit angka.",
  };
  const shouldShowError = (field: keyof typeof fieldErrors) => submitAttempted || Boolean(touched[field]);
  const errorCount = Object.values(fieldErrors).filter(Boolean).length;
  const displayedErrorCount = (Object.keys(fieldErrors) as (keyof typeof fieldErrors)[]).filter((field) => shouldShowError(field) && Boolean(fieldErrors[field])).length;
  const remoteErrors = editingTeacher ? updateTeacher.fieldErrors : createTeacher.fieldErrors;
  const remoteError = (field: "name" | "nip" | "email" | "phone") => remoteErrors[field === "nip" ? "employee_no" : field]?.[0];
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (errorCount > 0) return;
    const payload: Record<string, string> = {
      name: form.name.trim(),
      employee_no: form.nip,
      email: form.email.trim(),
      phone: form.phone ? normalizedPhone : "",
    };
    let generatedPassword = "";
    if (!editingTeacher) {
      generatedPassword = `Lms-${crypto.randomUUID()}!`;
      payload.password = generatedPassword;
      payload.password_confirmation = generatedPassword;
    }
    const result = editingTeacher ? await updateTeacher.run(payload) : await createTeacher.run(payload);
    if (result) {
      setTemporaryPassword(generatedPassword);
      setApiMessage(editingTeacher ? "Data guru berhasil diperbarui." : "Data guru berhasil ditambahkan.");
      setEditingTeacher(null);
    }
  };
  const statistics: ManagementStat[] = [
    { label: "Total Guru", value: String(teacherRows.length), icon: "users-group-rounded-linear", tone: "primary" },
  ];
  const pageRows = filtered.slice((page - 1) * 7, page * 7);

  return (
    <div className={s.teacherManagementPage}>
      <PageHeading breadcrumbs={["LMS", "Manajemen Pengguna", "Manajemen Guru"]} title="Manajemen Guru" description="Direktori staf pendidik, pembagian tugas mengajar, dan kredensial akun guru SMP Terpadu."
        actions={<ManagementHeaderActions onImport={() => csvInputRef.current?.click()} onAdd={() => { setEditingTeacher(null); setTemporaryPassword(""); setForm({ name: "", nip: "", subject: "", task: "", homeroom: "", classes: [], email: "", phone: "" }); setTouched({}); setSubmitAttempted(false); setModal(true); }} addLabel="Tambah Guru Baru" />} />
      {/* Bagian tampilan: pemilih CSV serta hasil impor guru. */}
      <input ref={csvInputRef} type="file" accept=".csv,text/csv" hidden onChange={(event) => { const input = event.currentTarget; input.value = ""; setApiMessageTone("warning"); setApiMessage("Impor data guru belum didukung oleh layanan."); }} aria-label="Pilih file CSV guru" />
      {apiMessage && <InfoBanner tone={createTeacher.error || updateTeacher.error ? "danger" : apiMessageTone}>{apiMessage}{temporaryPassword && <> Kata sandi sementara: {temporaryPassword}</>}</InfoBanner>}
      {(createTeacher.error || updateTeacher.error) && !apiMessage && <InfoBanner tone="danger">{createTeacher.error ?? updateTeacher.error}</InfoBanner>}
      {teacherResource.loading && <LoadingState title="Memuat data guru..." />}
      {teacherResource.error && <ErrorState title={teacherResource.error} action={<Button variant="outline" onClick={() => void refreshTeachers()}>Coba Lagi</Button>} />}
      {/* Bagian tampilan: statistik guru. */}
      <div className={`${s.statGridThree} ${s.adminStatRow}`}>
        {statistics.map((item) => <ManagementStatCard key={item.label} item={item} />)}
      </div>
      {/* Bagian tampilan: filter direktori guru. */}
      <ManagementToolbar
        keyword={keyword}
        onKeywordChange={changeKeyword}
        searchPlaceholder="Cari nama guru, NIP, atau mata pelajaran..."
        category={category}
        onCategoryChange={changeCategory}
        categoryOptions={["Semua Kategori", "Aktif", "Terkunci", "Belum Ganti Password"]}
      />
      {/* Bagian tampilan: tabel guru, mata pelajaran, dan rombel yang diampu. */}
      <ManagementTable className={s.teacherTableWrap} tableClassName={`${s.dataTable} ${s.teacherTable} ${s.directoryTable}`} footer={<Pagination variant="directory" current={page} total={Math.max(1, Math.ceil(filtered.length / 7))} onChange={setPage} label={`Menampilkan ${filtered.length ? (page - 1) * 7 + 1 : 0}-${Math.min(page * 7, filtered.length)} dari ${filtered.length} guru`} />}>
          <thead><tr><th>Nama Guru</th><th>NIP</th><th>Mata Pelajaran</th><th>Rombel Diampu</th><th>Status &amp; Kredensial</th><th>Aktivitas Terakhir</th><th>Aksi</th></tr></thead>
          <tbody>{pageRows.map((teacher) => {
            const subjectTone = subjectTones[teacher.subject] ?? "primary";
            const statusTone = teacher.status.startsWith("Aktif") ? "primary" : teacher.status.startsWith("Terkunci") ? "danger" : "warning";
            const statusClass = statusTone === "primary" ? s.teacherStatusActive : statusTone === "danger" ? s.teacherStatusError : s.teacherStatusWarning;
            const classNames = teacher.classes.match(/\+?\d+[A-Z]?/g) ?? [];

            return <tr key={teacher.nip}>
            <td><span className={`${s.tableStrong} ${s.teacherName}`}>{teacher.name}</span></td><td className={s.teacherNip}>{teacher.nip}</td>
            <td><StatusBadge tone={subjectTone} className={s.teacherBadge}>{teacher.subject}</StatusBadge></td>
            <td><div className={s.teacherClassList}>{classNames.map((className) => <span key={`${teacher.nip}-${className}`} className={s.teacherClassChip}>{className}</span>)}</div></td>
            <td><StatusBadge tone={statusTone} className={`${s.teacherBadge} ${s.directoryBadge} ${s.directoryStatusBadge} ${s.teacherStatus} ${statusClass}`}>{teacher.status}</StatusBadge></td><td className={s.teacherActivity}>{teacher.activity}</td>
            <td><ManagementActionButtons><button type="button" className={s.teacherActionButton} title="Edit" aria-label={`Edit ${teacher.name}`} onClick={() => { setEditingTeacher({ id: teacher.id, employee_no: teacher.nip, phone: teacher.phone, user: { name: teacher.name, email: teacher.email } }); setForm({ name: teacher.name, nip: teacher.nip, subject: "", task: "", homeroom: "", classes: [], email: teacher.email, phone: teacher.phone }); setTouched({}); setSubmitAttempted(false); setModal(true); }}>Edit</button><button type="button" className={s.teacherActionButton} title="Hapus" aria-label={`Hapus ${teacher.name}`} disabled={removeTeacher.loading} onClick={() => setDeleteTeacher({ id: teacher.id, employee_no: teacher.nip, user: { name: teacher.name, email: teacher.email } })}><AdminIcon name="trash-bin-trash-linear" size={14} />Hapus</button></ManagementActionButtons></td>
          </tr>;
          })}{filtered.length === 0 && <TableEmpty colSpan={7} />}</tbody>
      </ManagementTable>

      {/* Bagian tampilan: modal alokasi akun guru, mata pelajaran, tugas tambahan, dan rombel. */}
      {modal && <Modal className={s.teacherModal} layout="studentForm" title="Tambah Guru & Staf" subtitle="Alokasikan akun pendidik baru, tugas pengampu mata pelajaran, dan wali kelas." onClose={() => setModal(false)} footer={<>{displayedErrorCount > 0 && <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", maxWidth: "220px", color: "var(--color-error)", fontSize: "var(--text-l12-size)", lineHeight: "var(--text-l12-line)" }}><AdminIcon name="danger-triangle-linear" size={16} />Pastikan {displayedErrorCount} kolom bermasalah telah diperbaiki</div>}<span className={s.teacherModalFooterSpacer} /><div className={s.teacherModalFooterActions}><Button variant="outline" className={s.teacherCancelButton} onClick={() => setModal(false)}>Batal</Button><Button type="submit" form="teacher-form" icon="diskette-linear" disabled={displayedErrorCount > 0}>Simpan Guru &amp; Staf</Button></div></>}>
        <form id="teacher-form" onSubmit={handleSubmit} noValidate>
        <InfoBanner tone="primary"><strong>Kredensial Pendidik:</strong><p>NIP/NUPTK digunakan sebagai ID akun resmi. Password sementara digenerate otomatis dan wajib diperbarui pada login pertama.</p></InfoBanner>
        <div className={`${s.formGrid} ${s.teacherFormGrid}`}>
          <Field className={s.teacherModalField} label="Nama Lengkap & Gelar" value={form.name} onChange={(value) => setForm({ ...form, name: value })} onBlur={() => setTouched((current) => ({ ...current, name: true }))} error={remoteError("name") ?? (shouldShowError("name") ? fieldErrors.name : undefined)} required valid={nameIsValid} placeholder="Nama lengkap dan gelar" />
          <Field className={s.teacherModalField} label="NIP / NUPTK" value={form.nip} onChange={(value) => setForm({ ...form, nip: value.replace(/\D/g, "").slice(0, 18) })} onBlur={() => setTouched((current) => ({ ...current, nip: true }))} error={remoteError("nip") ?? (shouldShowError("nip") ? fieldErrors.nip : undefined)} required valid={nipIsValid} validLabel="18 Digit Valid" placeholder="Masukkan NIP/NUPTK" inputMode="numeric" maxLength={18} />
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
            <Field className={s.teacherModalField} label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} onBlur={() => setTouched((current) => ({ ...current, email: true }))} error={remoteError("email") ?? (shouldShowError("email") ? fieldErrors.email : undefined)} required valid={emailIsValid} placeholder="nama@smp.sch.id" type="email" />
            <Field className={s.teacherModalField} label="Kontak" value={form.phone} onChange={(value) => setForm({ ...form, phone: value.replace(/\D/g, "").slice(0, 15) })} onBlur={() => setTouched((current) => ({ ...current, phone: true }))} error={remoteError("phone") ?? (shouldShowError("phone") ? fieldErrors.phone : undefined)} required valid={phoneIsValid} placeholder="08xxxxxxxxxx" type="tel" inputMode="numeric" maxLength={15} />
          </div>
        </div>
        </form>
      </Modal>}
      {deleteTeacher && <Modal title="Hapus data guru & staf?" subtitle={deleteTeacher.user?.name ?? deleteTeacher.employee_no} onClose={() => { if (!removeTeacher.loading) setDeleteTeacher(null); }} footer={<><Button variant="outline" disabled={removeTeacher.loading} onClick={() => setDeleteTeacher(null)}>Batal</Button><Button variant="danger" disabled={removeTeacher.loading} onClick={() => { void removeTeacher.run(); }}>{removeTeacher.loading ? "Menghapus..." : "Ya, Hapus"}</Button></>}>
        <p className={s.pageDescription}>Data guru &amp; staf “{deleteTeacher.user?.name ?? deleteTeacher.employee_no}” akan dihapus.</p>
        {removeTeacher.error && <InfoBanner tone="danger">{removeTeacher.error}</InfoBanner>}
      </Modal>}
    </div>
  );
}
