"use client";

import { useMemo, useState } from "react";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import { Button, Field, InfoBanner, Modal, PageHeading, SearchField, StatusBadge, adminStyles as s } from "@/app/admin/_components/AdminUI";

const years = [
  { year: "2026/2027 – Ganjil", note: "Periode Utama Aktif", range: "13 Jul 2026 – 19 Des 2026", rombel: "24 Rombel", students: "860 Siswa Terdaftar", status: "Aktif" },
  { year: "2026/2027 – Genap", note: "Semester Berikutnya", range: "05 Jan 2027 – 19 Jun 2027", rombel: "24 Rombel", students: "", status: "Mendatang" },
  { year: "2025/2026 – Genap", note: "Tahun Lalu", range: "06 Jan 2026 – 20 Jun 2026", rombel: "24 Rombel", students: "854 Siswa", status: "Selesai" },
  { year: "2025/2026 – Ganjil", note: "Tahun Lalu", range: "14 Jul 2025 – 20 Des 2025", rombel: "24 Rombel", students: "854 Siswa", status: "Selesai" },
  { year: "2024/2025 – Genap", note: "Arsip Dua Periode Lalu", range: "08 Jan 2025 – 21 Jun 2025", rombel: "24 Rombel", students: "842 Siswa", status: "Selesai" },
];

export default function TahunAjaranPage() {
  const [keyword, setKeyword] = useState("");
  const [tab, setTab] = useState("Semua Status");
  const [modal, setModal] = useState<"add" | "activate" | "edit" | null>(null);
  const [selected, setSelected] = useState(years[1]);
  const [form, setForm] = useState({ academic: "2027/2028", gStart: "12/07/2027", gEnd: "18/12/2027", eStart: "04/01/2028", eEnd: "17/06/2028" });
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => years.filter((item) => (tab === "Semua Status" || item.status === tab) && item.year.toLowerCase().includes(keyword.toLowerCase())), [tab, keyword]);

  return (
    <>
      <PageHeading breadcrumbs={["LMS", "Master Data", "Tahun Ajaran"]} title="Master Data Tahun Ajaran & Semester" description="Konfigurasi tahun akademik, semester aktif, dan transisi rombongan belajar."
        actions={<Button icon="calendar-add-linear" onClick={() => setModal("add")}>Tambah Tahun Ajaran</Button>} />
      {/* Bagian tampilan: hero periode akademik yang sedang aktif. */}
      <section className={s.yearHero}>
        <div><div className={s.heroTags}><span>TAHUN AJARAN BERJALAN</span><span>STATUS: AKTIF</span><span>ID: TA-2026-GANJIL</span></div><h2>2026/2027 – Semester Ganjil</h2><div className={s.heroTags}><span><AdminIcon name="calendar-linear" size={12} /> 13 Jul 2026 – 19 Des 2026</span><span><AdminIcon name="users-group-rounded-linear" size={12} /> 24 Rombel • 860 Siswa Terdaftar</span></div></div>
        <div className={s.heroActions}><Button variant="outline" icon="pen-linear" onClick={() => setModal("edit")}>Ubah Konfigurasi</Button><Button variant="outline" icon="refresh-circle-linear" onClick={() => setModal("activate")}>Proses Kenaikan Kelas</Button></div>
      </section>
      {/* Bagian tampilan: kartu total tahun akademik dan periode mendatang. */}
      <div className={s.twoCards}>
        <div className={s.metricCard}><small>Total Tahun Akademik</small><strong>3 Periode</strong><p>5 Semester Tercatat</p></div>
        <div className={s.metricCard}><small>Periode Mendatang</small><strong>2026/2027 Genap</strong><p><span style={{ color: "#966508" }}>◷ Dimulai 05 Jan 2027</span></p></div>
      </div>
      {/* Bagian tampilan: progres siklus semester aktif. */}
      <div className={s.panel} style={{ marginBottom: 24 }}>
        <div className={s.panelTitle}><h2>Siklus Akademik Terjadwal</h2><span>Progres Semester Ganjil Berjalan: Minggu ke-14 dari 23</span></div>
        <div className={s.progressSegments}><span /><span /><span /></div>
        <div className={s.heroTags} style={{ marginTop: 8 }}><span style={{ color: "#4A4E58", background: "transparent", border: 0 }}>● Pembelajaran Aktif</span><span style={{ color: "#4A4E58", background: "transparent", border: 0 }}>● Asesmen Akhir &amp; Rapor</span><span style={{ color: "#4A4E58", background: "transparent", border: 0 }}>● Transisi Genap 2026/2027</span></div>
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
            <tbody>{filtered.map((item) => <tr key={item.year}>
              <td><span className={s.tableStrong}>{item.year}</span><span className={s.tableSub}>{item.note}</span></td><td>{item.range}</td><td><strong>{item.rombel}</strong><span className={s.tableSub}>{item.students}</span></td>
              <td><StatusBadge tone={item.status === "Aktif" ? "success" : item.status === "Mendatang" ? "info" : "neutral"}>{item.status}</StatusBadge></td>
              <td><div className={s.tableActions}>{item.status !== "Aktif" && <Button variant="ghost" onClick={() => { setSelected(item); setModal("edit"); }}>Edit</Button>}{item.status === "Mendatang" && <Button onClick={() => { setSelected(item); setModal("activate"); }}>Jadikan Aktif</Button>}{item.status === "Aktif" && <span className={s.tableSub}>Sedang berjalan</span>}</div></td>
            </tr>)}{filtered.length === 0 && <tr><td colSpan={5} className={s.emptyCell}>Tidak ada periode yang cocok.</td></tr>}</tbody>
          </table>
        </div>
        <div className={s.pagination}><span>Menampilkan {filtered.length} dari 5 Semester</span><div className={s.pageControls}><button disabled={page === 1} onClick={() => setPage(1)}>‹</button><button className={s.pageCurrent}>1</button></div></div>
      </div>

      {/* Bagian tampilan: modal pembuatan tahun ajaran dan dua semester sekaligus. */}
      {modal === "add" && <Modal title="Tambah Tahun Ajaran Baru" subtitle="Konfigurasi satu tahun akademik lengkap dengan semester Ganjil dan Genap sekaligus." onClose={() => setModal(null)} footer={<><Button variant="outline" onClick={() => setModal(null)}>Batal</Button><Button icon="check-linear" onClick={() => setModal(null)}>Simpan Tahun Ajaran</Button></>}>
        <InfoBanner>Kedua semester dibuat sekaligus. Semester Ganjil akan dimulai sebagai periode aktif berikutnya atau terjadwal dan Semester Genap otomatis berstatus Mendatang.</InfoBanner>
        <Field label="Tahun Akademik" value={form.academic} onChange={(value) => setForm({ ...form, academic: value })} required />
        <div className={s.formSectionTitle}>Konfigurasi Semester Ganjil (Gasal) <StatusBadge tone="primary">Semester 1</StatusBadge></div>
        <div className={s.formGrid}><Field label="Tanggal Mulai" value={form.gStart} onChange={(value) => setForm({ ...form, gStart: value })} required /><Field label="Tanggal Selesai" value={form.gEnd} onChange={(value) => setForm({ ...form, gEnd: value })} required /></div>
        <div className={s.formSectionTitle}>Konfigurasi Semester Genap <StatusBadge tone="warning">Semester 2</StatusBadge></div>
        <div className={s.formGrid}><Field label="Tanggal Mulai" value={form.eStart} onChange={(value) => setForm({ ...form, eStart: value })} required /><Field label="Tanggal Selesai" value={form.eEnd} onChange={(value) => setForm({ ...form, eEnd: value })} required /></div>
        <div className={s.formSectionTitle}>Aturan &amp; Validasi Kalender</div>
        <InfoBanner tone="success">Semester Genap dimulai setelah Semester Ganjil selesai.</InfoBanner><InfoBanner tone="success">Tahun ajaran belum pernah terdaftar sebelumnya.</InfoBanner><InfoBanner>Durasi efektif Ganjil: 23 Minggu • Genap: 24 Minggu</InfoBanner>
      </Modal>}

      {/* Bagian tampilan: konfirmasi pergantian periode aktif dengan informasi dampak. */}
      {modal === "activate" && <Modal title={`Jadikan ${selected.year} sebagai periode aktif?`} onClose={() => setModal(null)} footer={<><Button variant="outline" onClick={() => setModal(null)}>Batal</Button><Button onClick={() => setModal(null)}>Jadikan Aktif</Button></>}>
        <InfoBanner tone="warning">Semester Ganjil saat ini akan otomatis berstatus Selesai dan data pembelajarannya menjadi arsip. Tindakan pergantian periode aktif ini tidak dapat dibatalkan secara sepihak.</InfoBanner>
        <div className={s.formSectionTitle}>Dampak perubahan</div><p className={s.pageDescription}>Akses input nilai guru dialihkan ke Semester Genap. Perubahan periode akan disinkronkan dengan rombongan belajar dan laporan hasil belajar.</p>
      </Modal>}

      {/* Bagian tampilan: modal ubah konfigurasi periode yang dipilih. */}
      {modal === "edit" && <Modal title="Ubah Konfigurasi Tahun Ajaran" subtitle={selected.year} onClose={() => setModal(null)} footer={<><Button variant="outline" onClick={() => setModal(null)}>Batal</Button><Button onClick={() => setModal(null)}>Simpan Perubahan</Button></>}>
        <div className={s.formGrid}><Field label="Tanggal Mulai" value={form.gStart} onChange={(value) => setForm({ ...form, gStart: value })} required /><Field label="Tanggal Selesai" value={form.gEnd} onChange={(value) => setForm({ ...form, gEnd: value })} required /><div className={s.formFull}><Field label="Jumlah Rombel" value="24 Rombel" onChange={() => undefined} /></div></div>
      </Modal>}
    </>
  );
}
