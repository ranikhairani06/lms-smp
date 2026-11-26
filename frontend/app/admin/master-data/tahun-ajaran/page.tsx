"use client";

import { useMemo, useState } from "react";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import { AdminTableIconButton, Button, Field, InfoBanner, Modal, PageHeading, SearchField, StatusBadge, adminStyles as s } from "@/app/admin/_components/AdminUI";
import { ErrorState, LoadingState } from "@/components/lms/state";
import { useAdminMutation, useAdminResource } from "@/app/admin/_components/useAdminApi";


export default function TahunAjaranPage() {
  const yearResource = useAdminResource<Array<{ id: number; name: string; start_year: number; is_active: boolean }>>("academic-years");
  const apiYears = (yearResource.data ?? []).map((item) => ({ id: item.id, year: item.name, note: item.is_active ? "Periode Aktif" : "—", range: "—", rombel: "—", students: "", status: item.is_active ? "Aktif" : "—" }));
  const [notice, setNotice] = useState("");
  const [keyword, setKeyword] = useState("");
  const [tab, setTab] = useState("Semua Status");
  const [modal, setModal] = useState<"add" | "activate" | "edit" | null>(null);
  const [selected, setSelected] = useState<{ id?: number; year: string; status: string }>({ year: "", status: "" });
  const [deleteSelected, setDeleteSelected] = useState<{ id?: number; year: string; status: string } | null>(null);
  const [form, setForm] = useState({ academic: "", gStart: "", gEnd: "", eStart: "", eEnd: "" });
  const [page, setPage] = useState(1);
  const refreshYears = async () => { await yearResource.reload(); };
  const createYear = useAdminMutation("POST", "academic-years", async () => { setNotice("Tahun ajaran berhasil ditambahkan."); setModal(null); await refreshYears(); }, refreshYears);
  const activateYear = useAdminMutation("POST", `academic-years/${selected.id ?? 0}/activate`, async () => { setNotice("Tahun ajaran berhasil diaktifkan."); setModal(null); await refreshYears(); }, refreshYears);
  const deleteYear = useAdminMutation("DELETE", `academic-years/${deleteSelected?.id ?? 0}`, async () => { setNotice("Tahun ajaran berhasil dihapus."); setDeleteSelected(null); await refreshYears(); }, refreshYears);
  const filtered = useMemo(() => apiYears.filter((item) => (tab === "Semua Status" || item.status === tab) && item.year.toLowerCase().includes(keyword.toLowerCase())), [apiYears, tab, keyword]);
  const activeYear = apiYears.find((item) => item.status === "Aktif");
  const submitYear = async (mode: "add" | "edit") => {
    if (mode === "edit") {
      setNotice("Perubahan kalender semester belum dapat disimpan.");
      return;
    }
    const match = form.academic.match(/^(\d{4})\s*\/\s*(\d{4})$/);
    if (!match) { setNotice("Masukkan tahun ajaran dengan format YYYY/YYYY."); return; }
    const result = await createYear.run({ name: `${match[1]}/${match[2]}`, start_year: Number(match[1]) });
    if (!result) setNotice(createYear.error ?? "Tahun ajaran gagal disimpan.");
  };

  return (
    <>
      <PageHeading breadcrumbs={["LMS", "Master Data", "Tahun Ajaran"]} title="Master Data Tahun Ajaran & Semester" description="Konfigurasi tahun akademik, semester aktif, dan transisi rombongan belajar."
        actions={<Button icon="calendar-add-linear" onClick={() => setModal("add")}>Tambah Tahun Ajaran</Button>} />
      {notice && <InfoBanner tone={createYear.error || activateYear.error ? "danger" : notice.includes("belum dapat disimpan") ? "warning" : "success"}>{notice}</InfoBanner>}
      {yearResource.loading && <LoadingState title="Memuat tahun ajaran..." />}
      {yearResource.error && <ErrorState title={yearResource.error} action={<Button variant="outline" onClick={() => void refreshYears()}>Coba Lagi</Button>} />}
      {/* Bagian tampilan: hero periode akademik yang sedang aktif. */}
      <section className={s.yearHero}>
        <div><div className={s.heroTags}><span>TAHUN AJARAN BERJALAN</span><span>STATUS: {activeYear ? "AKTIF" : "—"}</span><span>ID: {activeYear?.id ?? "—"}</span></div><h2>{activeYear?.year ?? "—"}</h2><div className={s.heroTags}><span><AdminIcon name="calendar-linear" size={12} /> —</span><span><AdminIcon name="users-group-rounded-linear" size={12} /> —</span></div></div>
        <div className={s.heroActions}><Button variant="outline" icon="pen-linear" onClick={() => { if (activeYear) { setSelected(activeYear); setForm((current) => ({ ...current, academic: activeYear.year })); setModal("edit"); } }}>Ubah Konfigurasi</Button><Button variant="outline" icon="refresh-circle-linear" onClick={() => setNotice("Proses kenaikan kelas belum tersedia di layanan.")}>Proses Kenaikan Kelas</Button></div>
      </section>
      {/* Bagian tampilan: kartu total tahun akademik dan periode mendatang. */}
      <div className={s.twoCards}>
        <div className={s.metricCard}><small>Total Tahun Akademik</small><strong>{apiYears.length} Periode</strong><p>—</p></div>
        <div className={s.metricCard}><small>Periode Mendatang</small><strong>—</strong><p><span style={{ color: "var(--color-warning-dark)" }}>◷ —</span></p></div>
      </div>
      {/* Bagian tampilan: progres siklus semester aktif. */}
      <div className={s.panel} style={{ marginBottom: "var(--space-lg)" }}>
        <div className={s.panelTitle}><h2>Siklus Akademik Terjadwal</h2><span>—</span></div>
        <div className={s.progressSegments}><span /><span /><span /></div>
        <div className={s.heroTags} style={{ marginTop: "var(--space-sm)" }}><span style={{ color: "var(--color-text-secondary)", background: "transparent", border: 0 }}>● Pembelajaran Aktif</span><span style={{ color: "var(--color-text-secondary)", background: "transparent", border: 0 }}>● Asesmen Akhir &amp; Rapor</span><span style={{ color: "var(--color-text-secondary)", background: "transparent", border: 0 }}>● Transisi Genap 2026/2027</span></div>
      </div>
      {/* Bagian tampilan: daftar semester, status operasional, dan aksi manajemen. */}
      <div className={s.panel}>
        <div className={s.toolbar}>
          <div className={s.tabs}>{["Semua Status", "Aktif", "Mendatang", "Selesai"].map((item) => <button key={item} aria-pressed={tab === item} onClick={() => setTab(item)}>{item}</button>)}</div>
          <div className={s.toolbarSpacer} />
          <SearchField value={keyword} onChange={setKeyword} placeholder="Saring tahun ajaran..." />
        </div>
        <div className={s.tableWrap}>
          <table className={s.dataTable}>
            <thead><tr><th>Tahun Ajaran &amp; Semester</th><th>Rentang Waktu Kalender</th><th>Rombel &amp; Siswa</th><th>Status Operasional</th><th>Aksi Manajemen</th></tr></thead>
            <tbody>{filtered.map((item) => <tr key={item.id}>
              <td><span className={s.tableStrong}>{item.year}</span><span className={s.tableSub}>{item.note}</span></td><td>{item.range}</td><td><strong>{item.rombel}</strong><span className={s.tableSub}>{item.students}</span></td>
              <td><StatusBadge tone={item.status === "Aktif" ? "success" : item.status === "Mendatang" ? "info" : "neutral"}>{item.status}</StatusBadge></td>
              <td><div className={s.tableActions}>{item.status !== "Aktif" && <Button variant="ghost" onClick={() => { setSelected(item); setForm((current) => ({ ...current, academic: item.year })); setModal("edit"); }}>Edit</Button>}{item.status !== "Aktif" && <Button onClick={() => { setSelected(item); setModal("activate"); }}>Jadikan Aktif</Button>}{item.status === "Aktif" && <span className={s.tableSub}>Sedang berjalan</span>}<AdminTableIconButton icon="trash-bin-trash-linear" title="Hapus" ariaLabel={`Hapus tahun ajaran ${item.year}`} disabled={deleteYear.loading} onClick={() => setDeleteSelected(item)} /></div></td>
            </tr>)}{filtered.length === 0 && <tr><td colSpan={5} className={s.emptyCell}>Tidak ada periode yang cocok.</td></tr>}</tbody>
          </table>
        </div>
        <div className={s.pagination}><span>Menampilkan {filtered.length} dari 5 Semester</span><div className={s.pageControls}><button disabled={page === 1} onClick={() => setPage(1)}>‹</button><button className={s.pageCurrent}>1</button></div></div>
      </div>

      {/* Bagian tampilan: modal pembuatan tahun ajaran dan dua semester sekaligus. */}
      {modal === "add" && <Modal title="Tambah Tahun Ajaran Baru" subtitle="Konfigurasi satu tahun akademik lengkap dengan semester Ganjil dan Genap sekaligus." onClose={() => setModal(null)} footer={<><Button variant="outline" onClick={() => setModal(null)}>Batal</Button><Button icon="check-linear" disabled={createYear.loading} onClick={() => void submitYear("add")}>Simpan Tahun Ajaran</Button></>}>
        <InfoBanner>Kedua semester dibuat sekaligus. Semester Ganjil akan dimulai sebagai periode aktif berikutnya atau terjadwal dan Semester Genap otomatis berstatus Mendatang.</InfoBanner>
        <Field label="Tahun Akademik" value={form.academic} onChange={(value) => setForm({ ...form, academic: value })} error={createYear.fieldErrors.name?.[0] ?? createYear.fieldErrors.start_year?.[0]} required />
        <div className={s.formSectionTitle}>Konfigurasi Semester Ganjil (Gasal) <StatusBadge tone="primary">Semester 1</StatusBadge></div>
        <div className={s.formGrid}><Field label="Tanggal Mulai" value={form.gStart} onChange={(value) => setForm({ ...form, gStart: value })} required /><Field label="Tanggal Selesai" value={form.gEnd} onChange={(value) => setForm({ ...form, gEnd: value })} required /></div>
        <div className={s.formSectionTitle}>Konfigurasi Semester Genap <StatusBadge tone="warning">Semester 2</StatusBadge></div>
        <div className={s.formGrid}><Field label="Tanggal Mulai" value={form.eStart} onChange={(value) => setForm({ ...form, eStart: value })} required /><Field label="Tanggal Selesai" value={form.eEnd} onChange={(value) => setForm({ ...form, eEnd: value })} required /></div>
        <div className={s.formSectionTitle}>Aturan &amp; Validasi Kalender</div>
        <InfoBanner tone="success">Semester Genap dimulai setelah Semester Ganjil selesai.</InfoBanner><InfoBanner tone="success">Tahun ajaran belum pernah terdaftar sebelumnya.</InfoBanner><InfoBanner>Durasi efektif Ganjil: 23 Minggu • Genap: 24 Minggu</InfoBanner>
      </Modal>}

      {/* Bagian tampilan: konfirmasi pergantian periode aktif dengan informasi dampak. */}
      {modal === "activate" && <Modal title={`Jadikan ${selected.year} sebagai periode aktif?`} onClose={() => setModal(null)} footer={<><Button variant="outline" onClick={() => setModal(null)}>Batal</Button><Button disabled={activateYear.loading} onClick={() => { void activateYear.run(); }}>Jadikan Aktif</Button></>}>
        <InfoBanner tone="warning">Semester Ganjil saat ini akan otomatis berstatus Selesai dan data pembelajarannya menjadi arsip. Tindakan pergantian periode aktif ini tidak dapat dibatalkan secara sepihak.</InfoBanner>
        <div className={s.formSectionTitle}>Dampak perubahan</div><p className={s.pageDescription}>Akses input nilai guru dialihkan ke Semester Genap. Perubahan periode akan disinkronkan dengan rombongan belajar dan laporan hasil belajar.</p>
      </Modal>}

      {/* Bagian tampilan: modal ubah konfigurasi periode yang dipilih. */}
      {modal === "edit" && <Modal title="Ubah Konfigurasi Tahun Ajaran" subtitle={selected.year} onClose={() => setModal(null)} footer={<><Button variant="outline" onClick={() => setModal(null)}>Batal</Button><Button onClick={() => void submitYear("edit")}>Simpan Perubahan</Button></>}>
        <div className={s.formGrid}><Field label="Tanggal Mulai" value={form.gStart} onChange={(value) => setForm({ ...form, gStart: value })} required /><Field label="Tanggal Selesai" value={form.gEnd} onChange={(value) => setForm({ ...form, gEnd: value })} required /><div className={s.formFull}><Field label="Jumlah Rombel" value="24 Rombel" onChange={() => undefined} /></div></div>
      </Modal>}
      {deleteSelected && <Modal title="Hapus tahun ajaran?" subtitle={deleteSelected.year} onClose={() => { if (!deleteYear.loading) setDeleteSelected(null); }} footer={<><Button variant="outline" disabled={deleteYear.loading} onClick={() => setDeleteSelected(null)}>Batal</Button><Button variant="danger" disabled={deleteYear.loading} onClick={() => { void deleteYear.run(); }}>{deleteYear.loading ? "Menghapus..." : "Ya, Hapus"}</Button></>}>
        <p className={s.pageDescription}>Tahun ajaran <strong>{deleteSelected.year}</strong> akan dihapus.</p>
        {deleteYear.error && <InfoBanner tone="danger">{deleteYear.error}</InfoBanner>}
      </Modal>}
    </>
  );
}
