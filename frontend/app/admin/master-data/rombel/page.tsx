"use client";

import { useMemo, useState, type FormEvent } from "react";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import { ErrorState, LoadingState } from "@/components/lms/state";
import { useAdminMutation, useAdminResource } from "@/app/admin/_components/useAdminApi";
import { AdminTableIconButton, Button, Field, InfoBanner, ManagementHeaderActions, Modal, PageHeading, Pagination, SearchField, SelectField, StatCard, TableEmpty, adminStyles as s } from "@/app/admin/_components/AdminUI";

const initialClasses = [
  { name: "Kelas 7A", level: "Kelas VII", wali: "Joko Susilo, S.Pd.", nip: "197908202005011008", room: "Ruang 7A (Gedung A Lt. 1)", filled: 35, capacity: 36 },
  { name: "Kelas 7B", level: "Kelas VII", wali: "Dewi Sartika, S.Pd.", nip: "198102182015032009", room: "Ruang 7B (Gedung A Lt. 1)", filled: 36, capacity: 36 },
  { name: "Kelas 7C", level: "Kelas VII", wali: "Bambang Wijanarko, S.Pd.", nip: "198811042011011009", room: "Ruang 7C (Gedung A Lt. 2)", filled: 34, capacity: 36 },
  { name: "Kelas 8A", level: "Kelas VIII", wali: "Siti Nurhaliza, M.Pd.", nip: "198607142010012005", room: "Ruang 8A (Gedung B Lt. 1)", filled: 38, capacity: 36 },
  { name: "Kelas 8B", level: "Kelas VIII", wali: "Endah Kusumastuti, S.Pd.", nip: "198509142010012023", room: "Ruang 8B (Gedung B Lt. 1)", filled: 35, capacity: 36 },
  { name: "Kelas 8C", level: "Kelas VIII", wali: "Hendra Gunawan, S.Kom.", nip: "198204122008011003", room: "Ruang 8C (Gedung B Lt. 2)", filled: 36, capacity: 36 },
  { name: "Kelas 9A", level: "Kelas IX", wali: "Ahmad Fauzi, M.Pd.", nip: "198703182011011009", room: "Ruang 9A (Gedung C Lt. 1)", filled: 34, capacity: 36 },
];

type Room = typeof initialClasses[number];
type RoomData = Omit<Room, "capacity"> & { capacity: number | null; id?: number; academicYearId?: number; isActive?: boolean };
type ApiClass = { id: number; name: string; grade_level: number; academic_year_id: number; students_count: number; is_active: boolean };
type ApiYear = { id: number; name: string; start_year: number; is_active: boolean };

export default function RombelPage() {
  const classResource = useAdminResource<ApiClass[]>("classes");
  const yearResource = useAdminResource<ApiYear[]>("academic-years");
  const [notice, setNotice] = useState("");
  const rows = (classResource.data ?? []).map((item) => ({
    id: item.id,
    academicYearId: item.academic_year_id,
    name: item.name,
    level: `Kelas ${item.grade_level === 7 ? "VII" : item.grade_level === 8 ? "VIII" : "IX"}`,
    wali: "—",
    nip: "—",
    room: "—",
    filled: item.students_count,
    capacity: null,
    isActive: item.is_active,
  }));
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("Semua Kategori");
  const [modal, setModal] = useState<"add" | "edit" | "detail" | null>(null);
  const [selected, setSelected] = useState<RoomData>(initialClasses[0]);
  const [deleteSelected, setDeleteSelected] = useState<RoomData | null>(null);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ name: "", level: "Kelas VII", wali: "", nip: "", room: "", capacity: "36" });
  const [touched, setTouched] = useState<Partial<Record<"name" | "level" | "wali" | "nip" | "room" | "capacity", boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const refreshData = async () => { await Promise.all([classResource.reload(), yearResource.reload()]); };
  const createClass = useAdminMutation("POST", "classes", async () => { setNotice("Rombongan belajar berhasil ditambahkan."); setModal(null); await refreshData(); }, refreshData);
  const updateClass = useAdminMutation("PUT", `classes/${selected.id ?? 0}`, async () => { setNotice("Rombongan belajar berhasil diperbarui."); setModal(null); await refreshData(); }, refreshData);
  const deleteClass = useAdminMutation("DELETE", `classes/${deleteSelected?.id ?? 0}`, async () => { setNotice("Rombongan belajar berhasil dihapus."); setDeleteSelected(null); await refreshData(); }, refreshData);
  const fieldErrors = {
    name: form.name.trim() ? "" : "Nama kelas wajib diisi.",
    level: form.level ? "" : "Tingkat kelas wajib dipilih.",
    wali: "",
    nip: "",
    room: "",
    capacity: "",
  };
  const shouldShowError = (field: keyof typeof fieldErrors) => submitAttempted || Boolean(touched[field]);
  const errorCount = Object.values(fieldErrors).filter(Boolean).length;
  const displayedErrorCount = (Object.keys(fieldErrors) as (keyof typeof fieldErrors)[]).filter((field) => shouldShowError(field) && Boolean(fieldErrors[field])).length;
  const filtered = useMemo(() => rows.filter((row) => `${row.name} ${row.wali}`.toLowerCase().includes(keyword.toLowerCase()) && (category === "Semua Kategori" || row.level === category)), [rows, keyword, category]);
  const pageRows = filtered.slice((page - 1) * 7, page * 7);
  const show = (type: "add" | "edit" | "detail", row?: RoomData) => {
    if (row) { setSelected(row); setForm({ name: row.name, level: row.level, wali: row.wali, nip: row.nip, room: row.room, capacity: String(row.capacity) }); }
    else setForm({ name: "", level: "Kelas VII", wali: "", nip: "", room: "", capacity: "36" });
    setTouched({});
    setSubmitAttempted(false);
    setModal(type);
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (errorCount > 0) return;
    const gradeLevel = form.level === "Kelas VII" ? 7 : form.level === "Kelas VIII" ? 8 : 9;
    const academicYearId = modal === "edit" ? selected.academicYearId : yearResource.data?.find((year) => year.is_active)?.id;
    if (!academicYearId) { setNotice("Tahun ajaran aktif belum tersedia."); return; }
    const payload = { name: form.name.trim(), grade_level: gradeLevel, academic_year_id: academicYearId };
    const saved = modal === "add" ? await createClass.run(payload) : await updateClass.run({ ...payload, ...(selected.isActive === undefined ? {} : { is_active: selected.isActive }) });
    if (!saved) setNotice(modal === "add" ? createClass.error ?? "Data rombel gagal disimpan." : updateClass.error ?? "Data rombel gagal disimpan.");
  };

  return (
    <>
      <PageHeading breadcrumbs={["LMS", "Master Data", "Rombongan Belajar"]} title="Daftar Rombongan Belajar" description="Struktur kelas rombel, penugasan wali kelas, dan kapasitas siswa aktif."
        actions={<ManagementHeaderActions onImport={() => setNotice("Import rombongan belajar belum tersedia di layanan.")} onAdd={() => show("add")} addLabel="Tambah Data Baru" />} />
      {notice && <InfoBanner tone={createClass.error || updateClass.error ? "danger" : "success"}>{notice}</InfoBanner>}
      {(classResource.loading || yearResource.loading) && <LoadingState title="Memuat rombongan belajar..." />}
      {(classResource.error || yearResource.error) && <ErrorState title={classResource.error ?? yearResource.error ?? "Data belum dapat dimuat."} action={<Button variant="outline" onClick={() => void refreshData()}>Coba Lagi</Button>} />}
      {/* Bagian tampilan: kartu total rombel dan kapasitas siswa terisi. */}
        <div className={s.twoCards}>
        <StatCard label="Total Rombel" value={`${rows.length} Kelas`} detail={`VII: ${rows.filter((row) => row.level === "Kelas VII").length} Rombel  •  VIII: ${rows.filter((row) => row.level === "Kelas VIII").length} Rombel  •  IX: ${rows.filter((row) => row.level === "Kelas IX").length} Rombel`} icon="users-group-rounded-linear" tone="primary" />
        <StatCard label="Kapasitas & Siswa Terisi" value={`${rows.reduce((sum, row) => sum + row.filled, 0)} / — Siswa`} detail="—" icon="book-2-linear" tone="info" />
      </div>
      {/* Bagian tampilan: cari rombel berdasarkan nama kelas atau wali kelas. */}
      <div className={s.toolbar}><SearchField value={keyword} onChange={setKeyword} placeholder="Cari nama rombel atau wali kelas..." /><div className={s.toolbarSpacer} /><SelectField value={category} onChange={setCategory} options={["Semua Kategori", "Kelas VII", "Kelas VIII", "Kelas IX"]} /></div>
      {/* Bagian tampilan: tabel kelas, wali kelas, ruang, dan kapasitas. */}
      <div className={s.tableWrap}>
        <table className={s.dataTable}>
          <thead><tr><th>Nama Kelas</th><th>Tingkat</th><th>Wali Kelas &amp; NIP</th><th>Ruang Kelas</th><th>Kapasitas / Siswa</th><th>Aksi</th></tr></thead>
          <tbody>{pageRows.map((row) => {
            const over = row.capacity !== null && row.filled > row.capacity;
            const percent = row.capacity ? Math.min(100, Math.round((row.filled / row.capacity) * 100)) : null;
            return <tr key={row.name}>
              <td><span className={s.tableStrong}>{row.name}</span>{over && <span className={s.tableSub} style={{ color: "var(--color-error)" }}>⚠ Kapasitas Berlebihan</span>}</td><td><span className={s.levelTag}>{row.level}</span></td>
              <td>{row.wali}<span className={s.tableSub}>NIP {row.nip}</span></td><td>{row.room}</td>
              <td><div className={s.capacity}><div className={s.capacityText}><span>{row.filled} / {row.capacity ?? "—"} Siswa</span><b style={{ color: over ? "var(--color-error)" : "var(--color-primary)" }}>{percent === null ? "—" : over ? `${Math.round((row.filled / row.capacity!) * 100)}%` : percent === 100 ? "Penuh" : `${percent}%`}</b></div><div className={s.capacityBar}><span className={over ? s.capacityOver : ""} style={{ width: `${percent ?? 0}%` }} /></div></div></td>
              <td><div className={s.tableActions}><Button onClick={() => show("detail", row)}>Detail</Button><Button variant="ghost" onClick={() => show("edit", row)}>Edit</Button><AdminTableIconButton icon="trash-bin-trash-linear" title="Hapus" ariaLabel={`Hapus ${row.name}`} disabled={deleteClass.loading} onClick={() => setDeleteSelected(row)} /></div></td>
            </tr>;
          })}{filtered.length === 0 && <TableEmpty colSpan={6} />}</tbody>
        </table>
        <Pagination current={page} total={Math.max(1, Math.ceil(filtered.length / 7))} onChange={setPage} label={`Menampilkan ${filtered.length ? (page - 1) * 7 + 1 : 0}-${Math.min(page * 7, filtered.length)} dari ${rows.length} rombongan belajar`} />
      </div>

      {/* Bagian tampilan: modal tambah atau edit master rombongan belajar. */}
      {(modal === "add" || modal === "edit") && <Modal title={modal === "add" ? "Tambah Rombongan Belajar" : "Edit Rombongan Belajar"} subtitle="Atur tingkat, wali kelas, ruang, dan kapasitas siswa." onClose={() => setModal(null)} footer={<>{displayedErrorCount > 0 && <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", maxWidth: "220px", color: "var(--color-error)", fontSize: "var(--text-l12-size)", lineHeight: "var(--text-l12-line)" }}><AdminIcon name="danger-triangle-linear" size={16} />Pastikan {displayedErrorCount} kolom bermasalah telah diperbaiki</div>}<div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginLeft: "auto" }}><Button variant="outline" onClick={() => setModal(null)}>Batal</Button><Button type="submit" form="rombel-form" disabled={displayedErrorCount > 0}>Simpan Data</Button></div></>}>
        <form id="rombel-form" onSubmit={handleSubmit} noValidate>
        <div className={s.formGrid}>
          <Field label="Nama Kelas" value={form.name} onChange={(value) => setForm({ ...form, name: value })} onBlur={() => setTouched((current) => ({ ...current, name: true }))} error={createClass.fieldErrors.name?.[0] ?? updateClass.fieldErrors.name?.[0] ?? (shouldShowError("name") ? fieldErrors.name : undefined)} required placeholder="Contoh: Kelas 7D" />
          <label className={`${s.formField} ${shouldShowError("level") && fieldErrors.level ? s.formFieldInvalid : ""}`}><span>Tingkat *</span><select aria-invalid={shouldShowError("level") && Boolean(fieldErrors.level || createClass.fieldErrors.grade_level || updateClass.fieldErrors.grade_level)} onBlur={() => setTouched((current) => ({ ...current, level: true }))} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}><option value="">Pilih tingkat kelas</option><option>Kelas VII</option><option>Kelas VIII</option><option>Kelas IX</option></select>{(shouldShowError("level") && fieldErrors.level || createClass.fieldErrors.grade_level?.[0] || updateClass.fieldErrors.grade_level?.[0]) && <small className={s.fieldError} role="alert"><AdminIcon name="danger-triangle-linear" size={14} />{createClass.fieldErrors.grade_level?.[0] ?? updateClass.fieldErrors.grade_level?.[0] ?? fieldErrors.level}</small>}</label>
          <Field label="Wali Kelas" value={form.wali} onChange={(value) => setForm({ ...form, wali: value })} onBlur={() => setTouched((current) => ({ ...current, wali: true }))} error={shouldShowError("wali") ? fieldErrors.wali : undefined} required placeholder="Nama guru" />
          <Field label="NIP Wali Kelas" value={form.nip} onChange={(value) => setForm({ ...form, nip: value })} onBlur={() => setTouched((current) => ({ ...current, nip: true }))} error={shouldShowError("nip") ? fieldErrors.nip : undefined} required placeholder="NIP" />
          <Field label="Ruang Kelas" value={form.room} onChange={(value) => setForm({ ...form, room: value })} onBlur={() => setTouched((current) => ({ ...current, room: true }))} error={shouldShowError("room") ? fieldErrors.room : undefined} required placeholder="Ruang kelas" />
          <Field label="Kapasitas Maksimal" value={form.capacity} onChange={(value) => setForm({ ...form, capacity: value })} onBlur={() => setTouched((current) => ({ ...current, capacity: true }))} error={shouldShowError("capacity") ? fieldErrors.capacity : undefined} required type="number" inputMode="numeric" min={1} step={1} />
        </div>
        </form>
      </Modal>}
      {/* Bagian tampilan: rincian rombel dan daftar status kapasitas. */}
      {modal === "detail" && <Modal title={`Detail ${selected.name}`} subtitle={`${selected.level} • ${selected.room}`} onClose={() => setModal(null)} footer={<Button onClick={() => setModal(null)}>Tutup</Button>}>
        <div className={s.formGrid}><Field label="Wali Kelas" value={selected.wali} onChange={() => undefined} /><Field label="NIP" value={selected.nip} onChange={() => undefined} /><Field label="Jumlah Siswa" value={`${selected.filled} siswa`} onChange={() => undefined} /><Field label="Kapasitas" value={selected.capacity === null ? "—" : `${selected.capacity} siswa`} onChange={() => undefined} /></div>
      </Modal>}
      {deleteSelected && <Modal title="Hapus rombongan belajar?" subtitle={deleteSelected.name} onClose={() => { if (!deleteClass.loading) setDeleteSelected(null); }} footer={<><Button variant="outline" disabled={deleteClass.loading} onClick={() => setDeleteSelected(null)}>Batal</Button><Button variant="danger" disabled={deleteClass.loading} onClick={() => { void deleteClass.run(); }}>{deleteClass.loading ? "Menghapus..." : "Ya, Hapus"}</Button></>}>
        <p className={s.pageDescription}>Rombongan belajar <strong>{deleteSelected.name}</strong> akan dihapus.</p>
        {deleteClass.error && <InfoBanner tone="danger">{deleteClass.error}</InfoBanner>}
      </Modal>}
    </>
  );
}
