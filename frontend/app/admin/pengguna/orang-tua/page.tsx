"use client";

import { useState, type FormEvent } from "react";
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
import { AdminTableIconButton, Button, InfoBanner, TableEmpty, adminStyles as s } from "@/app/admin/_components/AdminUI";
import { ErrorState, LoadingState } from "@/components/lms/state";
import { useAdminMutation, useAdminResource } from "@/app/admin/_components/useAdminApi";

type ParentDirectoryItem = { id: number; name: string; relation: string; child: string; additionalChildren: number; phone: string; status: string; access: string };

type ApiStudent = { id: number; nisn: string; user?: { name?: string }; class_room?: { name?: string } | null };
type ApiParent = { id: number; phone?: string | null; address?: string | null; user?: { name?: string; email?: string | null; is_active?: boolean }; student?: ApiStudent | null };

const getParentSearchText = (parent: ParentDirectoryItem) => `${parent.child} ${parent.phone}`;
const matchesParentCategory = (parent: ParentDirectoryItem, category: string) => category === "Semua Kategori" || parent.relation === "—" || parent.relation === category;

export default function OrangTuaPage() {
  const parentResource = useAdminResource<ApiParent[]>("parents");
  const studentResource = useAdminResource<ApiStudent[]>("students");
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [editingParent, setEditingParent] = useState<ApiParent | null>(null);
  const [deleteParent, setDeleteParent] = useState<ApiParent | null>(null);
  const parentRows = (parentResource.data ?? []).map((item) => {
    const child = item.student;
    return {
      id: item.id,
      name: item.user?.name ?? "—",
      relation: "—",
      child: child ? `${child.user?.name ?? "—"} • ${child.class_room?.name?.replace(/^Kelas\s+/i, "") ?? "—"}` : "—",
      additionalChildren: 0,
      phone: item.phone ?? "—",
      status: item.user?.is_active === false ? "Nonaktif" : "Aktif",
      access: "—",
      address: item.address ?? "",
      email: item.user?.email ?? "",
    };
  });
  const [modal, setModal] = useState(false);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ name: "", relation: "Ayah Kandung", phone: "", email: "", address: "", student: "" });
  const [touched, setTouched] = useState<Partial<Record<"name" | "relation" | "phone" | "email" | "address" | "student", boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const emailIsValid = !form.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const phoneIsValid = /^\d{8,15}$/.test(form.phone);
  const fieldErrors = {
    name: form.name.trim() ? "" : "Nama lengkap wajib diisi.",
    relation: "",
    phone: !form.phone || phoneIsValid ? "" : "Nomor HP harus 8–15 digit angka.",
    email: emailIsValid ? "" : "Masukkan alamat email yang valid.",
    address: "",
    student: studentResource.data?.some((item) => `${item.user?.name ?? ""} · ${item.class_room?.name?.replace(/^Kelas\s+/i, "") ?? "â€”"}` === form.student || item.nisn === form.student) ? "" : "Pilih siswa tertaut yang terdaftar.",
  };
  const shouldShowError = (field: keyof typeof fieldErrors) => submitAttempted || Boolean(touched[field]);
  const errorCount = Object.values(fieldErrors).filter(Boolean).length;
  const displayedErrorCount = (Object.keys(fieldErrors) as (keyof typeof fieldErrors)[]).filter((field) => shouldShowError(field) && Boolean(fieldErrors[field])).length;
  const refreshParents = async () => { await parentResource.reload(); };
  const createParent = useAdminMutation("POST", "parents", async () => { setApiSuccess("Akun orang tua berhasil ditambahkan."); setModal(false); await refreshParents(); }, refreshParents);
  const updateParent = useAdminMutation("PUT", `parents/${editingParent?.id ?? "0"}`, async () => { setApiSuccess("Akun orang tua berhasil diperbarui."); setModal(false); await refreshParents(); }, refreshParents);
  const removeParent = useAdminMutation("DELETE", `parents/${deleteParent?.id ?? "0"}`, async () => { setApiSuccess("Akun orang tua berhasil dihapus."); setDeleteParent(null); await refreshParents(); }, refreshParents);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (errorCount > 0) return;
    const student = (studentResource.data ?? []).find((item) => `${item.user?.name ?? ""} • ${item.class_room?.name?.replace(/^Kelas\s+/i, "") ?? "—"}` === form.student || item.nisn === form.student);
    if (!student) return;
    const payload = { name: form.name.trim(), student_id: student.id, ...(form.phone ? { phone: form.phone } : {}), ...(form.address ? { address: form.address } : {}) };
    const result = editingParent ? await updateParent.run(payload) : await createParent.run(payload);
    if (!result) setApiError(editingParent ? updateParent.error ?? "Perubahan belum dapat disimpan." : createParent.error ?? "Akun belum dapat dibuat.");
    else { setApiError(""); setEditingParent(null); }
  };
  const { keyword, setKeyword, category, setCategory, filtered } = useAdminDirectoryFilter({
    items: parentRows,
    getSearchText: getParentSearchText,
    matchesCategory: matchesParentCategory,
    initialCategory: "Semua Kategori",
  });
  const statistics: ManagementStat[] = [
    { label: "Total Akun Orang Tua / Wali", value: String(parentRows.length), icon: "users-group-rounded-linear", tone: "primary" },
    { label: "Akun Aktif Bulan Ini", value: "—", icon: "check-circle-linear", tone: "success" },
  ];
  const pageRows = filtered.slice((page - 1) * 7, page * 7);
  const selectedStudent = (studentResource.data ?? []).find((item) => `${item.user?.name ?? ""} • ${item.class_room?.name?.replace(/^Kelas\s+/i, "") ?? "—"}` === form.student || item.nisn === form.student);

  return (
    <div className={s.parentManagementPage}>
      <PageHeading breadcrumbs={["LMS", "Manajemen Pengguna", "Manajemen Orang Tua (Wali)"]} title="Manajemen Orang Tua (Wali Murid)" description="Pengelolaan data akun wali murid terverifikasi, penautan akun siswa, dan nomor kontak darurat." />
      {apiError && <InfoBanner tone="danger">{apiError}</InfoBanner>}
      {apiSuccess && <InfoBanner tone="success">{apiSuccess}</InfoBanner>}
      {(createParent.error || updateParent.error) && !apiError && <InfoBanner tone="danger">{createParent.error ?? updateParent.error}</InfoBanner>}
      {(parentResource.loading || studentResource.loading) && <LoadingState title="Memuat data orang tua/wali..." />}
      {(parentResource.error || studentResource.error) && <ErrorState title={parentResource.error ?? studentResource.error ?? "Data belum dapat dimuat."} action={<Button variant="outline" onClick={() => void Promise.all([refreshParents(), studentResource.reload()])}>Coba Lagi</Button>} />}
      {/* Bagian tampilan: ringkasan akun orang tua dan aktivitas akun. */}
      <div className={`${s.statGridThree} ${s.adminStatRow}`}>
        {statistics.map((item) => <ManagementStatCard key={item.label} item={item} />)}
      </div>
      {/* Bagian tampilan: pencarian akun wali dan filter hubungan keluarga. */}
      <ManagementToolbar
        keyword={keyword}
        onKeywordChange={setKeyword}
        searchPlaceholder="Cari nomor HP atau nama siswa..."
        category={category}
        onCategoryChange={setCategory}
        categoryOptions={["Semua Kategori", "Ayah Kandung", "Ibu Kandung", "Wali Murid"]}
      />
      {/* Bagian tampilan: direktori akun wali dan daftar siswa yang tertaut. */}
      <ManagementTable className={s.parentTableWrap} tableClassName={`${s.dataTable} ${s.directoryTable} ${s.parentTable}`} footer={<Pagination className={s.parentPagination} variant="directory" current={page} total={Math.max(1, Math.ceil(filtered.length / 7))} onChange={setPage} label={`Menampilkan ${filtered.length ? (page - 1) * 7 + 1 : 0}-${Math.min(page * 7, filtered.length)} dari ${filtered.length} orang tua/wali`} />}>
          <thead><tr><th>Siswa Terhubung &amp; Kelas</th><th>Nomor HP</th><th>Status Akun</th><th>Terakhir Akses</th><th>Aksi</th></tr></thead>
          <tbody>{pageRows.map((parent) => <tr key={parent.id}>
            <td><div className={s.parentChildren}><StatusBadge tone="primary" className={s.directoryBadge}><AdminIcon name="graduation-cap-linear" size={12} /> {parent.child}</StatusBadge>{parent.additionalChildren > 0 && <span className={s.parentAdditionalChildren}>+{parent.additionalChildren} anak <AdminIcon name="info-circle-linear" size={12} /></span>}</div></td><td>{parent.phone}</td><td><StatusBadge tone={parent.status === "Aktif" ? "success" : "warning"} className={`${s.directoryBadge} ${s.directoryStatusBadge}`}>{parent.status}</StatusBadge></td><td>{parent.access}</td>
            <td><ManagementActionButtons><AdminTableIconButton icon="pen-linear" title="Edit" ariaLabel={`Edit ${parent.name}`} onClick={() => { const selected = parentResource.data?.find((item) => item.id === parent.id); if (!selected) return; setEditingParent(selected); setForm({ name: parent.name, relation: "Ayah Kandung", phone: selected.phone ?? "", email: selected.user?.email ?? "", address: selected.address ?? "", student: parent.child }); setApiSuccess(""); setTouched({}); setSubmitAttempted(false); setModal(true); }} /><AdminTableIconButton icon="trash-bin-trash-linear" title="Hapus" ariaLabel={`Hapus ${parent.name}`} disabled={removeParent.loading} onClick={() => setDeleteParent({ id: parent.id, user: { name: parent.name } })} /></ManagementActionButtons></td>
          </tr>)}{filtered.length === 0 && <TableEmpty colSpan={5} />}</tbody>
      </ManagementTable>

      {/* Bagian tampilan: modal registrasi wali, relasi keluarga, dan multi-child linking. */}
      {modal && <Modal title={editingParent ? "Edit Orang Tua / Wali" : "Tambah Orang Tua / Wali"} subtitle={editingParent ? "Perbarui informasi akun wali murid dan siswa tertaut." : "Registrasi akun wali murid dan tautkan dengan data peserta didik aktif."} onClose={() => setModal(false)} footer={<>{displayedErrorCount > 0 && <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", maxWidth: "220px", color: "var(--color-error)", fontSize: "var(--text-l12-size)", lineHeight: "var(--text-l12-line)" }}><AdminIcon name="danger-triangle-linear" size={16} />Pastikan {displayedErrorCount} kolom bermasalah telah diperbaiki</div>}<div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginLeft: "auto" }}><Button variant="outline" onClick={() => setModal(false)}>Batal</Button><Button type="submit" form="parent-form" icon="diskette-linear" disabled={displayedErrorCount > 0}>{editingParent ? "Simpan Perubahan" : "Simpan Akun Orang Tua"}</Button></div></>}>
        <form id="parent-form" onSubmit={handleSubmit} noValidate>
        <div className={s.formGrid}>
          <div className={s.formFull}><Field label="Nama Lengkap Orang Tua / Wali" value={form.name} onChange={(value) => setForm({ ...form, name: value })} onBlur={() => setTouched((current) => ({ ...current, name: true }))} error={createParent.fieldErrors.name?.[0] ?? updateParent.fieldErrors.name?.[0] ?? (shouldShowError("name") ? fieldErrors.name : undefined)} required placeholder="Nama lengkap beserta gelar (jika ada)" /></div>
          <div className={s.formFull}><div className={`${s.formField} ${shouldShowError("relation") && fieldErrors.relation ? s.formFieldInvalid : ""}`} role="radiogroup" aria-label="Hubungan dengan Siswa" aria-invalid={shouldShowError("relation") && Boolean(fieldErrors.relation)}><span>Hubungan dengan Siswa *</span><div className={s.choiceRow}>{["Ayah Kandung", "Ibu Kandung", "Wali Murid"].map((item) => <label className={s.choicePill} key={item}><input type="radio" name="relation" checked={form.relation === item} onBlur={() => setTouched((current) => ({ ...current, relation: true }))} onChange={() => setForm({ ...form, relation: item })} />{item}</label>)}</div>{shouldShowError("relation") && fieldErrors.relation && <small className={s.fieldError} role="alert"><AdminIcon name="danger-triangle-linear" size={14} />{fieldErrors.relation}</small>}</div></div>
          <Field label="Nomor WhatsApp / HP Aktif" value={form.phone} onChange={(value) => setForm({ ...form, phone: value.replace(/\D/g, "").slice(0, 15) })} onBlur={() => setTouched((current) => ({ ...current, phone: true }))} error={createParent.fieldErrors.phone?.[0] ?? updateParent.fieldErrors.phone?.[0] ?? (shouldShowError("phone") ? fieldErrors.phone : undefined)} required placeholder="08xxxxxxxxxx" inputMode="numeric" maxLength={15} />
          <Field label="Alamat Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} onBlur={() => setTouched((current) => ({ ...current, email: true }))} error={shouldShowError("email") ? fieldErrors.email : undefined} placeholder="nama@email.com" type="email" />
          <div className={s.formFull}><Field label="Alamat Domisili" value={form.address} onChange={(value) => setForm({ ...form, address: value })} onBlur={() => setTouched((current) => ({ ...current, address: true }))} error={createParent.fieldErrors.address?.[0] ?? updateParent.fieldErrors.address?.[0] ?? (shouldShowError("address") ? fieldErrors.address : undefined)} required placeholder="Alamat lengkap sesuai domisili" /></div>
        </div>
        <div className={s.formSectionTitle}><span>Siswa Tertaut (Student Linking) *</span><StatusBadge tone="primary">1 Siswa Terpilih</StatusBadge></div>
        <div className={shouldShowError("student") && fieldErrors.student ? s.formFieldInvalid : ""}><label className={s.searchField}><AdminIcon name="magnifer-linear" size={16} /><input aria-label="Siswa tertaut" aria-invalid={shouldShowError("student") && Boolean(fieldErrors.student || createParent.fieldErrors.student_id?.[0] || updateParent.fieldErrors.student_id?.[0])} aria-describedby={(shouldShowError("student") && fieldErrors.student) || createParent.fieldErrors.student_id?.[0] || updateParent.fieldErrors.student_id?.[0] ? "parent-student-error" : undefined} value={form.student} onBlur={() => setTouched((current) => ({ ...current, student: true }))} onChange={(e) => setForm({ ...form, student: e.target.value })} placeholder="Ketik NISN atau nama siswa untuk menautkan..." /></label>{((shouldShowError("student") && fieldErrors.student) || createParent.fieldErrors.student_id?.[0] || updateParent.fieldErrors.student_id?.[0]) && <small id="parent-student-error" className={s.fieldError} role="alert"><AdminIcon name="danger-triangle-linear" size={14} />{createParent.fieldErrors.student_id?.[0] ?? updateParent.fieldErrors.student_id?.[0] ?? fieldErrors.student}</small>}</div>
        <div className={s.linkedStudent} style={{ marginTop: "var(--space-sm)" }}><span className={s.initialAvatar}>{selectedStudent?.user?.name?.slice(0, 2).toUpperCase() ?? "\u2014"}</span><div style={{ flex: 1 }}><strong>{selectedStudent?.user?.name ?? "\u2014"} <StatusBadge tone="success">Siswa Terhubung Utama</StatusBadge></strong><small>NISN: {selectedStudent?.nisn ?? "\u2014"} {"\u2022"} Kelas {selectedStudent?.class_room?.name?.replace(/^Kelas\s+/i, "") ?? "\u2014"}</small><small>Wali Kelas: {"\u2014"}</small></div><button type="button" className={s.iconButton} aria-label="Hapus tautan"><AdminIcon name="close-linear" size={14} /></button></div>
        <button type="button" className={s.textLink} style={{ marginTop: "var(--space-md)", width: "100%", padding: "var(--space-sm)", border: "1px dashed var(--color-primary-light)", borderRadius: "var(--radius-s)" }}>+ Tautkan Anak / Siswa Lain (Multi-Child Support)</button>
        <div className={s.successLine} style={{ marginTop: "var(--space-md)" }}><AdminIcon name="check-circle-linear" size={15} /> Data terhubung dengan 1 peserta didik aktif</div>
        </form>
      </Modal>}
      {deleteParent && <Modal title="Hapus akun orang tua/wali?" subtitle={deleteParent.user?.name ?? ""} onClose={() => { if (!removeParent.loading) setDeleteParent(null); }} footer={<><Button variant="outline" disabled={removeParent.loading} onClick={() => setDeleteParent(null)}>Batal</Button><Button variant="danger" disabled={removeParent.loading} onClick={() => { void removeParent.run(); }}>{removeParent.loading ? "Menghapus..." : "Ya, Hapus"}</Button></>}>
        <p className={s.pageDescription}>Akun orang tua/wali <strong>{deleteParent.user?.name}</strong> akan dihapus.</p>
        {removeParent.error && <InfoBanner tone="danger">{removeParent.error}</InfoBanner>}
      </Modal>}
    </div>
  );
}
