"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
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
import {
  AdminTableIconButton,
  Button,
  InfoBanner,
  ManagementHeaderActions,
  TableEmpty,
  adminStyles as s
} from "@/app/admin/_components/AdminUI";

const initialStudents = [
  { nisn: "0098723412", name: "Andi Pratama", rombel: "8A", gender: "Laki-laki", status: "Aktif (Sandi Diperbarui)", activity: "12 Menit lalu" },
  { nisn: "0098723415", name: "Siti Rahma", rombel: "8A", gender: "Perempuan", status: "Aktif (Sandi Diperbarui)", activity: "Hari ini, 09:14" },
  { nisn: "0099631245", name: "Budi Santoso", rombel: "7A", gender: "Laki-laki", status: "Terkunci (Salah Sandi)", activity: "Kemarin, 14:02" },
  { nisn: "0099631248", name: "Dewi Lestari", rombel: "7A", gender: "Perempuan", status: "Aktif (Sandi Diperbarui)", activity: "1 jam lalu" },
  { nisn: "0097451290", name: "Farhan Maulana", rombel: "9A", gender: "Laki-laki", status: "Aktif (Sandi Diperbarui)", activity: "Hari ini, 07:45" },
  { nisn: "0097451294", name: "Gita Maharani", rombel: "9A", gender: "Perempuan", status: "Aktif (Sandi Diperbarui)", activity: "3 hari lalu" },
  { nisn: "0099631250", name: "Hendro Prabowo", rombel: "7B", gender: "Laki-laki", status: "Belum Aktivasi", activity: "-" },
];

const initialRombelData = [
  { code: "7A", wali: "Joko Susilo, S.Pd.", filled: 35, capacity: 36 },
  { code: "7B", wali: "Dewi Sartika, S.Pd.", filled: 36, capacity: 36 },
  { code: "7C", wali: "Bambang Wijanarko, S.Pd.", filled: 34, capacity: 36 },
  { code: "8A", wali: "Siti Nurhaliza, M.Pd.", filled: 38, capacity: 36 },
  { code: "8B", wali: "Endah Kusumastuti, S.Pd.", filled: 35, capacity: 36 },
  { code: "8C", wali: "Hendra Gunawan, S.Kom.", filled: 36, capacity: 36 },
  { code: "9A", wali: "Ahmad Fauzi, M.Pd.", filled: 34, capacity: 36 },
];

type Guardian = { name: string; relationship: string };
type Student = typeof initialStudents[number] & { nik?: string; birthplace?: string; birthdate?: string; guardian?: Guardian };
type FormFieldKey = "name" | "nisn" | "nik" | "birthplace" | "birthdate" | "gender" | "rombel";
const getStudentSearchText = (student: Student) => `${student.name} ${student.nisn}`;
const matchesStudentCategory = (student: Student, category: string) => category === "Semua Kategori" || student.status.includes(category);

const formatRombel = (rombel: typeof initialRombelData[number]) => `Kelas ${rombel.code} — Wali: ${rombel.wali}`;

export default function SiswaPage() {
  const router = useRouter();
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [rombelData, setRombelData] = useState(initialRombelData);
  const [modal, setModal] = useState<"add" | "edit" | "detail" | "reset" | null>(null);
  const [selected, setSelected] = useState<Student>(initialStudents[0]);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ name: "", nisn: "", nik: "", birthplace: "", birthdate: "", gender: "Laki-laki", rombel: "" });
  const [touched, setTouched] = useState<Partial<Record<FormFieldKey, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [verified, setVerified] = useState(false);
  const { keyword, setKeyword, category, setCategory, filtered } = useAdminDirectoryFilter({
    items: students,
    getSearchText: getStudentSearchText,
    matchesCategory: matchesStudentCategory,
    initialCategory: "Semua Kategori",
  });
  const csvImport = useCsvImport({
    endpoint: undefined,
    entityLabel: "data siswa",
    onSuccess: () => {
      setKeyword("");
      setCategory("Semua Kategori");
      setPage(1);
      router.refresh();
    },
  });

  const selectedRombel = rombelData.find((rombel) => formatRombel(rombel) === form.rombel);
  const selectedRombelCode = selectedRombel?.code ?? "";
  const duplicateStudent = form.nisn.length === 10
    ? students.find((student) => student.nisn === form.nisn && !(modal === "edit" && student.nisn === selected.nisn))
    : undefined;
  const editingCurrentFullRombel = modal === "edit" && selected.rombel === selectedRombelCode;
  const selectedRombelIsFull = Boolean(selectedRombel && selectedRombel.filled >= selectedRombel.capacity);
  const rombelIsFull = selectedRombelIsFull && !editingCurrentFullRombel;
  const fieldErrors: Record<FormFieldKey, string> = {
    name: form.name.trim() ? "" : "Nama lengkap wajib diisi.",
    nisn: !form.nisn ? "NISN wajib diisi." : form.nisn.length !== 10 ? "NISN harus terdiri dari 10 digit angka." : duplicateStudent ? `NISN ${form.nisn} sudah terdaftar atas nama ${duplicateStudent.name}. Masukkan NISN yang valid.` : "",
    nik: form.nik && form.nik.length !== 16 ? "NIK harus terdiri dari 16 digit angka." : "",
    birthplace: form.birthplace.trim() ? "" : "Tempat lahir wajib diisi.",
    birthdate: form.birthdate.trim() ? "" : "Tanggal lahir wajib diisi untuk generate kata sandi default siswa.",
    gender: form.gender ? "" : "Pilih jenis kelamin.",
    rombel: !selectedRombel ? "Pilih rombongan belajar." : rombelIsFull ? "Rombongan belajar ini sudah penuh." : "",
  };
  const errorCount = Object.values(fieldErrors).filter(Boolean).length;
  const shouldShowError = (field: FormFieldKey) => submitAttempted || Boolean(touched[field]);
  const displayedErrorCount = (Object.keys(fieldErrors) as FormFieldKey[]).filter((field) => shouldShowError(field) && Boolean(fieldErrors[field])).length;
  const genderErrorShown = Boolean(fieldErrors.gender && shouldShowError("gender"));
  const rombelErrorShown = Boolean(fieldErrors.rombel && shouldShowError("rombel"));
  const requiredFieldsReady = Boolean(form.name.trim() && form.nisn.length === 10 && form.birthplace.trim() && form.birthdate.trim() && form.gender && selectedRombel && !rombelIsFull);
  const canSave = requiredFieldsReady && errorCount === 0;

  const openModal = (type: "add" | "edit" | "detail" | "reset", student?: Student) => {
    if (student) {
      setSelected(student);
      const studentRombel = rombelData.find((rombel) => rombel.code === student.rombel);
      setForm({ name: student.name, nisn: student.nisn, nik: student.nik ?? "", birthplace: student.birthplace ?? "", birthdate: student.birthdate ?? "", gender: student.gender, rombel: studentRombel ? formatRombel(studentRombel) : "" });
    } else {
      setSelected(initialStudents[0]);
      const preferredRombel = rombelData.find((rombel) => rombel.code === "8B" && rombel.filled < rombel.capacity)
        ?? rombelData.find((rombel) => rombel.filled < rombel.capacity);
      setForm({ name: "", nisn: "", nik: "", birthplace: "", birthdate: "", gender: "Laki-laki", rombel: preferredRombel ? formatRombel(preferredRombel) : "" });
    }
    setTouched({});
    setSubmitAttempted(false);
    setVerified(false);
    setModal(type);
  };

  const saveStudent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (!canSave || !selectedRombel) return;
    const nextClass = selectedRombel.code;
    if (modal === "edit") {
      setStudents((rows) => rows.map((row) => row.nisn === selected.nisn ? { ...row, name: form.name.trim(), nisn: form.nisn, nik: form.nik, birthplace: form.birthplace.trim(), birthdate: form.birthdate.trim(), gender: form.gender, rombel: nextClass } : row));
      if (selected.rombel !== nextClass) {
        setRombelData((rows) => rows.map((row) => row.code === selected.rombel ? { ...row, filled: Math.max(0, row.filled - 1) } : row.code === nextClass ? { ...row, filled: row.filled + 1 } : row));
      }
    } else {
      setStudents((rows) => [{ nisn: form.nisn, name: form.name.trim(), nik: form.nik, birthplace: form.birthplace.trim(), birthdate: form.birthdate.trim(), rombel: nextClass, gender: form.gender, status: "Belum Aktivasi", activity: "-" }, ...rows]);
      setRombelData((rows) => rows.map((row) => row.code === nextClass ? { ...row, filled: row.filled + 1 } : row));
    }
    setModal(null);
  };

  const updateFormField = (field: FormFieldKey, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const renderTextField = (field: Exclude<FormFieldKey, "gender" | "rombel">, label: string, placeholder: string, required = false, fullWidth = false, trailingIcon?: string, labelHint?: string) => {
    const error = fieldErrors[field];
    const showError = Boolean(error && shouldShowError(field));
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
    { label: "Total Siswa Terdaftar", value: "860", icon: "users-group-rounded-linear", tone: "primary" },
    { label: "Siswa Aktif Login", value: "812", icon: "user-check-linear", tone: "success" },
    { label: "Belum Ganti Password", value: "48", icon: "lock-keyhole-linear", tone: "warning" },
    { label: "Perlu Verifikasi NISN", value: "18", icon: "clipboard-check-linear", tone: "danger" },
  ];

  return (
    <>
      
      <PageHeading
        breadcrumbs={["LMS", "Manajemen Pengguna", "Manajemen Siswa"]}
        title="Manajemen Siswa"
        description="Pengelolaan basis data peserta didik, alokasi kelas rombel, status kredensial NISN, dan verifikasi akun portal siswa."
        actions={<ManagementHeaderActions onImport={() => csvInputRef.current?.click()} onAdd={() => openModal("add")} addLabel="Tambah Siswa" importing={csvImport.loading} />}
      />

      {/* Bagian tampilan: pemilih CSV serta hasil impor siswa. */}
      <input ref={csvInputRef} type="file" accept=".csv,text/csv" hidden onChange={(event) => { const input = event.currentTarget; const file = input.files?.[0] ?? null; input.value = ""; void csvImport.importFile(file); }} aria-label="Pilih file CSV siswa" />
      {csvImport.error && <InfoBanner tone="danger">{csvImport.error}</InfoBanner>}
      {csvImport.success && <InfoBanner tone="success">{csvImport.success}</InfoBanner>}
      {csvImport.rowErrorSummary && <InfoBanner tone="warning">Sebagian baris tidak diimpor: {csvImport.rowErrorSummary}</InfoBanner>}

      {/* Bagian tampilan: kartu ringkasan akun peserta didik. */}
      <div className={`${s.statGridFour} ${s.adminStatRow}`}>
        {statistics.map((item) => <ManagementStatCard key={item.label} item={item} variant="student" />)}
      </div>
      {/* Bagian tampilan: pencarian dan penyaringan direktori siswa. */}
      <ManagementToolbar keyword={keyword} onKeywordChange={setKeyword} searchPlaceholder="Cari nama / NISN..." category={category} onCategoryChange={setCategory} categoryOptions={["Semua Kategori", "Aktif", "Terkunci", "Belum Aktivasi"]} variant="student" showExampleBadge={false} />
      {/* Bagian tampilan: tabel peserta didik beserta aksi detail, edit, dan reset kredensial. */}
      <ManagementTable variant="student" tableClassName={`${s.dataTable} ${s.studentDataTable}`} footer={<Pagination className={s.studentPagination} variant="directory" current={page} total={123} onChange={setPage} label={`Menampilkan 1-${filtered.length} dari 860 siswa`} emphasizeLabelNumbers />}>
          <thead><tr><th>NISN</th><th>Nama Siswa</th><th>Rombel / Kelas</th><th>Jenis Kelamin</th><th>Status Akun LMS</th><th>Aktivitas Terakhir</th><th>Aksi</th></tr></thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student.nisn}>
                <td>{student.nisn}</td><td><span className={s.tableStrong}>{student.name}</span></td><td><span className={s.levelTag}>{student.rombel}</span></td><td>{student.gender}</td>
                <td><StatusBadge className={s.studentStatusPill} tone={student.status.startsWith("Aktif") ? "info" : student.status.startsWith("Terkunci") ? "danger" : "neutral"}>{student.status}</StatusBadge></td><td>{student.activity}</td>
                <td><ManagementActionButtons className={student.status.startsWith("Terkunci") ? s.studentLockedActions : s.studentRowActions}>
                  {student.status.startsWith("Terkunci") && <Button className={s.studentUnlockButton} onClick={() => setStudents((rows) => rows.map((row) => row.nisn === student.nisn ? { ...row, status: "Aktif (Sandi Diperbarui)" } : row))}>Buka Kunci</Button>}
                  <span className={s.studentIconActions}>
                    <AdminTableIconButton className={s.studentActionButton} icon="eye-linear" title="Detail" ariaLabel="Detail" onClick={() => openModal("detail", student)} />
                    <AdminTableIconButton className={s.studentActionButton} icon="pen-linear" title="Edit" ariaLabel="Edit" onClick={() => openModal("edit", student)} />
                    <AdminTableIconButton className={s.studentResetAction} icon="lock-keyhole-linear" title="Reset kata sandi" ariaLabel="Reset kata sandi" onClick={() => openModal("reset", student)} />
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
            <Button type="submit" form="student-form" icon="diskette-linear" iconSize={14} disabled={displayedErrorCount > 0}>Simpan Siswa</Button>
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
                {selectedRombel && <StatusBadge tone="warning" className={s.studentCapacityBadge}><AdminIcon name="chair-2-linear" size={13} />{selectedRombelIsFull ? `Kapasitas ${selectedRombel.filled}/${selectedRombel.capacity} siswa (Penuh)` : `Kapasitas ${selectedRombel.filled}/${selectedRombel.capacity} siswa (Sisa ${selectedRombel.capacity - selectedRombel.filled} kursi)`}</StatusBadge>}
              </span>
              <select value={form.rombel} onChange={(event) => { updateFormField("rombel", event.target.value); setTouched((current) => ({ ...current, rombel: true })); }} onBlur={() => setTouched((current) => ({ ...current, rombel: true }))} aria-invalid={rombelErrorShown}>
                <option value="" disabled>Pilih rombongan belajar</option>
                {rombelData.map((rombel) => {
                  const label = formatRombel(rombel);
                  const full = rombel.filled >= rombel.capacity;
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
      {modal === "reset" && <Modal title={`Reset kata sandi ${selected.name}?`} subtitle={`Peran: Siswa • Kelas ${selected.rombel}`} onClose={() => setModal(null)} footer={<><Button variant="outline" onClick={() => setModal(null)}>Batal</Button><Button variant="danger" disabled={!verified} onClick={() => { setStudents((rows) => rows.map((row) => row.nisn === selected.nisn ? { ...row, status: "Belum Ganti Password" } : row)); setModal(null); }}>Ya, Reset Kata Sandi</Button></>}>
        <InfoBanner tone="warning">Kata sandi akan dikembalikan ke tanggal lahir siswa. Siswa diminta membuat kata sandi baru saat login berikutnya.</InfoBanner>
        <p className={s.pageDescription}>Nomor Induk (NISN): <strong>{selected.nisn}</strong></p>
        <label className={s.choicePill}><input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} /> Saya sudah memverifikasi identitas pengguna</label>
        <p className={s.pageDescription}>Verifikasi identitas wali murid / siswa fisik telah dilakukan oleh admin.</p>
      </Modal>}
    </>
  );
}
