"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import { AdminTableIconButton, Button, Field, InfoBanner, Modal, PageHeading, SearchField, StatusBadge, adminStyles as s } from "@/app/admin/_components/AdminUI";
import { EmptyState, ErrorState, LoadingState } from "@/components/lms/state";
import { ApiError, apiRequest } from "@/lib/api";
import { useAdminResource } from "@/app/admin/_components/useAdminApi";

type AcademicYear = {
  id: number;
  name: string;
  start_year: number;
  is_active: boolean;
  is_deleted?: boolean;
  class_rooms_count?: number;
  students_count?: number;
};

type Semester = {
  id: number;
  academic_year_id: number;
  semester_number: number;
  name: string;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  is_deleted?: boolean;
  academic_year?: AcademicYear;
};

type YearRow = {
  year: string;
  status: string;
  note: string;
  range: string;
  rombel: string;
  students: string;
  semester: Semester;
};

type SemesterForm = {
  academicYearId: string;
  semesterNumber: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

const emptySemesterForm: SemesterForm = {
  academicYearId: "",
  semesterNumber: "1",
  name: "Semester Ganjil",
  startDate: "",
  endDate: "",
  isActive: false,
};

const dateValue = (value?: string | null) => value ? value.slice(0, 10) : "";

function todayValue() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function periodStatus(semester: Semester) {
  if (semester.is_active) return "Aktif";
  const today = todayValue();
  if (semester.start_date && dateValue(semester.start_date) > today) return "Mendatang";
  if (semester.end_date && dateValue(semester.end_date) < today) return "Selesai";
  return "—";
}

function displayDate(value?: string | null) {
  const date = dateValue(value);
  return date ? new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—";
}

function displayCount(value?: number) {
  return typeof value === "number" ? value.toLocaleString("id-ID") : "—";
}

function semesterLabel(number: number) {
  return number === 1 ? "Ganjil" : "Genap";
}

function academicYearForSemester(years: AcademicYear[], semester: Semester) {
  const listedYear = years.find((year) => year.id === semester.academic_year_id);
  const nestedYear = semester.academic_year;
  if (!listedYear) return nestedYear;
  return {
    ...nestedYear,
    ...listedYear,
    class_rooms_count: listedYear.class_rooms_count ?? nestedYear?.class_rooms_count,
    students_count: listedYear.students_count ?? nestedYear?.students_count,
  };
}

function errorMessage(cause: unknown) {
  return cause instanceof Error ? cause.message : "Permintaan belum dapat diproses. Silakan coba lagi.";
}

export default function TahunAjaranPage() {
  const router = useRouter();
  const yearResource = useAdminResource<AcademicYear[]>("academic-years");
  const semesterResource = useAdminResource<Semester[]>("semesters");
  const apiYears = (yearResource.data ?? []).filter((year) => !year.is_deleted);
  const apiSemesters = (semesterResource.data ?? []).filter((semester) => !semester.is_deleted);
  const [notice, setNotice] = useState("");
  const [keyword, setKeyword] = useState("");
  const [tab, setTab] = useState("Semua Status");
  const [modal, setModal] = useState<"add-year" | "add-semester" | "edit-semester" | "activate" | null>(null);
  const [selected, setSelected] = useState<YearRow | null>(null);
  const [deleteSelected, setDeleteSelected] = useState<YearRow | null>(null);
  const [form, setForm] = useState<SemesterForm>(emptySemesterForm);
  const [newYearName, setNewYearName] = useState("");
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const rows: YearRow[] = apiSemesters.map((semester) => {
    const academicYear = academicYearForSemester(apiYears, semester);
    const yearName = academicYear?.name ?? "—";
    const status = periodStatus(semester);
    const period = `${displayDate(semester.start_date)} – ${displayDate(semester.end_date)}`;
    return {
      year: `${yearName} – ${semester.name}`,
      status,
      note: `Semester ${semester.semester_number} · ${semesterLabel(semester.semester_number)}`,
      range: period,
      rombel: `${displayCount(academicYear?.class_rooms_count)} Rombel`,
      students: `${displayCount(academicYear?.students_count)} Siswa`,
      semester,
    };
  });

  const refresh = async () => {
    await Promise.all([yearResource.reload(), semesterResource.reload()]);
  };

  const filtered = useMemo(() => rows.filter((item) =>
    (tab === "Semua Status" || item.status === tab) && item.year.toLowerCase().includes(keyword.toLowerCase())
  ), [rows, tab, keyword]);

  const activeSemester = apiSemesters.find((semester) => semester.is_active);
  const activeYear = (activeSemester && academicYearForSemester(apiYears, activeSemester))
    ?? apiYears.find((year) => year.is_active);
  const nextSemester = apiSemesters
    .filter((semester) => !semester.is_active && semester.start_date && dateValue(semester.start_date) > todayValue())
    .sort((left, right) => dateValue(left.start_date).localeCompare(dateValue(right.start_date)))[0];
  const loading = yearResource.loading || semesterResource.loading;
  const loadError = yearResource.error || semesterResource.error;

  const openAddYear = () => {
    setNotice("");
    setFieldErrors({});
    setNewYearName("");
    setModal("add-year");
  };

  const openAddSemester = () => {
    setNotice("");
    setFieldErrors({});
    setSelected(null);
    setForm({ ...emptySemesterForm, academicYearId: String(activeYear?.id ?? apiYears[0]?.id ?? "") });
    setModal("add-semester");
  };

  const openEditSemester = (row: YearRow) => {
    setNotice("");
    setFieldErrors({});
    setSelected(row);
    setForm({
      academicYearId: String(row.semester.academic_year_id),
      semesterNumber: String(row.semester.semester_number),
      name: row.semester.name,
      startDate: dateValue(row.semester.start_date),
      endDate: dateValue(row.semester.end_date),
      isActive: row.semester.is_active,
    });
    setModal("edit-semester");
  };

  const handleRequestError = async (cause: unknown) => {
    if (cause instanceof ApiError) {
      setFieldErrors(cause.fieldErrors);
      if (cause.status === 401) router.replace("/login?role=admin&reason=session-expired");
      if (cause.status === 404) await refresh();
    }
    setNotice(errorMessage(cause));
  };

  const submitAcademicYear = async () => {
    setNotice("");
    setFieldErrors({});
    const match = newYearName.trim().match(/^(\d{4})\/(\d{4})$/);
    if (!match) {
      setFieldErrors({ name: ["Masukkan tahun ajaran dengan format YYYY/YYYY."] });
      return;
    }

    setPending(true);
    try {
      await apiRequest("admin/academic-years", {
        method: "POST",
        body: JSON.stringify({ name: `${match[1]}/${match[2]}`, start_year: Number(match[1]) }),
      });
      setNotice("Tahun ajaran berhasil ditambahkan.");
      setModal(null);
      await refresh();
    } catch (cause) {
      await handleRequestError(cause);
    } finally {
      setPending(false);
    }
  };

  const submitSemester = async () => {
    setNotice("");
    setFieldErrors({});
    const errors: Record<string, string[]> = {};
    const semesterNumber = Number(form.semesterNumber);
    if (!apiYears.some((year) => year.id === Number(form.academicYearId))) errors.academic_year_id = ["Pilih tahun ajaran yang tersedia."];
    if (semesterNumber !== 1 && semesterNumber !== 2) errors.semester_number = ["Pilih Semester Ganjil atau Genap."];
    if (!form.name.trim()) errors.name = ["Nama semester wajib diisi."];
    else if (form.name.trim().length > 100) errors.name = ["Nama semester maksimal 100 karakter."];
    if (form.startDate && form.endDate && form.endDate < form.startDate) errors.end_date = ["Tanggal selesai harus sama dengan atau setelah tanggal mulai."];
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    const payload: Record<string, string | number | boolean> = {
      academic_year_id: Number(form.academicYearId),
      semester_number: semesterNumber,
      name: form.name.trim(),
      ...(form.startDate ? { start_date: form.startDate } : {}),
      ...(form.endDate ? { end_date: form.endDate } : {}),
      ...(modal === "add-semester" ? { is_active: form.isActive } : {}),
    };

    setPending(true);
    try {
      if (modal === "edit-semester" && selected) {
        await apiRequest(`admin/semesters/${selected.semester.id}`, { method: "PUT", body: JSON.stringify(payload) });
        setNotice("Semester berhasil diperbarui.");
      } else {
        await apiRequest("admin/semesters", { method: "POST", body: JSON.stringify(payload) });
        setNotice(form.isActive ? "Semester berhasil ditambahkan dan diaktifkan." : "Semester berhasil ditambahkan.");
      }
      setModal(null);
      await refresh();
    } catch (cause) {
      await handleRequestError(cause);
    } finally {
      setPending(false);
    }
  };

  const activateSelected = async () => {
    if (!selected) return;
    setNotice("");
    setPending(true);
    try {
      await apiRequest(`admin/semesters/${selected.semester.id}/activate`, { method: "POST" });
      setNotice("Semester aktif berhasil diperbarui.");
      setModal(null);
      await refresh();
    } catch (cause) {
      await handleRequestError(cause);
    } finally {
      setPending(false);
    }
  };

  const deleteSemester = async () => {
    if (!deleteSelected) return;
    setNotice("");
    setPending(true);
    try {
      await apiRequest(`admin/semesters/${deleteSelected.semester.id}`, { method: "DELETE" });
      setNotice("Semester berhasil dihapus.");
      setDeleteSelected(null);
      await refresh();
    } catch (cause) {
      await handleRequestError(cause);
    } finally {
      setPending(false);
    }
  };

  const openActivate = (row: YearRow) => {
    setNotice("");
    setSelected(row);
    setModal("activate");
  };

  return <>
    <PageHeading
      breadcrumbs={["LMS", "Master Data", "Tahun Ajaran & Semester"]}
      title="Master Data Tahun Ajaran & Semester"
      description="Konfigurasi tahun akademik, semester aktif, dan transisi rombongan belajar."
      actions={<div className={s.tableActions}><Button variant="outline" icon="calendar-add-linear" onClick={openAddYear}>Tambah Tahun Ajaran</Button><Button icon="calendar-add-linear" onClick={openAddSemester}>Tambah Semester</Button></div>}
    />
    {notice && <InfoBanner tone={notice.includes("berhasil") ? "success" : "danger"}>{notice}</InfoBanner>}
    {loading && <LoadingState title="Memuat tahun ajaran dan semester..." />}
    {loadError && <ErrorState title={loadError} action={<Button variant="outline" onClick={() => void refresh()}>Coba Lagi</Button>} />}

    <section className={s.yearHero}>
      <div>
        <div className={s.heroTags}><span>TAHUN AJARAN BERJALAN</span><span>STATUS: {activeYear ? "AKTIF" : "—"}</span><span>ID: {activeYear?.id ?? "—"}</span></div>
        <h2>{activeYear?.name ?? "—"}{activeSemester ? ` – ${activeSemester.name}` : ""}</h2>
        <div className={s.heroTags}>
          <span><AdminIcon name="calendar-linear" size={12} /> {activeSemester ? `${displayDate(activeSemester.start_date)} – ${displayDate(activeSemester.end_date)}` : "—"}</span>
          <span><AdminIcon name="users-group-rounded-linear" size={12} /> {displayCount(activeYear?.class_rooms_count)} Rombel · {displayCount(activeYear?.students_count)} Siswa</span>
        </div>
      </div>
      <div className={s.heroActions}>
        <Button variant="outline" icon="pen-linear" disabled={!activeSemester} onClick={() => {
          const row = rows.find((item) => item.semester.id === activeSemester?.id);
          if (row) openEditSemester(row);
        }}>Ubah Konfigurasi</Button>
        <Button variant="outline" icon="refresh-circle-linear" onClick={() => setNotice("Proses kenaikan kelas belum tersedia di layanan.")}>Proses Kenaikan Kelas</Button>
      </div>
    </section>

    <div className={s.twoCards}>
      <div className={s.metricCard}><small>Total Tahun Akademik</small><strong>{apiYears.length.toLocaleString("id-ID")} Periode</strong><p>{apiSemesters.length.toLocaleString("id-ID")} Semester Tercatat</p></div>
      <div className={s.metricCard}><small>Periode Mendatang</small><strong>{nextSemester ? `${nextSemester.academic_year?.name ?? apiYears.find((year) => year.id === nextSemester.academic_year_id)?.name ?? "—"} ${nextSemester.name}` : "—"}</strong><p><span style={{ color: "var(--color-warning-dark)" }}>{nextSemester?.start_date ? `Dimulai ${displayDate(nextSemester.start_date)}` : "—"}</span></p></div>
    </div>

    <div className={s.panel} style={{ marginBottom: "var(--space-lg)" }}>
      <div className={s.panelTitle}><h2>Siklus Akademik Terjadwal</h2><span>{activeSemester ? activeSemester.name : "—"}</span></div>
      <div className={s.progressSegments}><span /><span /><span /></div>
      <div className={s.heroTags} style={{ marginTop: "var(--space-sm)" }}>
        <span style={{ color: "var(--color-text-secondary)", background: "transparent", border: 0 }}>● {activeSemester ? `Aktif: ${activeSemester.name}` : "Belum ada semester aktif"}</span>
        <span style={{ color: "var(--color-text-secondary)", background: "transparent", border: 0 }}>● {activeSemester?.end_date ? `Berakhir ${displayDate(activeSemester.end_date)}` : "Tanggal akhir belum ditentukan"}</span>
        <span style={{ color: "var(--color-text-secondary)", background: "transparent", border: 0 }}>● {nextSemester ? `Berikutnya: ${nextSemester.name}` : "Belum ada semester mendatang"}</span>
      </div>
    </div>

    <div className={s.panel}>
      <div className={s.toolbar}>
        <div className={s.tabs}>{["Semua Status", "Aktif", "Mendatang", "Selesai"].map((item) => <button key={item} aria-pressed={tab === item} onClick={() => setTab(item)}>{item}</button>)}</div>
        <div className={s.toolbarSpacer} />
        <SearchField value={keyword} onChange={setKeyword} placeholder="Saring tahun ajaran atau semester..." />
      </div>
      <div className={s.tableWrap}>
        <table className={s.dataTable}>
          <thead><tr><th>Tahun Ajaran &amp; Semester</th><th>Rentang Waktu Kalender</th><th>Rombel &amp; Siswa</th><th>Status Operasional</th><th>Aksi Manajemen</th></tr></thead>
          <tbody>
            {filtered.map((item) => <tr key={item.semester.id}>
              <td><span className={s.tableStrong}>{item.year}</span><span className={s.tableSub}>{item.note}</span></td>
              <td>{item.range}</td>
              <td><strong>{item.rombel}</strong><span className={s.tableSub}>{item.students}</span></td>
              <td><StatusBadge tone={item.status === "Aktif" ? "success" : item.status === "Mendatang" ? "info" : "neutral"}>{item.status}</StatusBadge></td>
              <td><div className={s.tableActions}>
                <Button variant="ghost" onClick={() => openEditSemester(item)}>Edit</Button>
                {item.status !== "Aktif" && <Button onClick={() => openActivate(item)}>Jadikan Aktif</Button>}
                <AdminTableIconButton icon="trash-bin-trash-linear" title="Hapus semester" ariaLabel={`Hapus ${item.year}`} disabled={pending} onClick={() => { setNotice(""); setDeleteSelected(item); }} />
              </div></td>
            </tr>)}
            {!loading && filtered.length === 0 && <tr><td colSpan={5} className={s.emptyCell}>{rows.length ? "Tidak ada periode yang cocok." : <EmptyState title="Belum ada semester" description="Semester yang tersedia dari backend akan muncul di sini." />}</td></tr>}
          </tbody>
        </table>
      </div>
      <div className={s.pagination}><span>Menampilkan {filtered.length.toLocaleString("id-ID")} dari {rows.length.toLocaleString("id-ID")} Semester</span></div>
    </div>

    {modal === "add-year" && <Modal title="Tambah Tahun Ajaran" subtitle="Tambahkan tahun ajaran agar dapat dipilih saat membuat semester." onClose={() => { if (!pending) setModal(null); }} footer={<><Button variant="outline" disabled={pending} onClick={() => setModal(null)}>Batal</Button><Button icon="check-linear" disabled={pending} onClick={() => void submitAcademicYear()}>{pending ? "Menyimpan..." : "Simpan Tahun Ajaran"}</Button></>}>
      <Field label="Tahun Ajaran" value={newYearName} onChange={setNewYearName} placeholder="2026/2027" error={fieldErrors.name?.[0] ?? fieldErrors.start_year?.[0]} required maxLength={9} />
      {notice && <InfoBanner tone="danger">{notice}</InfoBanner>}
    </Modal>}

    {(modal === "add-semester" || modal === "edit-semester") && <Modal title={modal === "add-semester" ? "Tambah Semester Baru" : "Edit Semester"} subtitle="Pilih tahun ajaran, semester, dan rentang tanggal kalender." onClose={() => { if (!pending) setModal(null); }} footer={<><Button variant="outline" disabled={pending} onClick={() => setModal(null)}>Batal</Button><Button icon="check-linear" disabled={pending || !apiYears.length} onClick={() => void submitSemester()}>{pending ? "Menyimpan..." : modal === "add-semester" ? "Simpan Semester" : "Simpan Perubahan"}</Button></>}>
      {notice && <InfoBanner tone="danger">{notice}</InfoBanner>}
      {!apiYears.length && <InfoBanner tone="warning">Belum ada tahun ajaran. Tambahkan tahun ajaran terlebih dahulu.</InfoBanner>}
      <div className={s.formGrid}>
        <label className={`${s.formField} ${fieldErrors.academic_year_id ? s.formFieldInvalid : ""}`}>
          <span>Tahun Ajaran <b>*</b></span>
          <select value={form.academicYearId} onChange={(event) => setForm({ ...form, academicYearId: event.target.value })}>
            <option value="">Pilih tahun ajaran</option>
            {apiYears.map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}
          </select>
          {fieldErrors.academic_year_id?.[0] && <small className={s.fieldError}>{fieldErrors.academic_year_id[0]}</small>}
        </label>
        <label className={`${s.formField} ${fieldErrors.semester_number ? s.formFieldInvalid : ""}`}>
          <span>Semester <b>*</b></span>
          <select value={form.semesterNumber} onChange={(event) => {
            const value = event.target.value;
            setForm({ ...form, semesterNumber: value, name: `Semester ${semesterLabel(Number(value))}` });
          }}>
            <option value="1">Semester 1 — Ganjil</option>
            <option value="2">Semester 2 — Genap</option>
          </select>
          {fieldErrors.semester_number?.[0] && <small className={s.fieldError}>{fieldErrors.semester_number[0]}</small>}
        </label>
        <div className={s.formFull}>
          <Field label="Nama Semester" value={form.name} onChange={(value) => setForm({ ...form, name: value })} error={fieldErrors.name?.[0]} required maxLength={100} placeholder="Semester Ganjil" />
        </div>
        <Field label="Tanggal Mulai" type="date" value={form.startDate} onChange={(value) => setForm({ ...form, startDate: value })} error={fieldErrors.start_date?.[0]} />
        <Field label="Tanggal Selesai" type="date" value={form.endDate} onChange={(value) => setForm({ ...form, endDate: value })} error={fieldErrors.end_date?.[0]} />
        {modal === "add-semester" && <label className={`${s.choicePill} ${s.formFull}`}><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />Aktifkan semester ini setelah disimpan</label>}
      </div>
    </Modal>}

    {modal === "activate" && selected && <Modal title={`Jadikan ${selected.year} sebagai periode aktif?`} onClose={() => { if (!pending) setModal(null); }} footer={<><Button variant="outline" disabled={pending} onClick={() => setModal(null)}>Batal</Button><Button disabled={pending} onClick={() => void activateSelected()}>{pending ? "Mengaktifkan..." : "Jadikan Aktif"}</Button></>}>
      <InfoBanner tone="warning">Semester aktif sebelumnya akan dinonaktifkan oleh layanan.</InfoBanner>
      {notice && <InfoBanner tone="danger">{notice}</InfoBanner>}
      <p className={s.pageDescription}>{selected.range} · {selected.semester.name}</p>
    </Modal>}

    {deleteSelected && <Modal title="Hapus semester?" subtitle={deleteSelected.year} onClose={() => { if (!pending) setDeleteSelected(null); }} footer={<><Button variant="outline" disabled={pending} onClick={() => setDeleteSelected(null)}>Batal</Button><Button variant="danger" disabled={pending} onClick={() => void deleteSemester()}>{pending ? "Menghapus..." : "Ya, Hapus Semester"}</Button></>}>
      {notice && <InfoBanner tone="danger">{notice}</InfoBanner>}
      <p className={s.pageDescription}>Semester ini akan dihapus dari daftar tahun ajaran.</p>
    </Modal>}
  </>;
}
