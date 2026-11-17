"use client";

import { useState } from "react";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import AdminDirectoryToolbar from "@/app/admin/_components/AdminDirectoryToolbar";
import useAdminDirectoryFilter from "@/app/admin/_components/useAdminDirectoryFilter";
import { AdminStatRow, AdminTableIconButton, Button, Field, InfoBanner, Modal, PageHeading, Pagination, StatusBadge, TableEmpty, adminStyles as s } from "@/app/admin/_components/AdminUI";

const parents = [
  { name: "Bambang Pratama, S.T.", relation: "Ayah Kandung", child: "Andi Pratama • 8B", phone: "0812-9844-1120", status: "Aktif", access: "15 Menit lalu" },
  { name: "Ratna Juwita, S.E.", relation: "Ibu Kandung", child: "Siti Rahma • 8A", phone: "0813-2211-9043", status: "Aktif", access: "Hari ini, 08:20 WIB" },
  { name: "Suryadi Fauzan", relation: "Ayah Kandung", child: "Rafi Ahmad • 7C +1 anak", phone: "0852-7711-4309", status: "Aktif", access: "Kemarin, 14:10 WIB" },
  { name: "Hendrawati Kusuma", relation: "Wali Murid", child: "Dimas Surya K. • 9C", phone: "0819-3320-1178", status: "Aktif", access: "2 Hari lalu" },
  { name: "Nurul Hasanah, S.Pd.", relation: "Ibu Kandung", child: "Zahra Aulia • 7D", phone: "0877-6655-2201", status: "Aktif", access: "3 Hari lalu" },
  { name: "Dedi Supriyadi", relation: "Ayah Kandung", child: "Bagas Pratama • 9A", phone: "0811-9988-3344", status: "Aktif", access: "5 Hari lalu" },
];

const getParentSearchText = (parent: typeof parents[number]) => `${parent.name} ${parent.child} ${parent.phone}`;
const matchesParentCategory = (parent: typeof parents[number], category: string) => category === "Semua Kategori" || parent.relation === category;

export default function OrangTuaPage() {
  const [modal, setModal] = useState(false);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ name: "", relation: "Ayah Kandung", phone: "", email: "", address: "", student: "Andi Pratama • 8B" });
  const { keyword, setKeyword, category, setCategory, filtered } = useAdminDirectoryFilter({
    items: parents,
    getSearchText: getParentSearchText,
    matchesCategory: matchesParentCategory,
    initialCategory: "Semua Kategori",
  });

  return (
    <>
      <PageHeading breadcrumbs={["LMS", "Manajemen Pengguna", "Manajemen Orang Tua (Wali)"]} title="Manajemen Orang Tua (Wali Murid)" description="Pengelolaan data akun wali murid terverifikasi, penautan akun siswa, dan nomor kontak darurat."
        actions={<><Button variant="outline" tone="amber" icon="upload-linear" onClick={() => alert("Pilih file Excel/CSV untuk proses import.")}>Import Data (Excel/CSV)</Button><Button icon="user-plus-linear" onClick={() => setModal(true)}>Tambah Orang Tua/Wali</Button></>} />
      {/* Bagian tampilan: ringkasan akun orang tua dan status penautan peserta didik. */}
      <AdminStatRow columns={3} items={[
        { label: "Total Akun Orang Tua / Wali", value: "782", icon: "users-group-rounded-linear", tone: "primary" },
        { label: "Penautan Peserta Didik", value: "94.6%", icon: "link-linear", tone: "warning" },
        { label: "Akun Aktif Bulan Ini", value: "690", icon: "check-circle-linear", tone: "success" },
      ]} />
      {/* Bagian tampilan: pencarian akun wali dan filter hubungan keluarga. */}
      <AdminDirectoryToolbar
        keyword={keyword}
        onKeywordChange={setKeyword}
        searchPlaceholder="Cari nama orang tua, siswa, atau nomor HP..."
        category={category}
        onCategoryChange={setCategory}
        categoryOptions={["Semua Kategori", "Ayah Kandung", "Ibu Kandung", "Wali Murid"]}
      />
      {/* Bagian tampilan: direktori akun wali dan daftar siswa yang tertaut. */}
      <div className={s.tableWrap}>
        <table className={`${s.dataTable} ${s.directoryTable}`}>
          <thead><tr><th>Nama Orang Tua / Wali</th><th>Siswa Terhubung &amp; Kelas</th><th>Nomor HP</th><th>Status Akun</th><th>Terakhir Akses</th><th>Aksi</th></tr></thead>
          <tbody>{filtered.map((parent) => <tr key={parent.name}>
            <td><span className={s.tableStrong}>{parent.name}</span><span className={s.tableSub}>{parent.relation}</span></td>
            <td><StatusBadge tone="primary" className={s.directoryBadge}><AdminIcon name="graduation-cap-linear" size={12} /> {parent.child}</StatusBadge></td><td>{parent.phone}</td><td><StatusBadge tone={parent.status === "Aktif" ? "primary" : "warning"} className={`${s.directoryBadge} ${s.directoryStatusBadge}`}>{parent.status}</StatusBadge></td><td>{parent.access}</td>
            <td><div className={s.tableActions}><AdminTableIconButton icon="eye-linear" title="Detail" ariaLabel="Detail" onClick={() => alert(`${parent.name}\n${parent.child}`)} /><AdminTableIconButton icon="pen-linear" title="Edit" ariaLabel="Edit" onClick={() => setModal(true)} /><AdminTableIconButton icon="history-linear" title="Riwayat" ariaLabel="Riwayat" onClick={() => alert("Riwayat akses akun wali")} /></div></td>
          </tr>)}{filtered.length === 0 && <TableEmpty colSpan={6} />}</tbody>
        </table>
        <Pagination current={page} total={4} onChange={setPage} label={`Menampilkan 1-${filtered.length} dari 782 orang tua/wali`} />
      </div>

      {/* Bagian tampilan: modal registrasi wali, relasi keluarga, dan multi-child linking. */}
      {modal && <Modal title="Tambah Orang Tua / Wali" subtitle="Registrasi akun wali murid dan tautkan dengan data peserta didik aktif." onClose={() => setModal(false)} footer={<><Button variant="outline" onClick={() => setModal(false)}>Batal</Button><Button icon="diskette-linear" onClick={() => setModal(false)}>Simpan Akun Orang Tua</Button></>}>
        <div className={s.formGrid}>
          <div className={s.formFull}><Field label="Nama Lengkap Orang Tua / Wali" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required placeholder="Nama lengkap beserta gelar (jika ada)" /></div>
          <div className={s.formFull}><div className={s.formField}><span>Hubungan dengan Siswa *</span><div className={s.choiceRow}>{["Ayah Kandung", "Ibu Kandung", "Wali Murid"].map((item) => <label className={s.choicePill} key={item}><input type="radio" name="relation" checked={form.relation === item} onChange={() => setForm({ ...form, relation: item })} />{item}</label>)}</div></div></div>
          <Field label="Nomor WhatsApp / HP Aktif" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} required placeholder="08xxxxxxxxxx" />
          <Field label="Alamat Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} placeholder="nama@email.com" type="email" />
          <div className={s.formFull}><Field label="Alamat Domisili" value={form.address} onChange={(value) => setForm({ ...form, address: value })} required placeholder="Alamat lengkap sesuai domisili" /></div>
        </div>
        <div className={s.formSectionTitle}><span>Siswa Tertaut (Student Linking) *</span><StatusBadge tone="primary">1 Siswa Terpilih</StatusBadge></div>
        <label className={s.searchField}><AdminIcon name="magnifer-linear" size={16} /><input value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} placeholder="Ketik NISN atau nama siswa untuk menautkan..." /></label>
        <div className={s.linkedStudent} style={{ marginTop: "var(--space-sm)" }}><span className={s.initialAvatar}>AP</span><div style={{ flex: 1 }}><strong>Andi Pratama <StatusBadge tone="success">Siswa Terhubung Utama</StatusBadge></strong><small>NISN: 0098471204 • Kelas 8B</small><small>Wali Kelas: Ibu Rina Marlina, M.Pd. • Aktif Semester Genap</small></div><button className={s.iconButton} aria-label="Hapus tautan"><AdminIcon name="close-linear" size={14} /></button></div>
        <button type="button" className={s.textLink} style={{ marginTop: "var(--space-md)", width: "100%", padding: "var(--space-sm)", border: "1px dashed var(--color-primary-light)", borderRadius: "var(--radius-s)" }}>+ Tautkan Anak / Siswa Lain (Multi-Child Support)</button>
        <div className={s.successLine} style={{ marginTop: "var(--space-md)" }}><AdminIcon name="check-circle-linear" size={15} /> Data terhubung dengan 1 peserta didik aktif</div>
      </Modal>}
    </>
  );
}
