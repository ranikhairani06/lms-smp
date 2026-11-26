"use client";

import { useMemo, useState, type FormEvent } from "react";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import { Button, InfoBanner, Modal, PageHeading, Pagination, SearchField, TableEmpty, adminStyles as s } from "@/app/admin/_components/AdminUI";
import { ErrorState, LoadingState } from "@/components/lms/state";
import { useAdminMutation, useAdminResource } from "@/app/admin/_components/useAdminApi";

type Teacher = { id: number; employee_no?: string; user?: { name?: string } };
type Subject = { id: number; code: string; name: string };
type AcademicYear = { id: number; name: string; is_active: boolean };
type ClassRoom = { id: number; name: string; grade_level: number; academic_year_id: number | null };
type Assignment = {
  id: number;
  teacher_id: number;
  subject_id: number;
  academic_year_id: number;
  class_room_id: number;
  grade_level: number;
  teacher?: Teacher;
  subject?: Subject;
  academic_year?: AcademicYear;
  class_room?: ClassRoom;
};
type AssignmentForm = { teacher_id: string; subject_id: string; academic_year_id: string; class_room_id: string; grade_level: string };
const emptyForm: AssignmentForm = { teacher_id: "", subject_id: "", academic_year_id: "", class_room_id: "", grade_level: "7" };

export default function PenugasanGuruPage() {
  const assignments = useAdminResource<Assignment[]>("teaching-assignments");
  const teachers = useAdminResource<Teacher[]>("teachers");
  const subjects = useAdminResource<Subject[]>("subjects");
  const years = useAdminResource<AcademicYear[]>("academic-years");
  const classes = useAdminResource<ClassRoom[]>("classes");
  const [notice, setNotice] = useState("");
  const [keyword, setKeyword] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [deleteSelected, setDeleteSelected] = useState<Assignment | null>(null);
  const [form, setForm] = useState<AssignmentForm>(emptyForm);
  const [page, setPage] = useState(1);
  const loading = assignments.loading || teachers.loading || subjects.loading || years.loading || classes.loading;
  const loadError = assignments.error ?? teachers.error ?? subjects.error ?? years.error ?? classes.error;
  const refreshAll = async () => { await Promise.all([assignments.reload(), teachers.reload(), subjects.reload(), years.reload(), classes.reload()]); };
  const closeForm = () => { setModal(null); setSelected(null); };
  const create = useAdminMutation("POST", "teaching-assignments", async () => { setNotice("Penugasan guru berhasil ditambahkan."); closeForm(); await refreshAll(); }, refreshAll);
  const update = useAdminMutation("PUT", `teaching-assignments/${selected?.id ?? 0}`, async () => { setNotice("Penugasan guru berhasil diperbarui."); closeForm(); await refreshAll(); }, refreshAll);
  const remove = useAdminMutation("DELETE", `teaching-assignments/${deleteSelected?.id ?? 0}`, async () => { setNotice("Penugasan guru berhasil dihapus."); setDeleteSelected(null); await refreshAll(); }, refreshAll);
  const selectedClasses = useMemo(() => (classes.data ?? []).filter((item) => item.grade_level === Number(form.grade_level) && item.academic_year_id === Number(form.academic_year_id)), [classes.data, form.grade_level, form.academic_year_id]);
  const teacherName = (item: Assignment) => item.teacher?.user?.name ?? item.teacher?.employee_no ?? `Guru #${item.teacher_id}`;
  const filtered = useMemo(() => (assignments.data ?? []).filter((item) => `${teacherName(item)} ${item.subject?.name ?? ""} ${item.class_room?.name ?? ""} ${item.academic_year?.name ?? ""}`.toLowerCase().includes(keyword.toLowerCase())), [assignments.data, keyword]);
  const pageRows = filtered.slice((page - 1) * 10, page * 10);
  const openForm = (item?: Assignment) => {
    setSelected(item ?? null);
    setForm(item ? { teacher_id: String(item.teacher_id), subject_id: String(item.subject_id), academic_year_id: String(item.academic_year_id), class_room_id: String(item.class_room_id), grade_level: String(item.grade_level) } : emptyForm);
    setNotice("");
    setModal(item ? "edit" : "add");
  };
  const chooseYear = (value: string) => setForm((current) => ({ ...current, academic_year_id: value, class_room_id: "" }));
  const chooseGrade = (value: string) => setForm((current) => ({ ...current, grade_level: value, class_room_id: "" }));
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      teacher_id: Number(form.teacher_id),
      subject_id: Number(form.subject_id),
      academic_year_id: Number(form.academic_year_id),
      class_room_id: Number(form.class_room_id),
      grade_level: Number(form.grade_level),
    };
    const result = modal === "edit" ? await update.run(payload) : await create.run(payload);
    if (!result) setNotice(modal === "edit" ? update.error ?? "Penugasan guru belum dapat disimpan." : create.error ?? "Penugasan guru belum dapat disimpan.");
  };
  const fieldError = (key: keyof AssignmentForm) => create.fieldErrors[key]?.[0] ?? update.fieldErrors[key]?.[0];
  const selectField = (label: string, key: keyof AssignmentForm, options: { value: string; label: string }[], onChange?: (value: string) => void) => (
    <label className={s.formField}>
      <span>{label} <b>*</b></span>
      <select required value={form[key]} aria-invalid={Boolean(fieldError(key))} onChange={(event) => (onChange ?? ((value) => setForm((current) => ({ ...current, [key]: value }))))(event.target.value)}>
        <option value="">Pilih {label.toLowerCase()}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {fieldError(key) && <small className={s.fieldError} role="alert"><AdminIcon name="danger-triangle-linear" size={14} />{fieldError(key)}</small>}
    </label>
  );

  return <>
    <PageHeading breadcrumbs={["LMS", "Master Data", "Penugasan Guru"]} title="Penugasan Guru" description="Kelola penugasan guru, mata pelajaran, tahun ajaran, tingkat, dan rombongan belajar."
      actions={<Button icon="add-circle-linear" onClick={() => openForm()}>Tambah Penugasan</Button>} />
    {notice && <InfoBanner tone={create.error || update.error || remove.error ? "danger" : "success"}>{notice}</InfoBanner>}
    {loading && <LoadingState title="Memuat penugasan guru..." />}
    {loadError && <ErrorState title={loadError} action={<Button variant="outline" onClick={() => void refreshAll()}>Coba Lagi</Button>} />}
    <div className={s.panel}>
      <div className={s.toolbar}><SearchField value={keyword} onChange={(value) => { setKeyword(value); setPage(1); }} placeholder="Cari guru, mata pelajaran, kelas, atau tahun ajaran..." /><div className={s.toolbarSpacer} /></div>
      <div className={s.tableWrap}><table className={s.dataTable}>
        <thead><tr><th>Guru</th><th>Mata Pelajaran</th><th>Tahun Ajaran</th><th>Tingkat</th><th>Rombongan Belajar</th><th>Aksi</th></tr></thead>
        <tbody>{pageRows.map((item) => <tr key={item.id}>
          <td><span className={s.tableStrong}>{teacherName(item)}</span></td><td>{item.subject?.name ?? "—"}</td><td>{item.academic_year?.name ?? "—"}</td><td>Kelas {item.grade_level}</td><td>{item.class_room?.name ?? "—"}</td>
          <td><div className={s.tableActions}><Button variant="ghost" onClick={() => openForm(item)}>Edit</Button><Button variant="danger" disabled={remove.loading} onClick={() => { setNotice(""); setDeleteSelected(item); }}>Hapus</Button></div></td>
        </tr>)}{filtered.length === 0 && <TableEmpty colSpan={6} label={assignments.empty ? "Belum ada penugasan guru." : undefined} />}</tbody>
      </table></div>
      <Pagination current={page} total={Math.max(1, Math.ceil(filtered.length / 10))} onChange={setPage} label={`Menampilkan ${filtered.length ? (page - 1) * 10 + 1 : 0}-${Math.min(page * 10, filtered.length)} dari ${filtered.length} penugasan`} />
    </div>

    {modal && <Modal width="wide" title={modal === "add" ? "Tambah Penugasan Guru" : "Edit Penugasan Guru"} subtitle="Pilih guru, mata pelajaran, tahun ajaran, tingkat, dan kelas yang sesuai." onClose={closeForm} footer={<><Button variant="outline" disabled={create.loading || update.loading} onClick={closeForm}>Batal</Button><Button type="submit" form="assignment-form" disabled={create.loading || update.loading}>{create.loading || update.loading ? "Menyimpan..." : "Simpan Penugasan"}</Button></>}>
      <form id="assignment-form" onSubmit={submit}>
        {selectField("Guru", "teacher_id", (teachers.data ?? []).map((item) => ({ value: String(item.id), label: item.user?.name ?? item.employee_no ?? `Guru #${item.id}` })))}
        {selectField("Mata Pelajaran", "subject_id", (subjects.data ?? []).map((item) => ({ value: String(item.id), label: `${item.code} — ${item.name}` })))}
        {selectField("Tahun Ajaran", "academic_year_id", (years.data ?? []).map((item) => ({ value: String(item.id), label: `${item.name}${item.is_active ? " (Aktif)" : ""}` })), chooseYear)}
        {selectField("Tingkat", "grade_level", [7, 8, 9].map((grade) => ({ value: String(grade), label: `Kelas ${grade}` })), chooseGrade)}
        {selectField("Rombongan Belajar", "class_room_id", selectedClasses.map((item) => ({ value: String(item.id), label: item.name })))}
        {(create.error || update.error) && <InfoBanner tone="danger">{create.error ?? update.error}</InfoBanner>}
      </form>
    </Modal>}
    {deleteSelected && <Modal title="Hapus penugasan guru?" subtitle={`${teacherName(deleteSelected)} — ${deleteSelected.subject?.name ?? "Penugasan"}`} onClose={() => { if (!remove.loading) setDeleteSelected(null); }} footer={<><Button variant="outline" disabled={remove.loading} onClick={() => setDeleteSelected(null)}>Batal</Button><Button variant="danger" disabled={remove.loading} onClick={() => { void remove.run(); }}>{remove.loading ? "Menghapus..." : "Ya, Hapus"}</Button></>}>
      <p className={s.pageDescription}>Penugasan <strong>{teacherName(deleteSelected)}</strong> untuk <strong>{deleteSelected.subject?.name ?? "mata pelajaran"}</strong> akan dihapus.</p>
      {remove.error && <InfoBanner tone="danger">{remove.error}</InfoBanner>}
    </Modal>}
  </>;
}
