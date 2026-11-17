"use client";

import { useMemo, useState } from "react";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import { Button, Field, Modal, PageHeading, Pagination, SearchField, SelectField, StatCard, TableEmpty, adminStyles as s } from "@/app/admin/_components/AdminUI";

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

export default function RombelPage() {
  const [rows, setRows] = useState(initialClasses);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("Semua Kategori");
  const [modal, setModal] = useState<"add" | "edit" | "detail" | null>(null);
  const [selected, setSelected] = useState<Room>(initialClasses[0]);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ name: "", level: "Kelas VII", wali: "", nip: "", room: "", capacity: "36" });
  const filtered = useMemo(() => rows.filter((row) => `${row.name} ${row.wali}`.toLowerCase().includes(keyword.toLowerCase()) && (category === "Semua Kategori" || row.level === category)), [rows, keyword, category]);
  const show = (type: "add" | "edit" | "detail", row?: Room) => {
    if (row) { setSelected(row); setForm({ name: row.name, level: row.level, wali: row.wali, nip: row.nip, room: row.room, capacity: String(row.capacity) }); }
    else setForm({ name: "", level: "Kelas VII", wali: "", nip: "", room: "", capacity: "36" });
    setModal(type);
  };

  return (
    <>
      <PageHeading breadcrumbs={["LMS", "Master Data", "Rombongan Belajar"]} title="Daftar Rombongan Belajar" description="Struktur kelas rombel, penugasan wali kelas, dan kapasitas siswa aktif."
        actions={<><Button variant="outline" icon="upload-linear" onClick={() => alert("Pilih file Excel/CSV untuk import rombel.")}>Import Data (Excel/CSV)</Button><Button icon="add-circle-linear" onClick={() => show("add")}>Tambah Data Baru</Button></>} />
      {/* Bagian tampilan: kartu total rombel dan kapasitas siswa terisi. */}
      <div className={s.twoCards}>
        <StatCard label="Total Rombel" value="24 Kelas" detail="VII: 8 Rombel  •  VIII: 8 Rombel  •  IX: 8 Rombel" icon="users-group-rounded-linear" tone="primary" />
        <StatCard label="Kapasitas & Siswa Terisi" value="860 / 864 Siswa" detail="Tersedia 4 kuota siswa pada rombongan belajar aktif." icon="book-2-linear" tone="info" />
      </div>
      {/* Bagian tampilan: cari rombel berdasarkan nama kelas atau wali kelas. */}
      <div className={s.toolbar}><SearchField value={keyword} onChange={setKeyword} placeholder="Cari nama rombel atau wali kelas..." /><div className={s.toolbarSpacer} /><SelectField value={category} onChange={setCategory} options={["Semua Kategori", "Kelas VII", "Kelas VIII", "Kelas IX"]} /></div>
      {/* Bagian tampilan: tabel kelas, wali kelas, ruang, dan kapasitas. */}
      <div className={s.tableWrap}>
        <table className={s.dataTable}>
          <thead><tr><th>Nama Kelas</th><th>Tingkat</th><th>Wali Kelas &amp; NIP</th><th>Ruang Kelas</th><th>Kapasitas / Siswa</th><th>Aksi</th></tr></thead>
          <tbody>{filtered.map((row) => {
            const over = row.filled > row.capacity;
            const percent = Math.min(100, Math.round((row.filled / row.capacity) * 100));
            return <tr key={row.name}>
              <td><span className={s.tableStrong}>{row.name}</span>{over && <span className={s.tableSub} style={{ color: "var(--color-error)" }}>⚠ Kapasitas Berlebihan</span>}</td><td><span className={s.levelTag}>{row.level}</span></td>
              <td>{row.wali}<span className={s.tableSub}>NIP {row.nip}</span></td><td>{row.room}</td>
              <td><div className={s.capacity}><div className={s.capacityText}><span>{row.filled} / {row.capacity} Siswa</span><b style={{ color: over ? "var(--color-error)" : "var(--color-primary)" }}>{over ? `${Math.round((row.filled / row.capacity) * 100)}%` : percent === 100 ? "Penuh" : `${percent}%`}</b></div><div className={s.capacityBar}><span className={over ? s.capacityOver : ""} style={{ width: `${Math.min(100, (row.filled / row.capacity) * 100)}%` }} /></div></div></td>
              <td><div className={s.tableActions}><Button onClick={() => show("detail", row)}>Detail</Button><Button variant="ghost" onClick={() => show("edit", row)}>Edit</Button></div></td>
            </tr>;
          })}{filtered.length === 0 && <TableEmpty colSpan={6} />}</tbody>
        </table>
        <Pagination current={page} total={4} onChange={setPage} label={`Menampilkan 1-${filtered.length} dari 24 rombongan belajar`} />
      </div>

      {/* Bagian tampilan: modal tambah atau edit master rombongan belajar. */}
      {(modal === "add" || modal === "edit") && <Modal title={modal === "add" ? "Tambah Rombongan Belajar" : "Edit Rombongan Belajar"} subtitle="Atur tingkat, wali kelas, ruang, dan kapasitas siswa." onClose={() => setModal(null)} footer={<><Button variant="outline" onClick={() => setModal(null)}>Batal</Button><Button onClick={() => { if (modal === "add") setRows((list) => [...list, { name: form.name || "Kelas Baru", level: form.level, wali: form.wali, nip: form.nip, room: form.room, filled: 0, capacity: Number(form.capacity) || 36 }]); else setRows((list) => list.map((row) => row.name === selected.name ? { ...row, name: form.name, level: form.level, wali: form.wali, nip: form.nip, room: form.room, capacity: Number(form.capacity) || 36 } : row)); setModal(null); }}>Simpan Data</Button></>}>
        <div className={s.formGrid}><Field label="Nama Kelas" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required placeholder="Contoh: Kelas 7D" /><label className={s.formField}><span>Tingkat *</span><select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}><option>Kelas VII</option><option>Kelas VIII</option><option>Kelas IX</option></select></label><Field label="Wali Kelas" value={form.wali} onChange={(value) => setForm({ ...form, wali: value })} required placeholder="Nama guru" /><Field label="NIP Wali Kelas" value={form.nip} onChange={(value) => setForm({ ...form, nip: value })} required placeholder="NIP" /><Field label="Ruang Kelas" value={form.room} onChange={(value) => setForm({ ...form, room: value })} required placeholder="Ruang kelas" /><Field label="Kapasitas Maksimal" value={form.capacity} onChange={(value) => setForm({ ...form, capacity: value })} required /></div>
      </Modal>}
      {/* Bagian tampilan: rincian rombel dan daftar status kapasitas. */}
      {modal === "detail" && <Modal title={`Detail ${selected.name}`} subtitle={`${selected.level} • ${selected.room}`} onClose={() => setModal(null)} footer={<Button onClick={() => setModal(null)}>Tutup</Button>}>
        <div className={s.formGrid}><Field label="Wali Kelas" value={selected.wali} onChange={() => undefined} /><Field label="NIP" value={selected.nip} onChange={() => undefined} /><Field label="Jumlah Siswa" value={`${selected.filled} siswa`} onChange={() => undefined} /><Field label="Kapasitas" value={`${selected.capacity} siswa`} onChange={() => undefined} /></div>
      </Modal>}
    </>
  );
}
