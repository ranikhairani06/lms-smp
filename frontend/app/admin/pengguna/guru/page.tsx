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
  const [form, setForm] = useState({ name: "", employee_no: "", email: "", phone: "", password: "", password_confirmation: "" });
  const [touched, setTouched] = useState<Partial<Record<"name" | "employee_no" | "email" | "phone" | "password" | "password_confirmation", boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [page, setPage] = useState(1);
  const refreshTeachers = async () => { await teacherResource.reload(); };
  const createTeacher = useAdminMutation("POST", "teachers", async () => { setApiMessageTone("success"); setApiMessage("Data guru berhasil ditambahkan."); setModal(false); await refreshTeachers(); }, refreshTeachers);
  const updateTeacher = useAdminMutation("PUT", `teachers/${editingTeacher?.id ?? "0"}`, async () => { setApiMessageTone("success"); setApiMessage("Data guru berhasil diperbarui."); setModal(false); await refreshTeachers(); }, refreshTeachers);
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
  const isEditing = Boolean(editingTeacher);
  const nameIsValid = form.name.trim().length > 0 && form.name.trim().length <= 255;
  const employeeNoIsValid = form.employee_no.trim().length > 0 && form.employee_no.trim().length <= 100;
  const emailIsValid = form.email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const trimmedPhone = form.phone.trim();
  const normalizedPhone = trimmedPhone.replace(/[\s()-]/g, "");
  const phoneIsValid = !trimmedPhone || (/^\+?\d{8,15}$/.test(normalizedPhone) && trimmedPhone.length <= 50);
  const passwordIsValid = isEditing || form.password.length >= 8;
  const passwordConfirmationIsValid = isEditing || (form.password_confirmation.length > 0 && form.password_confirmation === form.password);
  const fieldErrors = {
    name: !form.name.trim() ? "Nama lengkap wajib diisi." : form.name.trim().length > 255 ? "Nama lengkap maksimal 255 karakter." : "",
    employee_no: !form.employee_no.trim() ? "NIP / Nomor Pegawai wajib diisi." : form.employee_no.trim().length > 100 ? "NIP / Nomor Pegawai maksimal 100 karakter." : "",
    email: !form.email.trim() ? "Email wajib diisi." : emailIsValid ? "" : "Masukkan alamat email yang valid.",
    phone: phoneIsValid ? "" : "Nomor telepon harus terdiri dari 8–15 digit angka.",
    password: isEditing ? "" : !form.password ? "Password wajib diisi." : form.password.length < 8 ? "Password minimal 8 karakter." : "",
    password_confirmation: isEditing ? "" : !form.password_confirmation ? "Konfirmasi password wajib diisi." : form.password_confirmation !== form.password ? "Konfirmasi password tidak cocok." : "",
  };
  const shouldShowError = (field: keyof typeof fieldErrors) => submitAttempted || Boolean(touched[field]);
  const errorCount = Object.values(fieldErrors).filter(Boolean).length;
  const displayedErrorCount = (Object.keys(fieldErrors) as (keyof typeof fieldErrors)[]).filter((field) => shouldShowError(field) && Boolean(fieldErrors[field])).length;
  const remoteErrors = submitAttempted ? (isEditing ? updateTeacher.fieldErrors : createTeacher.fieldErrors) : {};
  const remoteError = (field: keyof typeof fieldErrors) => remoteErrors[field]?.[0];
  const modalError = submitAttempted ? (isEditing ? updateTeacher.error : createTeacher.error) : null;
  const isSubmitting = isEditing ? updateTeacher.loading : createTeacher.loading;
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (errorCount > 0) return;
    const payload: Record<string, string | null> = {
      name: form.name.trim(),
      email: form.email.trim(),
      employee_no: form.employee_no.trim(),
      phone: trimmedPhone ? normalizedPhone : null,
    };
    if (!editingTeacher) {
      payload.password = form.password;
      payload.password_confirmation = form.password_confirmation;
    }
    const result = editingTeacher ? await updateTeacher.run(payload) : await createTeacher.run(payload);
    if (result) {
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
        actions={<ManagementHeaderActions onImport={() => csvInputRef.current?.click()} onAdd={() => { setEditingTeacher(null); setForm({ name: "", employee_no: "", email: "", phone: "", password: "", password_confirmation: "" }); setTouched({}); setSubmitAttempted(false); setModal(true); }} addLabel="Tambah Guru Baru" />} />
      {/* Bagian tampilan: pemilih CSV serta hasil impor guru. */}
      <input ref={csvInputRef} type="file" accept=".csv,text/csv" hidden onChange={(event) => { const input = event.currentTarget; input.value = ""; setApiMessageTone("warning"); setApiMessage("Impor data guru belum didukung oleh layanan."); }} aria-label="Pilih file CSV guru" />
      {apiMessage && <InfoBanner tone={apiMessageTone}>{apiMessage}</InfoBanner>}
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
            <td><ManagementActionButtons><button type="button" className={s.teacherActionButton} title="Edit" aria-label={`Edit ${teacher.name}`} onClick={() => { setEditingTeacher({ id: teacher.id, employee_no: teacher.nip, phone: teacher.phone, user: { name: teacher.name, email: teacher.email } }); setForm({ name: teacher.name, employee_no: teacher.nip, email: teacher.email, phone: teacher.phone, password: "", password_confirmation: "" }); setTouched({}); setSubmitAttempted(false); setModal(true); }}>Edit</button><button type="button" className={s.teacherActionButton} title="Hapus" aria-label={`Hapus ${teacher.name}`} disabled={removeTeacher.loading} onClick={() => setDeleteTeacher({ id: teacher.id, employee_no: teacher.nip, user: { name: teacher.name, email: teacher.email } })}><AdminIcon name="trash-bin-trash-linear" size={14} />Hapus</button></ManagementActionButtons></td>
          </tr>;
          })}{filtered.length === 0 && <TableEmpty colSpan={7} />}</tbody>
      </ManagementTable>

      {/* Bagian tampilan: modal tambah dan edit akun guru sesuai kontrak backend. */}
      {modal && <Modal className={s.teacherModal} title={isEditing ? "Edit Guru" : "Tambah Guru"} subtitle={isEditing ? "Perbarui informasi akun dan data guru." : "Daftarkan akun guru baru ke sistem portal LMS."} onClose={() => setModal(false)} footer={<>{displayedErrorCount > 0 && <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", maxWidth: "220px", color: "var(--color-error)", fontSize: "var(--text-l12-size)", lineHeight: "var(--text-l12-line)" }}><AdminIcon name="danger-triangle-linear" size={16} />Pastikan {displayedErrorCount} kolom bermasalah telah diperbaiki</div>}<span className={s.teacherModalFooterSpacer} /><div className={s.teacherModalFooterActions}><Button variant="outline" className={s.teacherCancelButton} onClick={() => setModal(false)} disabled={isSubmitting}>Batal</Button><Button type="submit" form="teacher-form" icon="diskette-linear" disabled={displayedErrorCount > 0 || isSubmitting}>{isSubmitting ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Simpan Guru"}</Button></div></>}>
        <form id="teacher-form" onSubmit={handleSubmit} noValidate>
          {modalError && <InfoBanner tone="danger">{modalError}</InfoBanner>}
          <div className={`${s.formGrid} ${s.teacherFormGrid}`}>
            <Field className={s.teacherModalField} label="Nama Lengkap & Gelar" value={form.name} onChange={(value) => setForm({ ...form, name: value })} onBlur={() => setTouched((current) => ({ ...current, name: true }))} error={remoteError("name") ?? (shouldShowError("name") ? fieldErrors.name : undefined)} required valid={nameIsValid} placeholder="Contoh: Budi Santoso, S.Pd." maxLength={255} />
            <Field className={s.teacherModalField} label="NIP / Nomor Pegawai" value={form.employee_no} onChange={(value) => setForm({ ...form, employee_no: value })} onBlur={() => setTouched((current) => ({ ...current, employee_no: true }))} error={remoteError("employee_no") ?? (shouldShowError("employee_no") ? fieldErrors.employee_no : undefined)} required valid={employeeNoIsValid} placeholder="Masukkan NIP atau nomor pegawai" maxLength={100} />
            <div className={s.teacherEmailContact}>
              <Field className={s.teacherModalField} label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} onBlur={() => setTouched((current) => ({ ...current, email: true }))} error={remoteError("email") ?? (shouldShowError("email") ? fieldErrors.email : undefined)} required valid={emailIsValid} placeholder="nama@smp.sch.id" type="email" />
              <Field className={s.teacherModalField} label="Nomor Telepon" value={form.phone} onChange={(value) => setForm({ ...form, phone: value.replace(/[^\d+\-\s()]/g, "").slice(0, 50) })} onBlur={() => setTouched((current) => ({ ...current, phone: true }))} error={remoteError("phone") ?? (shouldShowError("phone") ? fieldErrors.phone : undefined)} valid={trimmedPhone.length > 0 ? phoneIsValid : undefined} placeholder="08xxxxxxxxxx (opsional)" type="tel" inputMode="tel" maxLength={50} />
            </div>
            {!isEditing && <div className={s.teacherEmailContact}>
              <Field className={s.teacherModalField} label="Password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} onBlur={() => setTouched((current) => ({ ...current, password: true }))} error={remoteError("password") ?? (shouldShowError("password") ? fieldErrors.password : undefined)} required valid={passwordIsValid} placeholder="Minimal 8 karakter" type="password" />
              <Field className={s.teacherModalField} label="Konfirmasi Password" value={form.password_confirmation} onChange={(value) => setForm({ ...form, password_confirmation: value })} onBlur={() => setTouched((current) => ({ ...current, password_confirmation: true }))} error={remoteError("password_confirmation") ?? (shouldShowError("password_confirmation") ? fieldErrors.password_confirmation : undefined)} required valid={passwordConfirmationIsValid} placeholder="Ulangi password" type="password" />
            </div>}
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
