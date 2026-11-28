"use client";

import { useMemo, useState, type FormEvent } from "react";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import { ErrorState, LoadingState } from "@/components/lms/state";
import { useAdminMutation, useAdminResource } from "@/app/admin/_components/useAdminApi";
import {
  AdminTableIconButton,
  Button,
  Field,
  InfoBanner,
  ManagementHeaderActions,
  Modal,
  PageHeading,
  Pagination,
  SearchField,
  SelectField,
  StatCard,
  TableEmpty,
  adminStyles as s,
} from "@/app/admin/_components/AdminUI";

type ApiTeacher = {
  id: number;
  employee_no?: string | null;
  user?: { id?: number; name?: string | null } | null;
};

type ApiYear = {
  id: number;
  name: string;
  start_year: number;
  is_active: boolean;
  is_deleted?: boolean;
};

type ApiClass = {
  id: number;
  name: string;
  grade_level: number;
  academic_year_id: number;
  homeroom_teacher_id?: number | null;
  homeroom_teacher?: ApiTeacher | null;
  academic_year?: ApiYear | null;
  students_count: number;
  is_active: boolean;
};

type RoomData = {
  id: number;
  name: string;
  gradeLevel: number;
  level: string;
  academicYearId: number;
  academicYearName: string;
  homeroomTeacherId: number | null;
  wali: string;
  nip: string;
  filled: number;
  isActive: boolean;
};

type RombelForm = {
  name: string;
  gradeLevel: string;
  academicYearId: string;
  homeroomTeacherId: string;
};

const gradeLevelLabel = (gradeLevel: number) =>
  `Kelas ${gradeLevel === 7 ? "VII" : gradeLevel === 8 ? "VIII" : "IX"}`;

const teacherOptionLabel = (teacher: ApiTeacher) => {
  const name = teacher.user?.name?.trim();
  const nip = teacher.employee_no?.trim();
  if (name && nip) return `${name} (${nip})`;
  return name || nip || `Guru #${teacher.id}`;
};

export default function RombelPage() {
  const classResource = useAdminResource<ApiClass[]>("classes");
  const yearResource = useAdminResource<ApiYear[]>("academic-years");
  const teacherResource = useAdminResource<ApiTeacher[]>("teachers");

  const [notice, setNotice] = useState("");
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("Semua Kategori");
  const [modal, setModal] = useState<"add" | "edit" | "detail" | null>(null);
  const [selected, setSelected] = useState<RoomData | null>(null);
  const [deleteSelected, setDeleteSelected] = useState<RoomData | null>(null);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<RombelForm>({
    name: "",
    gradeLevel: "7",
    academicYearId: "",
    homeroomTeacherId: "",
  });
  const [touched, setTouched] = useState<Partial<Record<keyof RombelForm, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const years = useMemo(
    () => (yearResource.data ?? []).filter((year) => !year.is_deleted),
    [yearResource.data],
  );
  const teachers = useMemo(() => teacherResource.data ?? [], [teacherResource.data]);

  const rows: RoomData[] = useMemo(() => {
    const teacherById = new Map(teachers.map((teacher) => [teacher.id, teacher]));
    const yearById = new Map(years.map((year) => [year.id, year]));

    return (classResource.data ?? []).map((item) => {
      const homeroomTeacher =
        item.homeroom_teacher ??
        (item.homeroom_teacher_id ? teacherById.get(item.homeroom_teacher_id) : undefined) ??
        null;
      const academicYear = item.academic_year ?? yearById.get(item.academic_year_id) ?? null;

      return {
        id: item.id,
        name: item.name,
        gradeLevel: item.grade_level,
        level: gradeLevelLabel(item.grade_level),
        academicYearId: item.academic_year_id,
        academicYearName: academicYear?.name ?? "—",
        homeroomTeacherId: item.homeroom_teacher_id ?? homeroomTeacher?.id ?? null,
        wali: homeroomTeacher?.user?.name?.trim() || "—",
        nip: homeroomTeacher?.employee_no?.trim() || "—",
        filled: item.students_count,
        isActive: item.is_active,
      };
    });
  }, [classResource.data, teachers, years]);

  const refreshData = async () => {
    await Promise.all([classResource.reload(), yearResource.reload(), teacherResource.reload()]);
  };

  const createClass = useAdminMutation(
    "POST",
    "classes",
    async () => {
      setNotice("Rombongan belajar berhasil ditambahkan.");
      setModal(null);
      await refreshData();
    },
    refreshData,
  );
  const updateClass = useAdminMutation(
    "PUT",
    `classes/${selected?.id ?? 0}`,
    async () => {
      setNotice("Rombongan belajar berhasil diperbarui.");
      setModal(null);
      await refreshData();
    },
    refreshData,
  );
  const deleteClass = useAdminMutation(
    "DELETE",
    `classes/${deleteSelected?.id ?? 0}`,
    async () => {
      setNotice("Rombongan belajar berhasil dihapus.");
      setDeleteSelected(null);
      await refreshData();
    },
    refreshData,
  );

  const fieldErrors: Record<keyof RombelForm, string> = {
    name: form.name.trim() ? "" : "Nama kelas wajib diisi.",
    gradeLevel: ["7", "8", "9"].includes(form.gradeLevel) ? "" : "Tingkat kelas wajib dipilih.",
    academicYearId: form.academicYearId ? "" : "Tahun ajaran wajib dipilih.",
    homeroomTeacherId: "",
  };

  const shouldShowError = (field: keyof RombelForm) => submitAttempted || Boolean(touched[field]);
  const errorCount = Object.values(fieldErrors).filter(Boolean).length;
  const displayedErrorCount = (Object.keys(fieldErrors) as (keyof RombelForm)[]).filter(
    (field) => shouldShowError(field) && Boolean(fieldErrors[field]),
  ).length;

  const filtered = useMemo(
    () =>
      rows.filter(
        (row) =>
          `${row.name} ${row.wali} ${row.nip} ${row.academicYearName}`
            .toLowerCase()
            .includes(keyword.toLowerCase()) &&
          (category === "Semua Kategori" || row.level === category),
      ),
    [rows, keyword, category],
  );
  const pageRows = filtered.slice((page - 1) * 7, page * 7);

  const show = (type: "add" | "edit" | "detail", row?: RoomData) => {
    if (row) {
      setSelected(row);
      setForm({
        name: row.name,
        gradeLevel: String(row.gradeLevel),
        academicYearId: row.academicYearId ? String(row.academicYearId) : "",
        homeroomTeacherId: row.homeroomTeacherId ? String(row.homeroomTeacherId) : "",
      });
    } else {
      const activeYear = years.find((year) => year.is_active) ?? years[0];
      setSelected(null);
      setForm({
        name: "",
        gradeLevel: "7",
        academicYearId: activeYear ? String(activeYear.id) : "",
        homeroomTeacherId: "",
      });
    }
    setTouched({});
    setSubmitAttempted(false);
    setModal(type);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (errorCount > 0) return;

    const payload = {
      name: form.name.trim(),
      grade_level: Number(form.gradeLevel),
      academic_year_id: Number(form.academicYearId),
      homeroom_teacher_id: form.homeroomTeacherId ? Number(form.homeroomTeacherId) : null,
    };

    const saved =
      modal === "add"
        ? await createClass.run(payload)
        : await updateClass.run({
            ...payload,
            ...(selected?.isActive === undefined ? {} : { is_active: selected.isActive }),
          });

    if (!saved) {
      setNotice(
        modal === "add"
          ? createClass.error ?? "Data rombel gagal disimpan."
          : updateClass.error ?? "Data rombel gagal disimpan.",
      );
    }
  };

  const isLoading = classResource.loading || yearResource.loading || teacherResource.loading;
  const loadError = classResource.error ?? yearResource.error ?? teacherResource.error;
  const isSaving = createClass.loading || updateClass.loading;
  const serverFieldError = (key: string) =>
    modal === "add" ? createClass.fieldErrors[key]?.[0] : updateClass.fieldErrors[key]?.[0];
  const formSubmitError = modal === "add" ? createClass.error : updateClass.error;

  const nameError = serverFieldError("name") ?? (shouldShowError("name") ? fieldErrors.name : undefined);
  const gradeLevelError =
    serverFieldError("grade_level") ?? (shouldShowError("gradeLevel") ? fieldErrors.gradeLevel : undefined);
  const academicYearError =
    serverFieldError("academic_year_id") ??
    (shouldShowError("academicYearId") ? fieldErrors.academicYearId : undefined);
  const homeroomTeacherError =
    serverFieldError("homeroom_teacher_id") ??
    (shouldShowError("homeroomTeacherId") ? fieldErrors.homeroomTeacherId : undefined);

  const totalStudents = rows.reduce((sum, row) => sum + row.filled, 0);
  const assignedWaliCount = rows.filter((row) => row.homeroomTeacherId !== null).length;

  return (
    <>
      <PageHeading
        breadcrumbs={["LMS", "Master Data", "Rombongan Belajar"]}
        title="Daftar Rombongan Belajar"
        description="Struktur kelas rombel, tahun ajaran, dan penugasan wali kelas aktif."
        actions={
          <ManagementHeaderActions
            onImport={() => setNotice("Import rombongan belajar belum tersedia di layanan.")}
            onAdd={() => show("add")}
            addLabel="Tambah Data Baru"
          />
        }
      />
      {notice && (
        <InfoBanner tone={createClass.error || updateClass.error || deleteClass.error ? "danger" : "success"}>
          {notice}
        </InfoBanner>
      )}
      {isLoading && <LoadingState title="Memuat rombongan belajar..." />}
      {loadError && (
        <ErrorState
          title={loadError}
          action={
            <Button variant="outline" onClick={() => void refreshData()}>
              Coba Lagi
            </Button>
          }
        />
      )}

      {/* Bagian tampilan: kartu total rombel dan jumlah siswa terdaftar. */}
      <div className={s.twoCards}>
        <StatCard
          label="Total Rombel"
          value={`${rows.length} Kelas`}
          detail={`VII: ${rows.filter((row) => row.level === "Kelas VII").length} Rombel  •  VIII: ${rows.filter((row) => row.level === "Kelas VIII").length} Rombel  •  IX: ${rows.filter((row) => row.level === "Kelas IX").length} Rombel`}
          icon="users-group-rounded-linear"
          tone="primary"
        />
        <StatCard
          label="Siswa Terdaftar & Wali Kelas"
          value={`${totalStudents} Siswa`}
          detail={`${assignedWaliCount} dari ${rows.length} rombel memiliki wali kelas`}
          icon="book-2-linear"
          tone="info"
        />
      </div>

      {/* Bagian tampilan: cari rombel berdasarkan nama kelas, wali kelas, atau tahun ajaran. */}
      <div className={s.toolbar}>
        <SearchField
          value={keyword}
          onChange={(value) => {
            setKeyword(value);
            setPage(1);
          }}
          placeholder="Cari nama rombel, wali kelas, atau tahun ajaran..."
        />
        <div className={s.toolbarSpacer} />
        <SelectField
          value={category}
          onChange={(value) => {
            setCategory(value);
            setPage(1);
          }}
          options={["Semua Kategori", "Kelas VII", "Kelas VIII", "Kelas IX"]}
        />
      </div>

      {/* Bagian tampilan: tabel kelas, tingkat, wali kelas, tahun ajaran, dan jumlah siswa. */}
      <div className={s.tableWrap}>
        <table className={s.dataTable}>
          <thead>
            <tr>
              <th>Nama Kelas</th>
              <th>Tingkat</th>
              <th>Wali Kelas &amp; NIP</th>
              <th>Tahun Ajaran</th>
              <th>Jumlah Siswa</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr key={row.id}>
                <td>
                  <span className={s.tableStrong}>{row.name}</span>
                </td>
                <td>
                  <span className={s.levelTag}>{row.level}</span>
                </td>
                <td>
                  {row.wali}
                  <span className={s.tableSub}>NIP {row.nip}</span>
                </td>
                <td>{row.academicYearName}</td>
                <td>{row.filled} Siswa</td>
                <td>
                  <div className={s.tableActions}>
                    <Button onClick={() => show("detail", row)}>Detail</Button>
                    <Button variant="ghost" onClick={() => show("edit", row)}>
                      Edit
                    </Button>
                    <AdminTableIconButton
                      icon="trash-bin-trash-linear"
                      title="Hapus"
                      ariaLabel={`Hapus ${row.name}`}
                      disabled={deleteClass.loading}
                      onClick={() => setDeleteSelected(row)}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <TableEmpty colSpan={6} />}
          </tbody>
        </table>
        <Pagination
          current={page}
          total={Math.max(1, Math.ceil(filtered.length / 7))}
          onChange={setPage}
          label={`Menampilkan ${filtered.length ? (page - 1) * 7 + 1 : 0}-${Math.min(page * 7, filtered.length)} dari ${rows.length} rombongan belajar`}
        />
      </div>

      {/* Bagian tampilan: modal tambah atau edit master rombongan belajar. */}
      {(modal === "add" || modal === "edit") && (
        <Modal
          title={modal === "add" ? "Tambah Rombongan Belajar" : "Edit Rombongan Belajar"}
          subtitle="Atur nama kelas, tingkat, tahun ajaran, dan wali kelas."
          onClose={() => setModal(null)}
          footer={
            <>
              {displayedErrorCount > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-sm)",
                    maxWidth: "220px",
                    color: "var(--color-error)",
                    fontSize: "var(--text-l12-size)",
                    lineHeight: "var(--text-l12-line)",
                  }}
                >
                  <AdminIcon name="danger-triangle-linear" size={16} />
                  Pastikan {displayedErrorCount} kolom bermasalah telah diperbaiki
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginLeft: "auto" }}>
                <Button variant="outline" disabled={isSaving} onClick={() => setModal(null)}>
                  Batal
                </Button>
                <Button type="submit" form="rombel-form" disabled={isSaving || displayedErrorCount > 0}>
                  {isSaving ? "Menyimpan..." : "Simpan Data"}
                </Button>
              </div>
            </>
          }
        >
          <form id="rombel-form" onSubmit={handleSubmit} noValidate>
            <div className={s.formGrid}>
              <Field
                label="Nama Kelas"
                value={form.name}
                onChange={(value) => setForm({ ...form, name: value })}
                onBlur={() => setTouched((current) => ({ ...current, name: true }))}
                error={nameError}
                required
                placeholder="Contoh: 7A"
              />
              <label className={`${s.formField} ${gradeLevelError ? s.formFieldInvalid : ""}`}>
                <span>
                  Tingkat <b>*</b>
                </span>
                <select
                  aria-invalid={Boolean(gradeLevelError)}
                  onBlur={() => setTouched((current) => ({ ...current, gradeLevel: true }))}
                  value={form.gradeLevel}
                  onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })}
                >
                  <option value="">Pilih tingkat kelas</option>
                  <option value="7">Kelas VII</option>
                  <option value="8">Kelas VIII</option>
                  <option value="9">Kelas IX</option>
                </select>
                {gradeLevelError && (
                  <small className={s.fieldError} role="alert">
                    <AdminIcon name="danger-triangle-linear" size={14} />
                    {gradeLevelError}
                  </small>
                )}
              </label>
              <label className={`${s.formField} ${academicYearError ? s.formFieldInvalid : ""}`}>
                <span>
                  Tahun Ajaran <b>*</b>
                </span>
                <select
                  aria-invalid={Boolean(academicYearError)}
                  onBlur={() => setTouched((current) => ({ ...current, academicYearId: true }))}
                  value={form.academicYearId}
                  onChange={(e) => setForm({ ...form, academicYearId: e.target.value })}
                >
                  <option value="">Pilih tahun ajaran</option>
                  {years.map((year) => (
                    <option key={year.id} value={String(year.id)}>
                      {year.name}
                      {year.is_active ? " (Aktif)" : ""}
                    </option>
                  ))}
                </select>
                {academicYearError && (
                  <small className={s.fieldError} role="alert">
                    <AdminIcon name="danger-triangle-linear" size={14} />
                    {academicYearError}
                  </small>
                )}
              </label>
              <label className={`${s.formField} ${homeroomTeacherError ? s.formFieldInvalid : ""}`}>
                <span>Wali Kelas</span>
                <select
                  aria-invalid={Boolean(homeroomTeacherError)}
                  onBlur={() => setTouched((current) => ({ ...current, homeroomTeacherId: true }))}
                  value={form.homeroomTeacherId}
                  onChange={(e) => setForm({ ...form, homeroomTeacherId: e.target.value })}
                >
                  <option value="">Pilih wali kelas (opsional)</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={String(teacher.id)}>
                      {teacherOptionLabel(teacher)}
                    </option>
                  ))}
                </select>
                {homeroomTeacherError && (
                  <small className={s.fieldError} role="alert">
                    <AdminIcon name="danger-triangle-linear" size={14} />
                    {homeroomTeacherError}
                  </small>
                )}
              </label>
            </div>
            {formSubmitError && (
              <div style={{ marginTop: "var(--space-md)" }}>
                <InfoBanner tone="danger">{formSubmitError}</InfoBanner>
              </div>
            )}
          </form>
        </Modal>
      )}

      {/* Bagian tampilan: rincian rombel. */}
      {modal === "detail" && selected && (
        <Modal
          title={`Detail ${selected.name}`}
          subtitle={`${selected.level} • ${selected.academicYearName}`}
          onClose={() => setModal(null)}
          footer={<Button onClick={() => setModal(null)}>Tutup</Button>}
        >
          <div className={s.formGrid}>
            <Field label="Nama Kelas" value={selected.name} onChange={() => undefined} />
            <Field label="Tingkat" value={selected.level} onChange={() => undefined} />
            <Field label="Tahun Ajaran" value={selected.academicYearName} onChange={() => undefined} />
            <Field label="Jumlah Siswa" value={`${selected.filled} siswa`} onChange={() => undefined} />
            <Field label="Wali Kelas" value={selected.wali} onChange={() => undefined} />
            <Field label="NIP Wali Kelas" value={selected.nip} onChange={() => undefined} />
          </div>
        </Modal>
      )}

      {deleteSelected && (
        <Modal
          title="Hapus rombongan belajar?"
          subtitle={deleteSelected.name}
          onClose={() => {
            if (!deleteClass.loading) setDeleteSelected(null);
          }}
          footer={
            <>
              <Button variant="outline" disabled={deleteClass.loading} onClick={() => setDeleteSelected(null)}>
                Batal
              </Button>
              <Button
                variant="danger"
                disabled={deleteClass.loading}
                onClick={() => {
                  void deleteClass.run();
                }}
              >
                {deleteClass.loading ? "Menghapus..." : "Ya, Hapus"}
              </Button>
            </>
          }
        >
          <p className={s.pageDescription}>
            Rombongan belajar <strong>{deleteSelected.name}</strong> akan dihapus.
          </p>
          {deleteClass.error && <InfoBanner tone="danger">{deleteClass.error}</InfoBanner>}
        </Modal>
      )}
    </>
  );
}
