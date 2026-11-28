"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
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
import {
  AdminTableIconButton,
  Button,
  InfoBanner,
  ManagementHeaderActions,
  TableEmpty,
  adminStyles as s
} from "@/app/admin/_components/AdminUI";
import { ErrorState, LoadingState } from "@/components/lms/state";
import { ApiError, apiRequest } from "@/lib/api";
import { isAllowedUploadExtension, MAX_UPLOAD_FILE_SIZE_BYTES, MAX_UPLOAD_FILE_SIZE_LABEL, uploadAccept, uploadExtensionsLabel } from "@/lib/uploadLimits";
import { useAdminMutation, useAdminResource } from "@/app/admin/_components/useAdminApi";



type Guardian = { name: string; relationship: string };
type Student = { id?: number; nisn: string; name: string; rombel: string; gender: string; status: string; activity: string; nik?: string; birthplace?: string; birthdate?: string; guardian?: Guardian };
const emptyStudent: Student = { nisn: "", name: "\u2014", rombel: "\u2014", gender: "\u2014", status: "", activity: "\u2014" };
type RombelData = { id?: number; code: string; wali: string; filled: number; capacity: number | null; grade_level?: number };
type FormFieldKey = "name" | "nisn" | "nik" | "birthplace" | "birthdate" | "gender" | "rombel";
type ApiStudent = { id: number; nisn: string; birth_date: string; cohort_year: number; class_room_id: number | null; user?: { name?: string; is_active?: boolean; must_change_password?: boolean }; class_room?: { id: number; name: string } | null };
type ApiClass = { id: number; name: string; grade_level: number; students_count: number; is_active: boolean };
const getStudentSearchText = (student: Student) => `${student.name} ${student.nisn}`;
const matchesStudentCategory = (student: Student, category: string) => category === "Semua Kategori" || student.status.includes(category);

const formatRombel = (rombel: Pick<RombelData, "code" | "wali">) => `Kelas ${rombel.code} — Wali: ${rombel.wali}`;

export default function SiswaPage() {
  const router = useRouter();
  const csvInputRef = useRef<HTMLInputElement>(null);
  const studentResource = useAdminResource<ApiStudent[]>("students");
  const classResource = useAdminResource<ApiClass[]>("classes");
  const [studentsError, setStudentsError] = useState("");
  const [studentsSuccess, setStudentsSuccess] = useState("");
  const [importBusy, setImportBusy] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const students: Student[] = (studentResource.data ?? []).map((item) => ({
    id: item.id,
    nisn: item.nisn,
    name: item.user?.name ?? "—",
    rombel: item.class_room?.name?.replace(/^Kelas\s+/i, "") ?? "—",
    gender: "—",
    status: item.user?.is_active === false ? "Nonaktif" : item.user?.must_change_password ? "Belum Ganti Password" : "Aktif",
    activity: "—",
    birthdate: item.birth_date,
  }));
  const rombelData: RombelData[] = (classResource.data ?? []).map((item) => ({
    id: item.id,
    code: item.name.replace(/^Kelas\s+/i, ""),
    wali: "",
    filled: item.students_count,
    capacity: null,
    grade_level: item.grade_level,
  }));
  const [modal, setModal] = useState<"add" | "edit" | "detail" | "reset" | null>(null);
  const [selected, setSelected] = useState<Student>(emptyStudent);
  const [deleteSelected, setDeleteSelected] = useState<Student | null>(null);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ name: "", nisn: "", nik: "", birthplace: "", birthdate: "", gender: "Laki-laki", rombel: "" });
  const [touched, setTouched] = useState<Partial<Record<FormFieldKey, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [verified, setVerified] = useState(false);
  const refreshData = async () => { await Promise.all([studentResource.reload(), classResource.reload()]); };
  const createStudent = useAdminMutation("POST", "students", async () => { setStudentsSuccess("Data siswa berhasil disimpan."); setModal(null); await refreshData(); }, refreshData);
  const updateStudent = useAdminMutation("PUT", `students/${selected.id ?? "0"}`, async () => { setStudentsSuccess("Data siswa berhasil diperbarui."); setModal(null); await refreshData(); }, refreshData);
  const resetStudentPassword = useAdminMutation("POST", `students/${selected.id ?? "0"}/reset-password`, async () => { setStudentsSuccess("Kata sandi siswa berhasil direset."); setModal(null); await refreshData(); }, refreshData);
  const deleteStudent = useAdminMutation("DELETE", `students/${deleteSelected?.id ?? "0"}`, async () => { setStudentsSuccess("Data siswa berhasil dihapus."); setDeleteSelected(null); await refreshData(); }, refreshData);
  const { keyword, setKeyword, category, setCategory, filtered } = useAdminDirectoryFilter({
    items: students,
    getSearchText: getStudentSearchText,
    matchesCategory: matchesStudentCategory,
    initialCategory: "Semua Kategori",
  });
  const pageRows = filtered.slice((page - 1) * 7, page * 7);
  const importStudents = async (file: File | null) => {
    setImportError("");
    setImportSuccess("");
    if (!file) return;
    if (!isAllowedUploadExtension(file.name, "adminStudentImport") || file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
      setImportError(`Pilih berkas ${uploadExtensionsLabel("adminStudentImport")} berukuran maksimal ${MAX_UPLOAD_FILE_SIZE_LABEL}.`);
      return;
    }
    setImportBusy(true);
    const payload = new FormData();
    payload.append("file", file);
    try {
      const result = await apiRequest<{ message?: string; imported?: number }>("admin/students/import", { method: "POST", body: payload });
      setImportSuccess(result.message ?? `${result.imported ?? 0} siswa berhasil diimpor.`);
      await refreshData();
    } catch (error) {
      if (error instanceof ApiError) {
        const details = error.details as { failures?: Array<{ row?: number; errors?: string[] }> } | undefined;
        const failures = details?.failures ?? [];
        if (failures.length) setImportError(`${error.message} ${failures.slice(0, 3).map((failure) => `Baris ${failure.row ?? "?"}: ${(failure.errors ?? []).join(", ")}`).join("; ")}`);
        else setImportError(error.message);
        if (error.status === 404) await refreshData();
        if (error.status === 401) router.replace("/login?role=admin&reason=session-expired");
      } else setImportError("Import data siswa gagal. Silakan coba lagi.");
    } finally {
      setImportBusy(false);
    }
  };

  const selectedRombel = rombelData.find((rombel) => formatRombel(rombel) === form.rombel);
  const selectedRombelCode = selectedRombel?.code ?? "";
  const duplicateStudent = form.nisn.length === 10
    ? students.find((student) => student.nisn === form.nisn && !(modal === "edit" && student.nisn === selected.nisn))
    : undefined;
  const editingCurrentFullRombel = modal === "edit" && selected.rombel === selectedRombelCode;
  const selectedRombelIsFull = Boolean(selectedRombel?.capacity !== null && selectedRombel && selectedRombel.filled >= selectedRombel.capacity);
  const rombelIsFull = selectedRombelIsFull && !editingCurrentFullRombel;
  const fieldErrors: Record<FormFieldKey, string> = {
    name: form.name.trim() ? "" : "Nama lengkap wajib diisi.",
    nisn: !form.nisn ? "NISN wajib diisi." : form.nisn.length !== 10 ? "NISN harus terdiri dari 10 digit angka." : duplicateStudent ? `NISN ${form.nisn} sudah terdaftar atas nama ${duplicateStudent.name}. Masukkan NISN yang valid.` : "",
    nik: form.nik && form.nik.length !== 16 ? "NIK harus terdiri dari 16 digit angka." : "",
    birthplace: "",
    birthdate: form.birthdate.trim() ? "" : "Tanggal lahir wajib diisi untuk generate kata sandi default siswa.",
    gender: form.gender ? "" : "Pilih jenis kelamin.",
    rombel: !selectedRombel ? "Pilih rombongan belajar." : rombelIsFull ? "Rombongan belajar ini sudah penuh." : "",
  };
  const errorCount = Object.values(fieldErrors).filter(Boolean).length;
  const shouldShowError = (field: FormFieldKey) => submitAttempted || Boolean(touched[field]);
  const displayedErrorCount = (Object.keys(fieldErrors) as FormFieldKey[]).filter((field) => shouldShowError(field) && Boolean(fieldErrors[field])).length;
  const genderErrorShown = Boolean(fieldErrors.gender && shouldShowError("gender"));
  const rombelErrorShown = Boolean(fieldErrors.rombel && shouldShowError("rombel"));
  const requiredFieldsReady = Boolean(form.name.trim() && form.nisn.length === 10 && form.birthdate.trim() && selectedRombel && !rombelIsFull);
  const canSave = requiredFieldsReady && errorCount === 0;
  const serverErrors = modal === "edit" ? updateStudent.fieldErrors : createStudent.fieldErrors;
  const serverFieldError = (field: FormFieldKey) => {
    const key = field === "birthdate" ? "birth_date" : field === "rombel" ? "class_room_id" : field;
    return serverErrors[key]?.[0];
  };

  const openModal = (type: "add" | "edit" | "detail" | "reset", student?: Student) => {
    if (student) {
      setSelected(student);
      const studentRombel = rombelData.find((rombel) => rombel.code === student.rombel);
      setForm({ name: student.name, nisn: student.nisn, nik: student.nik ?? "", birthplace: student.birthplace ?? "", birthdate: student.birthdate ? new Date(student.birthdate).toLocaleDateString("en-GB") : "", gender: student.gender, rombel: studentRombel ? formatRombel(studentRombel) : "" });
    } else {
      setSelected(emptyStudent);
      const preferredRombel = rombelData.find((rombel) => rombel.code === "8B" && rombel.capacity !== null && rombel.filled < rombel.capacity)
        ?? rombelData.find((rombel) => rombel.capacity !== null && rombel.filled < rombel.capacity);
      setForm({ name: "", nisn: "", nik: "", birthplace: "", birthdate: "", gender: "Laki-laki", rombel: preferredRombel ? formatRombel(preferredRombel) : "" });
    }
    setTouched({});
    setSubmitAttempted(false);
    setVerified(false);
    setModal(type);
  };

  const saveStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (!canSave || !selectedRombel) return;
    const [day, month, year] = form.birthdate.split(/[/.\-]/);
    const payload = {
      name: form.name.trim(),
      nisn: form.nisn,
      birth_date: year && month && day ? `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}` : form.birthdate,
      cohort_year: new Date().getFullYear() - Math.max(0, (selectedRombel.grade_level ?? 7) - 7),
      class_room_id: selectedRombel.id ?? null,
    };
    const saved = modal === "edit" ? await updateStudent.run(payload) : await createStudent.run(payload);
    if (!saved) setStudentsError(modal === "edit" ? updateStudent.error ?? "Data siswa gagal disimpan." : createStudent.error ?? "Data siswa gagal disimpan.");
    else setStudentsError("");
  };

  const updateFormField = (field: FormFieldKey, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const renderTextField = (field: Exclude<FormFieldKey, "gender" | "rombel">, label: string, placeholder: string, required = false, fullWidth = false, trailingIcon?: string, labelHint?: string) => {
    const error = fieldErrors[field] || serverFieldError(field);
    const showError = Boolean(error && (shouldShowError(field) || Boolean(serverFieldError(field))));
    const isValid = Boolean(form[field].trim() && !error);
    return (
      <Field
        key={field}
        label={label}
        value={form[field]}
        onChange={(value) => updateFormField(field, field === "nisn" ? value.replace(/\D/g, "").slice(0, 10) : field === "nik" ? value.replace(/\D/g, "").slice(0, 16) : value)}
        onBlur={() => setTouched((current) => ({ ...current, [field]: true }))}
        placeholder={placeholder}
        required={required}
        inputMode={field === "nisn" || field === "nik" ? "numeric" : undefined}
        maxLength={field === "nisn" ? 10 : field === "nik" ? 16 : undefined}
        error={showError ? error : undefined}
        valid={isValid}
        trailingIcon={trailingIcon}
        labelHint={labelHint}
        className={fullWidth ? s.formFull : ""}
      />
    );
  };

  const statistics: ManagementStat[] = [
    { label: "Total Siswa Terdaftar", value: String(students.length), icon: "users-group-rounded-linear", tone: "primary" },
    { label: "Siswa Aktif Login", value: "—", icon: "user-check-linear", tone: "success" },
    { label: "Belum Ganti Password", value: String((studentResource.data ?? []).filter((item) => item.user?.must_change_password).length), icon: "lock-keyhole-linear", tone: "warning" },
    { label: "Perlu Verifikasi NISN", value: "—", icon: "clipboard-check-linear", tone: "danger" },
  ];

  return (
    <>
      
      <PageHeading
        breadcrumbs={["LMS", "Manajemen Pengguna", "Manajemen Siswa"]}
        title="Manajemen Siswa"
        description="Pengelolaan basis data peserta didik, alokasi kelas rombel, status kredensial NISN, dan verifikasi akun portal siswa."
        actions={<ManagementHeaderActions onImport={() => csvInputRef.current?.click()} onAdd={() => openModal("add")} addLabel="Tambah Siswa" importing={importBusy} />}
      />

      {/* Bagian tampilan: pemilih CSV serta hasil impor siswa. */}
      <input ref={csvInputRef} type="file" accept={uploadAccept("adminStudentImport")} hidden onChange={(event) => { const input = event.currentTarget; const file = input.files?.[0] ?? null; input.value = ""; void importStudents(file); }} aria-label="Pilih file Excel siswa" />
      {importError && <InfoBanner tone="danger">{importError}</InfoBanner>}
      {importSuccess && <InfoBanner tone="success">{importSuccess}</InfoBanner>}
      {studentsError && <InfoBanner tone="danger">{studentsError}</InfoBanner>}
      {studentsSuccess && <InfoBanner tone="success">{studentsSuccess}</InfoBanner>}
      {(studentResource.error || classResource.error) && <ErrorState title={studentResource.error ?? classResource.error ?? "Data belum dapat dimuat."} action={<Button variant="outline" onClick={() => void refreshData()}>Coba Lagi</Button>} />}
      {(studentResource.loading || classResource.loading) && <LoadingState title="Memuat data siswa..." />}

      {/* Bagian tampilan: kartu ringkasan akun peserta didik. */}
      <div className={`${s.statGridFour} ${s.adminStatRow}`}>
        {statistics.map((item) => <ManagementStatCard key={item.label} item={item} variant="student" />)}
      </div>
      {/* Bagian tampilan: pencarian dan penyaringan direktori siswa. */}
      <ManagementToolbar keyword={keyword} onKeywordChange={setKeyword} searchPlaceholder="Cari nama / NISN..." category={category} onCategoryChange={setCategory} categoryOptions={["Semua Kategori", "Aktif", "Terkunci", "Belum Aktivasi"]} variant="student" />
      {/* Bagian tampilan: tabel peserta didik beserta aksi detail, edit, dan reset kredensial. */}
      <ManagementTable variant="student" tableClassName={`${s.dataTable} ${s.studentDataTable}`} footer={<Pagination className={s.studentPagination} variant="directory" current={page} total={Math.max(1, Math.ceil(filtered.length / 7))} onChange={setPage} label={`Menampilkan ${filtered.length ? (page - 1) * 7 + 1 : 0}-${Math.min(page * 7, filtered.length)} dari ${filtered.length} siswa`} emphasizeLabelNumbers />}>
          <thead><tr><th>NISN</th><th>Nama Siswa</th><th>Rombel / Kelas</th><th>Jenis Kelamin</th><th>Status Akun LMS</th><th>Aktivitas Terakhir</th><th>Aksi</th></tr></thead>
          <tbody>
            {pageRows.map((student) => (
              <tr key={student.nisn}>
                <td>{student.nisn}</td><td><span className={s.tableStrong}>{student.name}</span></td><td><span className={s.levelTag}>{student.rombel}</span></td><td>{student.gender}</td>
        <td><StatusBadge className={s.studentStatusPill} tone={student.status.startsWith("Aktif") ? "info" : student.status.startsWith("Terkunci") ? "danger" : "neutral"}>{student.status}</StatusBadge></td><td>{student.activity}</td>
                <td><ManagementActionButtons className={student.status.startsWith("Terkunci") ? s.studentLockedActions : s.studentRowActions}>
                  {student.status.startsWith("Terkunci") && <Button className={s.studentUnlockButton} onClick={() => openModal("reset", student)}>Buka Kunci</Button>}
                  <span className={s.studentIconActions}>
                    <AdminTableIconButton className={s.studentActionButton} icon="eye-linear" title="Detail" ariaLabel="Detail" onClick={() => openModal("detail", student)} />
                    <AdminTableIconButton className={s.studentActionButton} icon="pen-linear" title="Edit" ariaLabel="Edit" onClick={() => openModal("edit", student)} />
                    <AdminTableIconButton className={s.studentResetAction} icon="lock-keyhole-linear" title="Reset kata sandi" ariaLabel="Reset kata sandi" onClick={() => openModal("reset", student)} />
                    <AdminTableIconButton className={s.studentActionButton} icon="trash-bin-trash-linear" title="Hapus" ariaLabel={`Hapus ${student.name}`} disabled={deleteStudent.loading} onClick={() => setDeleteSelected(student)} />
                  </span>
                </ManagementActionButtons></td>
              </tr>
            ))}
            {filtered.length === 0 && <TableEmpty colSpan={7} />}
          </tbody>
      </ManagementTable>


      {/* Bagian tampilan: modal tambah atau edit siswa, termasuk aturan kredensial login awal. */}
      {(modal === "add" || modal === "edit") && <Modal
        title={modal === "add" ? "Tambah Siswa Baru" : "Edit Data Siswa"}
        subtitle="Daftarkan akun peserta didik baru ke sistem portal LMS."
        onClose={() => setModal(null)}
        width="wide"
        layout="studentForm"
        className={s.studentFormModal}
        footer={<>
          {displayedErrorCount > 0 && <div className={s.studentErrorSummary}><AdminIcon name="danger-triangle-linear" size={16} />Pastikan {displayedErrorCount} kolom bermasalah telah diperbaiki</div>}
          <div className={s.studentModalActions}>
            <Button variant="outline" className={s.studentCancelButton} onClick={() => setModal(null)}>Batal</Button>
            <Button type="submit" form="student-form" icon="diskette-linear" iconSize={14} disabled={displayedErrorCount > 0 || createStudent.loading || updateStudent.loading}>Simpan Siswa</Button>
          </div>
        </>}
      >
        <form id="student-form" onSubmit={saveStudent}>
          <InfoBanner tone="primary"><strong>Kredensial Login Siswa:</strong><p>NISN dipakai sebagai username awal. Kata sandi awal = tanggal lahir siswa (DDMMYYYY). Siswa wajib memperbarui sandi saat login perdana.</p></InfoBanner>
          <div className={`${s.formGrid} ${s.studentFormGrid}`}>
            {renderTextField("name", "Nama Lengkap", "Nama lengkap peserta didik", true, true)}
            {renderTextField("nisn", "NISN (Nomor Induk Siswa Nasional)", "Masukkan 10 digit NISN", true, true)}
            {renderTextField("nik", "NIK (Nomor Induk Kependudukan)", "Masukkan 16 digit NIK", false, true, undefined, "(16 digit)")}
            {renderTextField("birthplace", "Tempat Lahir", "Kota kelahiran", true)}
            {renderTextField("birthdate", "Tanggal Lahir", "DD/MM/YYYY", true, false, "calendar-linear")}
            <div className={`${s.formField} ${s.studentGenderField} ${genderErrorShown ? s.formFieldInvalid : ""}`} role="radiogroup" aria-label="Jenis Kelamin" aria-invalid={genderErrorShown}>
              <span>Jenis Kelamin <b>*</b>{genderErrorShown && <AdminIcon name="danger-triangle-linear" size={14} />}</span>
              <div className={s.studentGenderOptions}>
                {["Laki-laki", "Perempuan"].map((gender) => {
                  const checked = form.gender === gender;
                  return <label className={`${s.studentGenderChoice} ${checked ? s.studentGenderSelected : ""}`} key={gender}>
                    <input type="radio" name="gender" value={gender} checked={checked} onChange={() => updateFormField("gender", gender)} onBlur={() => setTouched((current) => ({ ...current, gender: true }))} />
                    {gender}
                  </label>;
                })}
              </div>
              {genderErrorShown && <small className={s.fieldError} role="alert">{fieldErrors.gender}</small>}
            </div>
            <label className={`${s.formField} ${s.formFull} ${s.studentRombelField} ${rombelErrorShown ? s.formFieldInvalid : ""}`}>
              <span className={s.studentRombelHeader}>
                <span>Rombongan Belajar (Rombel) <b>*</b></span>
                {selectedRombel && <StatusBadge tone="warning" className={s.studentCapacityBadge}><AdminIcon name="chair-2-linear" size={13} />{selectedRombel.capacity === null ? `Kapasitas ${selectedRombel.filled}/— siswa` : selectedRombelIsFull ? `Kapasitas ${selectedRombel.filled}/${selectedRombel.capacity} siswa (Penuh)` : `Kapasitas ${selectedRombel.filled}/${selectedRombel.capacity} siswa (Sisa ${selectedRombel.capacity - selectedRombel.filled} kursi)`}</StatusBadge>}
              </span>
              <select value={form.rombel} onChange={(event) => { updateFormField("rombel", event.target.value); setTouched((current) => ({ ...current, rombel: true })); }} onBlur={() => setTouched((current) => ({ ...current, rombel: true }))} aria-invalid={rombelErrorShown}>
                <option value="" disabled>Pilih rombongan belajar</option>
                {rombelData.map((rombel) => {
                  const label = formatRombel(rombel);
                  const full = rombel.capacity !== null && rombel.filled >= rombel.capacity;
                  const canKeepCurrentClass = modal === "edit" && selected.rombel === rombel.code;
                  return <option key={rombel.code} value={label} disabled={full && !canKeepCurrentClass}>{label}{full ? " (Penuh)" : ""}</option>;
                })}
              </select>
              {rombelErrorShown && <small className={s.fieldError} role="alert">{fieldErrors.rombel}</small>}
            </label>
          </div>
          <div className={`${s.formSectionTitle} ${s.studentParentHeader}`}>
            Orang Tua / Wali Tertaut
            <button type="button" className={s.textLink}>+ Buat akun orang tua baru</button>
          </div>
          {modal === "edit" && selected.guardian ? (
            <div className={s.linkedStudent}>
              <span className={s.initialAvatar}><AdminIcon name="users-group-rounded-linear" size={19} /></span>
              <div><strong>{selected.guardian.name}</strong><small>{selected.guardian.relationship}</small></div>
              <StatusBadge tone="success">Akun Terhubung</StatusBadge>
            </div>
          ) : (
            <div className={s.studentGuardianEmpty}><AdminIcon name="users-group-rounded-linear" size={18} />Belum ada data orang tua/wali tertaut.</div>
          )}
        </form>
      </Modal>}

      {/* Bagian tampilan: modal detail siswa. */}
      {modal === "detail" && <Modal title="Detail Peserta Didik" subtitle={`${selected.name} • ${selected.rombel}`} onClose={() => setModal(null)} footer={<Button onClick={() => setModal(null)}>Tutup</Button>}>
        <div className={s.formGrid}><Field label="Nama Lengkap" value={selected.name} onChange={() => undefined} /><Field label="NISN" value={selected.nisn} onChange={() => undefined} /><Field label="Rombel" value={selected.rombel} onChange={() => undefined} /><Field label="Jenis Kelamin" value={selected.gender} onChange={() => undefined} /><div className={s.formFull}><StatusBadge tone={selected.status.startsWith("Aktif") ? "success" : "warning"}>{selected.status}</StatusBadge></div></div>
      </Modal>}

      {/* Bagian tampilan: konfirmasi reset sandi sesuai modal pada PDF. */}
      {modal === "reset" && <Modal title={`Reset kata sandi ${selected.name}?`} subtitle={`Peran: Siswa • Kelas ${selected.rombel}`} onClose={() => setModal(null)} footer={<><Button variant="outline" onClick={() => setModal(null)}>Batal</Button><Button variant="danger" disabled={!verified || resetStudentPassword.loading} onClick={() => { void resetStudentPassword.run(); }}>Ya, Reset Kata Sandi</Button></>}>
        <InfoBanner tone="warning">Kata sandi akan dikembalikan ke tanggal lahir siswa. Siswa diminta membuat kata sandi baru saat login berikutnya.</InfoBanner>
        <p className={s.pageDescription}>Nomor Induk (NISN): <strong>{selected.nisn}</strong></p>
        <label className={s.choicePill}><input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} /> Saya sudah memverifikasi identitas pengguna</label>
        <p className={s.pageDescription}>Verifikasi identitas wali murid / siswa fisik telah dilakukan oleh admin.</p>
      </Modal>}
      {deleteSelected && <Modal title="Hapus data siswa?" subtitle={deleteSelected.name} onClose={() => { if (!deleteStudent.loading) setDeleteSelected(null); }} footer={<><Button variant="outline" disabled={deleteStudent.loading} onClick={() => setDeleteSelected(null)}>Batal</Button><Button variant="danger" disabled={deleteStudent.loading} onClick={() => { void deleteStudent.run(); }}>{deleteStudent.loading ? "Menghapus..." : "Ya, Hapus"}</Button></>}>
        <p className={s.pageDescription}>Data siswa “{deleteSelected.name}” akan dihapus.</p>
        {deleteStudent.error && <InfoBanner tone="danger">{deleteStudent.error}</InfoBanner>}
      </Modal>}
    </>
  );
}
