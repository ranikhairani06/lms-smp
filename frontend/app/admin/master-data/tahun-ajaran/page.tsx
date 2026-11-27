"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import { AdminTableIconButton, Button, Field, InfoBanner, Modal, PageHeading, SearchField, StatusBadge, adminStyles as s } from "@/app/admin/_components/AdminUI";
import { EmptyState, ErrorState, LoadingState } from "@/components/lms/state";
import { ApiError, apiRequest } from "@/lib/api";
import { useAdminMutation, useAdminResource } from "@/app/admin/_components/useAdminApi";

type AcademicYear = { id: number; name: string; start_year: number; is_active: boolean };
type Semester = { id: number; academic_year_id: number; semester_number: number; name: string; start_date?: string | null; end_date?: string | null; is_active: boolean; academicYear?: { id: number; name: string; start_year: number } };
type YearRow = { id: number; year: string; status: string; note: string; range: string; rombel: string; students: string; semester?: Semester };

const dateValue = (value?: string | null) => value ? value.slice(0, 10) : "";
const periodStatus = (semester: Semester) => {
  if (semester.is_active) return "Aktif";
  const now = new Date().toISOString().slice(0, 10);
  if (semester.start_date && semester.start_date.slice(0, 10) > now) return "Mendatang";
  if (semester.end_date && semester.end_date.slice(0, 10) < now) return "Selesai";
  return "—";
};

export default function TahunAjaranPage() {
  const router = useRouter();
  const yearResource = useAdminResource<AcademicYear[]>("academic-years");
  const semesterResource = useAdminResource<Semester[]>("semesters");
  const apiYears = yearResource.data ?? [];
  const apiSemesters = semesterResource.data ?? [];
  const rows: YearRow[] = apiSemesters.map((semester) => {
    const academicYear = apiYears.find((item) => item.id === semester.academic_year_id) || semester.academicYear;
    const yearName = academicYear?.name || "—";
    const status = periodStatus(semester);
    return { id: semester.academic_year_id, year: `${yearName} – ${semester.name}`, status, note: semester.is_active ? "Periode Aktif" : semester.name, range: `${semester.start_date ? new Date(`${dateValue(semester.start_date)}T00:00:00`).toLocaleDateString("id-ID") : "—"} – ${semester.end_date ? new Date(`${dateValue(semester.end_date)}T00:00:00`).toLocaleDateString("id-ID") : "—"}`, rombel: "—", students: "—", semester };
  });
  const [notice, setNotice] = useState("");
  const [keyword, setKeyword] = useState("");
  const [tab, setTab] = useState("Semua Status");
  const [modal, setModal] = useState<"add" | "activate" | "edit" | null>(null);
  const [selected, setSelected] = useState<YearRow | null>(null);
  const [deleteSelected, setDeleteSelected] = useState<YearRow | null>(null);
  const [form, setForm] = useState({ academic: "", gStart: "", gEnd: "", eStart: "", eEnd: "" });
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const createdYearId = useRef<number | null>(null);
  const createdSemesterNumbers = useRef(new Set<number>());

  const refresh = async () => { await Promise.all([yearResource.reload(), semesterResource.reload()]); };
  const createYear = useAdminMutation<AcademicYear>("POST", "academic-years", undefined, refresh);
  const activateYear = useAdminMutation("POST", `academic-years/${selected?.id ?? 0}/activate`, undefined, refresh);
  const deleteYear = useAdminMutation("DELETE", `academic-years/${deleteSelected?.id ?? 0}`, async () => { setNotice("Tahun ajaran berhasil dihapus."); setDeleteSelected(null); await refresh(); }, refresh);
  const filtered = useMemo(() => rows.filter((item) => (tab === "Semua Status" || item.status === tab) && item.year.toLowerCase().includes(keyword.toLowerCase())), [rows, tab, keyword]);
  const activeSemester = apiSemesters.find((item) => item.is_active);
  const activeYear = apiYears.find((item) => item.id === activeSemester?.academic_year_id) || apiYears.find((item) => item.is_active);
  const nextSemester = apiSemesters.filter((item) => !item.is_active && item.start_date && item.start_date.slice(0, 10) > new Date().toISOString().slice(0, 10)).sort((a, b) => String(a.start_date).localeCompare(String(b.start_date)))[0];
  const activeSemesterCount = apiSemesters.length;
  const loading = yearResource.loading || semesterResource.loading;
  const loadError = yearResource.error || semesterResource.error;

  const submitYear = async (mode: "add" | "edit") => {
    setNotice(""); setFieldErrors({});
    if (mode === "edit") {
      const semester = selected?.semester;
      if (!semester) { setNotice("Semester tidak tersedia untuk diperbarui."); return; }
      setPending(true);
      try {
        await apiRequest(`admin/semesters/${semester.id}`, { method: "PUT", body: JSON.stringify({ academic_year_id: semester.academic_year_id, semester_number: semester.semester_number, name: semester.name, start_date: form.gStart || null, end_date: form.gEnd || null }) });
        setNotice("Konfigurasi semester berhasil diperbarui."); setModal(null); await refresh();
      } catch (cause) {
        if (cause instanceof ApiError) { setFieldErrors(cause.fieldErrors); if (cause.status === 401) router.replace("/login?role=admin&reason=session-expired"); if (cause.status === 404) await refresh(); }
        setNotice(cause instanceof Error ? cause.message : "Perubahan belum dapat disimpan.");
      } finally { setPending(false); }
      return;
    }
    const match = form.academic.match(/^(\d{4})\s*\/\s*(\d{4})$/);
    if (!match) { setNotice("Masukkan tahun ajaran dengan format YYYY/YYYY."); return; }
    if (!form.gStart || !form.gEnd || !form.eStart || !form.eEnd) { setNotice("Lengkapi tanggal mulai dan selesai untuk kedua semester."); return; }
    setPending(true);
    try {
      let yearId = createdYearId.current;
      if (!yearId) {
        const created = await createYear.run({ name: `${match[1]}/${match[2]}`, start_year: Number(match[1]) });
        if (!created?.id) { setFieldErrors(createYear.fieldErrors); setNotice(createYear.error || "Tahun ajaran gagal disimpan."); return; }
        yearId = created.id; createdYearId.current = yearId;
      }
      const configurations = [
        { semester_number: 1, name: "Ganjil", start_date: form.gStart, end_date: form.gEnd },
        { semester_number: 2, name: "Genap", start_date: form.eStart, end_date: form.eEnd },
      ];
      for (const config of configurations) {
        if (createdSemesterNumbers.current.has(config.semester_number)) continue;
        await apiRequest("admin/semesters", { method: "POST", body: JSON.stringify({ academic_year_id: yearId, ...config }) });
        createdSemesterNumbers.current.add(config.semester_number);
      }
      setNotice("Tahun ajaran dan semester berhasil ditambahkan."); setModal(null); createdYearId.current = null; createdSemesterNumbers.current.clear(); await refresh();
    } catch (cause) {
      if (cause instanceof ApiError) { setFieldErrors(cause.fieldErrors); if (cause.status === 401) router.replace("/login?role=admin&reason=session-expired"); if (cause.status === 404) await refresh(); }
      setNotice(cause instanceof Error ? cause.message : "Data kalender gagal disimpan.");
    } finally { setPending(false); }
  };

  const activateSelected = async () => {
    if (!selected?.semester) { setNotice("Semester yang dipilih tidak tersedia."); return; }
    setPending(true);
    try {
      const activatedYear = await activateYear.run();
      if (!activatedYear) return;
      await apiRequest(`admin/semesters/${selected.semester.id}/activate`, { method: "POST" });
      setNotice("Tahun ajaran dan semester berhasil diaktifkan."); setModal(null); await refresh();
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) router.replace("/login?role=admin&reason=session-expired");
      if (cause instanceof ApiError && cause.status === 404) await refresh();
      setNotice(cause instanceof Error ? cause.message : "Semester gagal diaktifkan.");
    } finally { setPending(false); }
  };

  return <>
    <PageHeading breadcrumbs={["LMS", "Master Data", "Tahun Ajaran"]} title="Master Data Tahun Ajaran & Semester" description="Konfigurasi tahun akademik, semester aktif, dan transisi rombongan belajar." actions={<Button icon="calendar-add-linear" onClick={() => { createdYearId.current = null; createdSemesterNumbers.current.clear(); setForm({ academic: "", gStart: "", gEnd: "", eStart: "", eEnd: "" }); setModal("add"); }}>Tambah Tahun Ajaran</Button>} />
    {notice && <InfoBanner tone={notice.includes("berhasil") ? "success" : "danger"}>{notice}</InfoBanner>}
    {loading && <LoadingState title="Memuat tahun ajaran dan semester..." />}
    {loadError && <ErrorState title={loadError} action={<Button variant="outline" onClick={() => void refresh()}>Coba Lagi</Button>} />}
    <section className={s.yearHero}>
      <div><div className={s.heroTags}><span>TAHUN AJARAN BERJALAN</span><span>STATUS: {activeYear ? "AKTIF" : "—"}</span><span>ID: {activeYear?.id ?? "—"}</span></div><h2>{activeYear?.name ?? "—"}{activeSemester ? ` – Semester ${activeSemester.name}` : ""}</h2><div className={s.heroTags}><span><AdminIcon name="calendar-linear" size={12} /> {activeSemester ? `${activeSemester.start_date ? dateValue(activeSemester.start_date) : "—"} – ${activeSemester.end_date ? dateValue(activeSemester.end_date) : "—"}` : "—"}</span><span><AdminIcon name="users-group-rounded-linear" size={12} /> —</span></div></div>
      <div className={s.heroActions}><Button variant="outline" icon="pen-linear" onClick={() => { if (activeYear && activeSemester) { const row = rows.find((item) => item.semester?.id === activeSemester.id); if (row) { setSelected(row); setForm({ academic: activeYear.name, gStart: dateValue(activeSemester.start_date), gEnd: dateValue(activeSemester.end_date), eStart: "", eEnd: "" }); setModal("edit"); } } }}>Ubah Konfigurasi</Button><Button variant="outline" icon="refresh-circle-linear" onClick={() => setNotice("Proses kenaikan kelas belum tersedia di layanan.")}>Proses Kenaikan Kelas</Button></div>
    </section>
    <div className={s.twoCards}><div className={s.metricCard}><small>Total Tahun Akademik</small><strong>{apiYears.length} Periode</strong><p>{activeSemesterCount} Semester Tercatat</p></div><div className={s.metricCard}><small>Periode Mendatang</small><strong>{nextSemester ? `${nextSemester.academicYear?.name || apiYears.find((item) => item.id === nextSemester.academic_year_id)?.name || "—"} ${nextSemester.name}` : "—"}</strong><p><span style={{ color: "var(--color-warning-dark)" }}>{nextSemester?.start_date ? `◷ Dimulai ${dateValue(nextSemester.start_date)}` : "—"}</span></p></div></div>
    <div className={s.panel} style={{ marginBottom: "var(--space-lg)" }}><div className={s.panelTitle}><h2>Siklus Akademik Terjadwal</h2><span>—</span></div><div className={s.progressSegments}><span /><span /><span /></div><div className={s.heroTags} style={{ marginTop: "var(--space-sm)" }}><span style={{ color: "var(--color-text-secondary)", background: "transparent", border: 0 }}>● Pembelajaran Aktif</span><span style={{ color: "var(--color-text-secondary)", background: "transparent", border: 0 }}>● Asesmen Akhir &amp; Rapor</span><span style={{ color: "var(--color-text-secondary)", background: "transparent", border: 0 }}>● {nextSemester ? `Transisi ${nextSemester.name} ${nextSemester.academicYear?.name || ""}` : "—"}</span></div></div>
    <div className={s.panel}><div className={s.toolbar}><div className={s.tabs}>{["Semua Status", "Aktif", "Mendatang", "Selesai"].map((item) => <button key={item} aria-pressed={tab === item} onClick={() => setTab(item)}>{item}</button>)}</div><div className={s.toolbarSpacer} /><SearchField value={keyword} onChange={setKeyword} placeholder="Saring tahun ajaran..." /></div>
      <div className={s.tableWrap}><table className={s.dataTable}><thead><tr><th>Tahun Ajaran &amp; Semester</th><th>Rentang Waktu Kalender</th><th>Rombel &amp; Siswa</th><th>Status Operasional</th><th>Aksi Manajemen</th></tr></thead>
        <tbody>{filtered.map((item) => <tr key={item.semester?.id ?? item.id}><td><span className={s.tableStrong}>{item.year}</span><span className={s.tableSub}>{item.note}</span></td><td>{item.range}</td><td><strong>{item.rombel}</strong><span className={s.tableSub}>{item.students}</span></td><td><StatusBadge tone={item.status === "Aktif" ? "success" : item.status === "Mendatang" ? "info" : "neutral"}>{item.status}</StatusBadge></td><td><div className={s.tableActions}>{item.status !== "Aktif" && <Button variant="ghost" onClick={() => { setSelected(item); setForm({ academic: item.year.split(" – ")[0], gStart: dateValue(item.semester?.start_date), gEnd: dateValue(item.semester?.end_date), eStart: "", eEnd: "" }); setModal("edit"); }}>Edit</Button>}{item.status !== "Aktif" && <Button onClick={() => { setSelected(item); setModal("activate"); }}>Jadikan Aktif</Button>}{item.status === "Aktif" && <span className={s.tableSub}>Sedang berjalan</span>}{item.semester && apiSemesters.findIndex((semester) => semester.academic_year_id === item.id) === apiSemesters.findIndex((semester) => semester.id === item.semester?.id) && <AdminTableIconButton icon="trash-bin-trash-linear" title="Hapus" ariaLabel={`Hapus tahun ajaran ${item.year}`} disabled={deleteYear.loading} onClick={() => setDeleteSelected(item)} />}</div></td></tr>)}{!loading && filtered.length === 0 && <tr><td colSpan={5} className={s.emptyCell}>{rows.length ? "Tidak ada periode yang cocok." : <EmptyState title="Belum ada semester" description="Semester yang tersedia dari backend akan muncul di sini." />}</td></tr>}</tbody>
      </table></div><div className={s.pagination}><span>Menampilkan {filtered.length} dari {rows.length} Semester</span><div className={s.pageControls}><button disabled>‹</button><button className={s.pageCurrent}>1</button></div></div>
    </div>
    {modal === "add" && <Modal title="Tambah Tahun Ajaran Baru" subtitle="Konfigurasi satu tahun akademik lengkap dengan semester Ganjil dan Genap sekaligus." onClose={() => { if (!pending) setModal(null); }} footer={<><Button variant="outline" disabled={pending} onClick={() => setModal(null)}>Batal</Button><Button icon="check-linear" disabled={pending} onClick={() => void submitYear("add")}>{pending ? "Menyimpan..." : "Simpan Tahun Ajaran"}</Button></>}>
      <InfoBanner>Kedua semester dibuat sekaligus. Status semester mengikuti konfigurasi yang tersimpan.</InfoBanner><Field label="Tahun Akademik" value={form.academic} onChange={(value) => setForm({ ...form, academic: value })} error={fieldErrors.name?.[0] ?? fieldErrors.start_year?.[0]} required /><div className={s.formSectionTitle}>Konfigurasi Semester Ganjil (Gasal) <StatusBadge tone="primary">Semester 1</StatusBadge></div><div className={s.formGrid}><Field label="Tanggal Mulai" value={form.gStart} onChange={(value) => setForm({ ...form, gStart: value })} error={fieldErrors.start_date?.[0]} required /><Field label="Tanggal Selesai" value={form.gEnd} onChange={(value) => setForm({ ...form, gEnd: value })} error={fieldErrors.end_date?.[0]} required /></div><div className={s.formSectionTitle}>Konfigurasi Semester Genap <StatusBadge tone="warning">Semester 2</StatusBadge></div><div className={s.formGrid}><Field label="Tanggal Mulai" value={form.eStart} onChange={(value) => setForm({ ...form, eStart: value })} required /><Field label="Tanggal Selesai" value={form.eEnd} onChange={(value) => setForm({ ...form, eEnd: value })} required /></div><div className={s.formSectionTitle}>Aturan &amp; Validasi Kalender</div><InfoBanner tone="success">Semester Genap dimulai setelah Semester Ganjil selesai.</InfoBanner><InfoBanner tone="success">Tahun ajaran belum pernah terdaftar sebelumnya.</InfoBanner><InfoBanner>Durasi efektif Ganjil: — • Genap: —</InfoBanner>
    </Modal>}
    {modal === "activate" && <Modal title={`Jadikan ${selected?.year ?? "periode"} sebagai periode aktif?`} onClose={() => { if (!activateYear.loading && !pending) setModal(null); }} footer={<><Button variant="outline" disabled={pending} onClick={() => setModal(null)}>Batal</Button><Button disabled={activateYear.loading || pending} onClick={() => { void activateSelected(); }}>Jadikan Aktif</Button></>}><InfoBanner tone="warning">Periode aktif akan diperbarui sesuai konfigurasi backend.</InfoBanner><div className={s.formSectionTitle}>Dampak perubahan</div><p className={s.pageDescription}>Perubahan periode akan disinkronkan dengan rombongan belajar dan laporan hasil belajar.</p>{activateYear.error && <InfoBanner tone="danger">{activateYear.error}</InfoBanner>}</Modal>}
    {modal === "edit" && <Modal title="Ubah Konfigurasi Tahun Ajaran" subtitle={selected?.year} onClose={() => { if (!pending) setModal(null); }} footer={<><Button variant="outline" disabled={pending} onClick={() => setModal(null)}>Batal</Button><Button disabled={pending} onClick={() => void submitYear("edit")}>{pending ? "Menyimpan..." : "Simpan Perubahan"}</Button></>}><div className={s.formGrid}><Field label="Tanggal Mulai" value={form.gStart} onChange={(value) => setForm({ ...form, gStart: value })} error={fieldErrors.start_date?.[0]} required /><Field label="Tanggal Selesai" value={form.gEnd} onChange={(value) => setForm({ ...form, gEnd: value })} error={fieldErrors.end_date?.[0]} required /><div className={s.formFull}><Field label="Jumlah Rombel" value="—" onChange={() => undefined} /></div></div>{notice && <InfoBanner tone="danger">{notice}</InfoBanner>}</Modal>}
    {deleteSelected && <Modal title="Hapus tahun ajaran?" subtitle={deleteSelected.year} onClose={() => { if (!deleteYear.loading) setDeleteSelected(null); }} footer={<><Button variant="outline" disabled={deleteYear.loading} onClick={() => setDeleteSelected(null)}>Batal</Button><Button variant="danger" disabled={deleteYear.loading} onClick={() => { void deleteYear.run(); }}>{deleteYear.loading ? "Menghapus..." : "Ya, Hapus"}</Button></>}><p className={s.pageDescription}>Tahun ajaran <strong>{deleteSelected.year}</strong> akan dihapus.</p>{deleteYear.error && <InfoBanner tone="danger">{deleteYear.error}</InfoBanner>}</Modal>}
  </>;
}
