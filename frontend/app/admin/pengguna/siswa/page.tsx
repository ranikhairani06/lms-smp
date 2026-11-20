"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import * as XLSX from "xlsx";
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
  Button,
  InfoBanner,
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
type ImportPreviewRow = { rowNumber: number; nisn: string; name: string; rombel: string; gender: string; genderValue: "Laki-laki" | "Perempuan" | ""; errors: string[] };

const getStudentSearchText = (student: Student) => `${student.name} ${student.nisn}`;
const matchesStudentCategory = (student: Student, category: string) => category === "Semua Kategori" || student.status.includes(category);

function parseStudentImport(matrix: unknown[][], students: Student[], rombelData: typeof initialRombelData) {
  const headers = (matrix[0] ?? []).map((value) => String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, ""));
  const findColumn = (...names: string[]) => headers.findIndex((header) => names.includes(header));
  const columns = {
    nisn: findColumn("nisn"),
    name: findColumn("namasiswa", "namalengkap", "nama"),
    rombel: findColumn("rombelkelas", "rombel", "kelas"),
    gender: findColumn("jeniskelamin", "gender"),
  };
  const labels: Record<keyof typeof columns, string> = { nisn: "NISN", name: "Nama Siswa", rombel: "Rombel / Kelas", gender: "Jenis Kelamin" };
  const missingColumns = (Object.keys(columns) as (keyof typeof columns)[]).filter((key) => columns[key] < 0).map((key) => labels[key]);
  if (missingColumns.length) return { rows: [] as ImportPreviewRow[], error: `Kolom wajib tidak ditemukan: ${missingColumns.join(", ")}.` };

  const seenNisn = new Set(students.map((student) => student.nisn));
  const additionsByClass = new Map<string, number>();
  const rows: ImportPreviewRow[] = [];
  matrix.slice(1).forEach((values, index) => {
    if (values.every((value) => String(value ?? "").trim() === "")) return;
    const rawNisn = String(values[columns.nisn] ?? "").trim().replace(/\.0$/, "");
    const nisnDigits = rawNisn.replace(/\D/g, "");
    const nisn = /^\d+$/.test(rawNisn) && nisnDigits.length < 10 ? nisnDigits.padStart(10, "0") : nisnDigits;
    const name = String(values[columns.name] ?? "").trim();
    const rawRombel = String(values[columns.rombel] ?? "").trim().toUpperCase();
    const classCode = rawRombel.match(/[7-9]\s*[A-Z]/)?.[0].replace(/\s/g, "") ?? "";
    const selectedClass = rombelData.find((rombel) => rombel.code === classCode);
    const rawGender = String(values[columns.gender] ?? "").trim().toLowerCase();
    const gender = ["l", "laki-laki", "laki laki", "pria"].includes(rawGender)
      ? "Laki-laki"
      : ["p", "perempuan", "wanita"].includes(rawGender) ? "Perempuan" : "";
    const errors: string[] = [];

    if (!/^\d{10}$/.test(nisn)) errors.push("NISN harus terdiri dari 10 digit angka.");
    else if (seenNisn.has(nisn)) errors.push("NISN sudah ada atau duplikat di file.");
    if (!name) errors.push("Nama siswa wajib diisi.");
    if (!selectedClass) errors.push("Rombel tidak dikenali.");
    else {
      const additions = additionsByClass.get(selectedClass.code) ?? 0;
      if (selectedClass.filled + additions >= selectedClass.capacity) errors.push(`Rombel ${selectedClass.code} sudah penuh.`);
    }
    if (!gender) errors.push("Jenis kelamin harus Laki-laki atau Perempuan.");

    if (!errors.length && selectedClass) {
      seenNisn.add(nisn);
      additionsByClass.set(selectedClass.code, (additionsByClass.get(selectedClass.code) ?? 0) + 1);
    }
    rows.push({ rowNumber: index + 2, nisn, name, rombel: selectedClass?.code ?? rawRombel, gender: gender || rawGender, genderValue: gender as ImportPreviewRow["genderValue"], errors });
  });

  return { rows, error: rows.length ? "" : "File tidak berisi baris data siswa." };
}

const formatRombel = (rombel: typeof initialRombelData[number]) => `Kelas ${rombel.code} — Wali: ${rombel.wali}`;

export default function SiswaPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [rombelData, setRombelData] = useState(initialRombelData);
  const [modal, setModal] = useState<"add" | "edit" | "detail" | "reset" | null>(null);
  const [selected, setSelected] = useState<Student>(initialStudents[0]);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ name: "", nisn: "", nik: "", birthplace: "", birthdate: "", gender: "Laki-laki", rombel: "" });
  const [touched, setTouched] = useState<Partial<Record<FormFieldKey, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [verified, setVerified] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importBusy, setImportBusy] = useState(false);
  const [importFileName, setImportFileName] = useState("");
  const [importRows, setImportRows] = useState<ImportPreviewRow[]>([]);
  const [importError, setImportError] = useState("");
  const [importNotice, setImportNotice] = useState("");
  const importInputRef = useRef<HTMLInputElement>(null);
  const { keyword, setKeyword, category, setCategory, filtered } = useAdminDirectoryFilter({
    items: students,
    getSearchText: getStudentSearchText,
    matchesCategory: matchesStudentCategory,
    initialCategory: "Semua Kategori",
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

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    setImportBusy(true);
    setImportFileName(file.name);
    setImportRows([]);
    setImportError("");
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", raw: false });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!firstSheet) throw new Error("Lembar kerja tidak ditemukan di file ini.");
      const matrix = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, { header: 1, defval: "", raw: false });
      const parsed = parseStudentImport(matrix, students, rombelData);
      setImportRows(parsed.rows);
      setImportError(parsed.error);
      setImportOpen(true);
    } catch (error) {
      setImportError(error instanceof Error ? `File tidak dapat dibaca: ${error.message}` : "File tidak dapat dibaca.");
      setImportOpen(true);
    } finally {
      setImportBusy(false);
    }
  };

  const commitImport = () => {
    const validRows = importRows.filter((row): row is ImportPreviewRow & { genderValue: "Laki-laki" | "Perempuan" } => row.errors.length === 0 && row.genderValue !== "");
    if (!validRows.length) return;
    const additions: Student[] = validRows.map((row) => ({
      nisn: row.nisn,
      name: row.name,
      rombel: row.rombel,
      gender: row.genderValue,
      status: "Belum Aktivasi",
      activity: "-",
    }));
    setStudents((current) => [...additions, ...current]);
    setRombelData((current) => current.map((rombel) => ({
      ...rombel,
      filled: rombel.filled + additions.filter((student) => student.rombel === rombel.code).length,
    })));
    setKeyword("");
    setCategory("Semua Kategori");
    setPage(1);
    setImportNotice(`${additions.length} siswa berhasil diimpor${validRows.length < importRows.length ? `; ${importRows.length - validRows.length} baris dilewati` : ""}.`);
    setImportOpen(false);
  };

  const updateFormField = (field: FormFieldKey, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const renderTextField = (field: Exclude<FormFieldKey, "gender" | "rombel">, label: string, placeholder: string, required = false, fullWidth = false) => {
    const error = fieldErrors[field];
    const showError = Boolean(error && shouldShowError(field));
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
        actions={
          <>
            {/* Tombol Import Data */}
            <Button
              variant="outline"
              className={s.importStudentButton}
              icon="upload-bold"
              onClick={() => importInputRef.current?.click()}
              disabled={importBusy}
            >
              {importBusy ? "Membaca File..." : "Import Data (Excel/CSV)"}
            </Button>

            {/* Tombol Tambah Siswa */}
            <Button
              className={s.addStudentButton}
              icon="user-plus-rounded-linear"
              onClick={() => openModal("add")}
            >
              Tambah Siswa
            </Button>
          </>
        }
      />

      <input ref={importInputRef} type="file" accept=".csv,.xls,.xlsx" hidden onChange={handleImportFile} aria-label="Pilih file Excel atau CSV siswa" />
      {importNotice && <InfoBanner tone="success">{importNotice}</InfoBanner>}

      {/* Bagian tampilan: kartu ringkasan akun peserta didik. */}
      <div className={`${s.statGridFour} ${s.studentStatGrid}`}>
        {statistics.map((item) => <ManagementStatCard key={item.label} item={item} variant="student" />)}
      </div>
      {/* Bagian tampilan: pencarian dan penyaringan direktori siswa. */}
      <ManagementToolbar keyword={keyword} onKeywordChange={setKeyword} searchPlaceholder="Cari nama / NISN..." category={category} onCategoryChange={setCategory} categoryOptions={["Semua Kategori", "Aktif", "Terkunci", "Belum Aktivasi"]} />
      {/* Bagian tampilan: tabel peserta didik beserta aksi detail, edit, dan reset kredensial. */}
      <ManagementTable tableClassName={s.dataTable} footer={<Pagination current={page} total={3} onChange={setPage} label={`Menampilkan 1-${filtered.length} dari 860 siswa`} />}>
          <thead><tr><th>NISN</th><th>Nama Siswa</th><th>Rombel / Kelas</th><th>Jenis Kelamin</th><th>Status Akun LMS</th><th>Aktivitas Terakhir</th><th>Aksi</th></tr></thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student.nisn}>
                <td>{student.nisn}</td><td><span className={s.tableStrong}>{student.name}</span></td><td><span className={s.levelTag}>{student.rombel}</span></td><td>{student.gender}</td>
                <td><StatusBadge tone={student.status.startsWith("Aktif") ? "info" : student.status.startsWith("Terkunci") ? "danger" : "neutral"}>{student.status}</StatusBadge></td><td>{student.activity}</td>
                <td><ManagementActionButtons>{student.status.startsWith("Terkunci") && <button className={s.textLink} onClick={() => setStudents((rows) => rows.map((row) => row.nisn === student.nisn ? { ...row, status: "Aktif (Sandi Diperbarui)" } : row))}>Buka Kunci</button>}<button className={s.iconButton} title="Detail" onClick={() => openModal("detail", student)}><AdminIcon name="eye-linear" size={15} /></button><button className={s.iconButton} title="Edit" onClick={() => openModal("edit", student)}><AdminIcon name="pen-linear" size={15} /></button><button className={s.iconButton} title="Reset kata sandi" onClick={() => openModal("reset", student)}><AdminIcon name="lock-keyhole-linear" size={15} /></button></ManagementActionButtons></td>
              </tr>
            ))}
            {filtered.length === 0 && <TableEmpty colSpan={7} />}
          </tbody>
      </ManagementTable>

      {importOpen && <Modal
        title="Pratinjau Import Data Siswa"
        subtitle={importFileName}
        width="wide"
        onClose={() => setImportOpen(false)}
        footer={<><Button variant="outline" onClick={() => setImportOpen(false)}>Batal</Button><Button onClick={commitImport} disabled={!importRows.some((row) => row.errors.length === 0)}>Impor {importRows.filter((row) => row.errors.length === 0).length} Siswa</Button></>}
      >
        {importError ? <InfoBanner tone="danger">{importError}</InfoBanner> : <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-md)", marginBottom: "var(--space-md)", flexWrap: "wrap" }}>
            <p className={s.pageDescription} style={{ margin: 0 }}>
              {importRows.filter((row) => row.errors.length === 0).length} baris siap diimpor; {importRows.filter((row) => row.errors.length > 0).length} baris perlu diperbaiki.
            </p>
            <Button variant="outline" onClick={() => importInputRef.current?.click()}>Pilih File Lain</Button>
          </div>
          <ManagementTable tableClassName={s.dataTable}>
              <thead><tr><th>Baris</th><th>NISN</th><th>Nama Siswa</th><th>Rombel</th><th>Jenis Kelamin</th><th>Validasi</th></tr></thead>
              <tbody>{importRows.map((row) => <tr key={`${row.rowNumber}-${row.nisn}`}>
                <td>{row.rowNumber}</td><td>{row.nisn || "—"}</td><td>{row.name || "—"}</td><td>{row.rombel || "—"}</td><td>{row.gender || "—"}</td>
                <td>{row.errors.length ? <StatusBadge tone="danger">{row.errors.join(" ")}</StatusBadge> : <StatusBadge tone="success">Siap diimpor</StatusBadge>}</td>
              </tr>)}</tbody>
          </ManagementTable>
          <p className={s.pageDescription} style={{ marginBottom: 0, marginTop: "var(--space-sm)" }}>
            Kolom yang dibaca: NISN, Nama Siswa, Rombel / Kelas, dan Jenis Kelamin. Data dengan NISN duplikat, rombel tidak dikenal/penuh, atau nilai wajib tidak valid tidak akan diimpor.
          </p>
        </>}
      </Modal>}

      {/* Bagian tampilan: modal tambah atau edit siswa, termasuk aturan kredensial login awal. */}
      {(modal === "add" || modal === "edit") && <Modal
        title={modal === "add" ? "Tambah Siswa Baru" : "Edit Data Siswa"}
        subtitle="Daftarkan akun peserta didik baru ke sistem portal LMS."
        onClose={() => setModal(null)}
        width="wide"
        footer={<><Button variant="outline" onClick={() => setModal(null)}>Batal</Button><Button type="submit" form="student-form" icon="diskette-linear" disabled={displayedErrorCount > 0}>Simpan Siswa</Button></>}
      >
        <form id="student-form" onSubmit={saveStudent}>
          <InfoBanner><strong>Kredensial Login Siswa:</strong><p>NISN dipakai sebagai username awal. Kata sandi awal = tanggal lahir siswa (DDMMYYYY). Siswa wajib memperbarui sandi saat login perdana.</p></InfoBanner>
          <div className={s.formGrid}>
            {renderTextField("name", "Nama Lengkap", "Nama lengkap peserta didik", true)}
            {renderTextField("nisn", "NISN (Nomor Induk Siswa Nasional)", "Masukkan 10 digit NISN", true)}
            {renderTextField("nik", "NIK (Nomor Induk Kependudukan) (16 digit)", "Masukkan 16 digit NIK")}
            {renderTextField("birthplace", "Tempat Lahir", "Kota kelahiran", true)}
            {renderTextField("birthdate", "Tanggal Lahir", "DD/MM/YYYY", true)}
            <label className={`${s.formField} ${genderErrorShown ? s.formFieldInvalid : ""}`}>
              <span>Jenis Kelamin <b>*</b></span>
              <select value={form.gender} onChange={(event) => updateFormField("gender", event.target.value)} onBlur={() => setTouched((current) => ({ ...current, gender: true }))} aria-invalid={genderErrorShown}>
                <option>Laki-laki</option>
                <option>Perempuan</option>
              </select>
              {genderErrorShown && <small className={s.fieldError} role="alert">{fieldErrors.gender}</small>}
            </label>
            <label className={`${s.formField} ${s.formFull} ${rombelErrorShown ? s.formFieldInvalid : ""}`}>
              <span>Rombongan Belajar (Rombel) <b>*</b></span>
              <select value={form.rombel} onChange={(event) => { updateFormField("rombel", event.target.value); setTouched((current) => ({ ...current, rombel: true })); }} onBlur={() => setTouched((current) => ({ ...current, rombel: true }))} aria-invalid={rombelErrorShown}>
                <option value="" disabled>Pilih rombongan belajar</option>
                {rombelData.map((rombel) => {
                  const label = formatRombel(rombel);
                  const full = rombel.filled >= rombel.capacity;
                  const canKeepCurrentClass = modal === "edit" && selected.rombel === rombel.code;
                  return <option key={rombel.code} value={label} disabled={full && !canKeepCurrentClass}>{label}{full ? " (Penuh)" : ""}</option>;
                })}
              </select>
              <small>{selectedRombel ? `Kapasitas ${selectedRombel.filled}/${selectedRombel.capacity} siswa${selectedRombelIsFull ? " (Penuh)" : `; sisa ${selectedRombel.capacity - selectedRombel.filled} kursi`}.` : "Kapasitas kelas mengikuti master data rombel."}</small>
              {rombelErrorShown && <small className={s.fieldError} role="alert">{fieldErrors.rombel}</small>}
            </label>
          </div>
          <div className={s.formSectionTitle}>
            Orang Tua / Wali Tertaut
            <button type="button" className={s.textLink} style={{ color: "var(--color-primary)", fontSize: "var(--text-l12-size)", lineHeight: "var(--text-l12-line)", fontWeight: "var(--font-weight-medium)" }}>+ Buat akun orang tua baru</button>
          </div>
          {modal === "edit" && selected.guardian ? (
            <div className={s.linkedStudent}>
              <span className={s.initialAvatar}><AdminIcon name="users-group-rounded-linear" size={19} /></span>
              <div><strong>{selected.guardian.name}</strong><small>{selected.guardian.relationship}</small></div>
              <StatusBadge tone="success">Akun Terhubung</StatusBadge>
            </div>
          ) : (
            <div className={s.linkedStudent}>
              <span className={s.initialAvatar}><AdminIcon name="users-group-rounded-linear" size={19} /></span>
              <div><strong>Orang tua/wali belum tertaut</strong><small>Data akan ditampilkan jika sudah tersedia.</small></div>
            </div>
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
