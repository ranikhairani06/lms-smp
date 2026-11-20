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
import { AdminTableIconButton, Button, TableEmpty, adminStyles as s } from "@/app/admin/_components/AdminUI";

type ParentDirectoryItem = { name: string; relation: string; child: string; additionalChildren: number; phone: string; status: string; access: string };

const parents: ParentDirectoryItem[] = [
  { name: "Bambang Pratama, S.T.", relation: "Ayah Kandung", child: "Andi Pratama • 8B", additionalChildren: 0, phone: "0812-9844-1120", status: "Aktif", access: "15 Menit lalu" },
  { name: "Ratna Juwita, S.E.", relation: "Ibu Kandung", child: "Siti Rahma • 8A", additionalChildren: 0, phone: "0813-2211-9043", status: "Aktif", access: "Hari ini, 08:20 WIB" },
  { name: "Suryadi Fauzan", relation: "Ayah Kandung", child: "Rafi Ahmad • 7C", additionalChildren: 1, phone: "0852-7711-4309", status: "Aktif", access: "Kemarin, 14:10 WIB" },
  { name: "Hendrawati Kusuma", relation: "Wali Murid", child: "Dimas Surya K. • 9C", additionalChildren: 0, phone: "0819-3320-1178", status: "Aktif", access: "2 Hari lalu" },
  { name: "Nurul Hasanah, S.Pd.", relation: "Ibu Kandung", child: "Zahra Aulia • 7D", additionalChildren: 0, phone: "0877-6655-2201", status: "Aktif", access: "3 Hari lalu" },
  { name: "Dedi Supriyadi", relation: "Ayah Kandung", child: "Bagas Pratama • 9A", additionalChildren: 0, phone: "0811-9988-3344", status: "Aktif", access: "5 Hari lalu" },
];

const getParentSearchText = (parent: typeof parents[number]) => `${parent.name} ${parent.child} ${parent.phone}`;
const matchesParentCategory = (parent: typeof parents[number], category: string) => category === "Semua Kategori" || parent.relation === category;

export default function OrangTuaPage() {
  const [modal, setModal] = useState(false);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ name: "", relation: "Ayah Kandung", phone: "", email: "", address: "", student: "Andi Pratama • 8B" });
  const [touched, setTouched] = useState<Partial<Record<"name" | "relation" | "phone" | "email" | "address" | "student", boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const emailIsValid = !form.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const phoneIsValid = /^\d{8,15}$/.test(form.phone);
  const fieldErrors = {
    name: form.name.trim() ? "" : "Nama lengkap wajib diisi.",
    relation: ["Ayah Kandung", "Ibu Kandung", "Wali Murid"].includes(form.relation) ? "" : "Hubungan dengan siswa wajib dipilih.",
    phone: !form.phone ? "Nomor HP wajib diisi." : phoneIsValid ? "" : "Nomor HP harus 8–15 digit angka.",
    email: emailIsValid ? "" : "Masukkan alamat email yang valid.",
    address: form.address.trim() ? "" : "Alamat domisili wajib diisi.",
    student: form.student.trim() ? "" : "Siswa tertaut wajib dipilih.",
  };
  const shouldShowError = (field: keyof typeof fieldErrors) => submitAttempted || Boolean(touched[field]);
  const errorCount = Object.values(fieldErrors).filter(Boolean).length;
  const displayedErrorCount = (Object.keys(fieldErrors) as (keyof typeof fieldErrors)[]).filter((field) => shouldShowError(field) && Boolean(fieldErrors[field])).length;
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (errorCount > 0) return;
    setModal(false);
  };
  const { keyword, setKeyword, category, setCategory, filtered } = useAdminDirectoryFilter({
    items: parents,
    getSearchText: getParentSearchText,
    matchesCategory: matchesParentCategory,
    initialCategory: "Semua Kategori",
  });
  const statistics: ManagementStat[] = [
    { label: "Total Akun Orang Tua / Wali", value: "782", icon: "users-group-rounded-linear", tone: "primary" },
    { label: "Penautan Peserta Didik", value: "94.6%", icon: "link-linear", tone: "warning" },
    { label: "Akun Aktif Bulan Ini", value: "690", icon: "check-circle-linear", tone: "success" },
  ];

  return (
    <div className={s.parentManagementPage}>
      <PageHeading breadcrumbs={["LMS", "Manajemen Pengguna", "Manajemen Orang Tua (Wali)"]} title="Manajemen Orang Tua (Wali Murid)" description="Pengelolaan data akun wali murid terverifikasi, penautan akun siswa, dan nomor kontak darurat."
        actions={<><Button variant="outline" tone="amber" icon="upload-linear" onClick={() => alert("Pilih file Excel/CSV untuk proses import.")}>Import Data (Excel/CSV)</Button><Button icon="user-plus-linear" onClick={() => setModal(true)}>Tambah Orang Tua/Wali</Button></>} />
      {/* Bagian tampilan: ringkasan akun orang tua dan status penautan peserta didik. */}
      <div className={`${s.statGridThree} ${s.adminStatRow}`}>
        {statistics.map((item) => <ManagementStatCard key={item.label} item={item} />)}
      </div>
      {/* Bagian tampilan: pencarian akun wali dan filter hubungan keluarga. */}
      <ManagementToolbar
        keyword={keyword}
        onKeywordChange={setKeyword}
        searchPlaceholder="Cari nama guru, NIP, atau mata pelajaran..."
        category={category}
        onCategoryChange={setCategory}
        categoryOptions={["Semua Kategori", "Ayah Kandung", "Ibu Kandung", "Wali Murid"]}
      />
      {/* Bagian tampilan: direktori akun wali dan daftar siswa yang tertaut. */}
      <ManagementTable tableClassName={`${s.dataTable} ${s.directoryTable} ${s.parentTable}`} footer={<Pagination variant="directory" current={page} total={131} onChange={setPage} label="Menampilkan 1-7 dari 782 orang tua/wali" />}>
          <thead><tr><th>Nama Orang Tua / Wali</th><th>Siswa Terhubung &amp; Kelas</th><th>Nomor HP</th><th>Status Akun</th><th>Terakhir Akses</th><th>Aksi</th></tr></thead>
          <tbody>{filtered.map((parent) => <tr key={parent.name}>
            <td><span className={s.tableStrong}>{parent.name}</span><span className={s.tableSub}>{parent.relation}</span></td>
            <td><div className={s.parentChildren}><StatusBadge tone="primary" className={s.directoryBadge}><AdminIcon name="graduation-cap-linear" size={12} /> {parent.child}</StatusBadge>{parent.additionalChildren > 0 && <span className={s.parentAdditionalChildren}>+{parent.additionalChildren} anak <AdminIcon name="info-circle-linear" size={12} /></span>}</div></td><td>{parent.phone}</td><td><StatusBadge tone={parent.status === "Aktif" ? "success" : "warning"} className={`${s.directoryBadge} ${s.directoryStatusBadge}`}>{parent.status}</StatusBadge></td><td>{parent.access}</td>
            <td><ManagementActionButtons><AdminTableIconButton icon="eye-linear" title="Detail" ariaLabel="Detail" onClick={() => alert(`${parent.name}\n${parent.child}${parent.additionalChildren > 0 ? `\n+${parent.additionalChildren} anak` : ""}`)} /><AdminTableIconButton icon="pen-linear" title="Edit" ariaLabel="Edit" onClick={() => setModal(true)} /><AdminTableIconButton icon="history-linear" title="Riwayat" ariaLabel="Riwayat" onClick={() => alert("Riwayat akses akun wali")} /></ManagementActionButtons></td>
          </tr>)}{filtered.length === 0 && <TableEmpty colSpan={6} />}</tbody>
      </ManagementTable>

      {/* Bagian tampilan: modal registrasi wali, relasi keluarga, dan multi-child linking. */}
      {modal && <Modal title="Tambah Orang Tua / Wali" subtitle="Registrasi akun wali murid dan tautkan dengan data peserta didik aktif." onClose={() => setModal(false)} footer={<>{displayedErrorCount > 0 && <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", maxWidth: "220px", color: "var(--color-error)", fontSize: "var(--text-l12-size)", lineHeight: "var(--text-l12-line)" }}><AdminIcon name="danger-triangle-linear" size={16} />Pastikan {displayedErrorCount} kolom bermasalah telah diperbaiki</div>}<div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginLeft: "auto" }}><Button variant="outline" onClick={() => setModal(false)}>Batal</Button><Button type="submit" form="parent-form" icon="diskette-linear" disabled={displayedErrorCount > 0}>Simpan Akun Orang Tua</Button></div></>}>
        <form id="parent-form" onSubmit={handleSubmit} noValidate>
        <div className={s.formGrid}>
          <div className={s.formFull}><Field label="Nama Lengkap Orang Tua / Wali" value={form.name} onChange={(value) => setForm({ ...form, name: value })} onBlur={() => setTouched((current) => ({ ...current, name: true }))} error={shouldShowError("name") ? fieldErrors.name : undefined} required placeholder="Nama lengkap beserta gelar (jika ada)" /></div>
          <div className={s.formFull}><div className={`${s.formField} ${shouldShowError("relation") && fieldErrors.relation ? s.formFieldInvalid : ""}`} role="radiogroup" aria-label="Hubungan dengan Siswa" aria-invalid={shouldShowError("relation") && Boolean(fieldErrors.relation)}><span>Hubungan dengan Siswa *</span><div className={s.choiceRow}>{["Ayah Kandung", "Ibu Kandung", "Wali Murid"].map((item) => <label className={s.choicePill} key={item}><input type="radio" name="relation" checked={form.relation === item} onBlur={() => setTouched((current) => ({ ...current, relation: true }))} onChange={() => setForm({ ...form, relation: item })} />{item}</label>)}</div>{shouldShowError("relation") && fieldErrors.relation && <small className={s.fieldError} role="alert"><AdminIcon name="danger-triangle-linear" size={14} />{fieldErrors.relation}</small>}</div></div>
          <Field label="Nomor WhatsApp / HP Aktif" value={form.phone} onChange={(value) => setForm({ ...form, phone: value.replace(/\D/g, "").slice(0, 15) })} onBlur={() => setTouched((current) => ({ ...current, phone: true }))} error={shouldShowError("phone") ? fieldErrors.phone : undefined} required placeholder="08xxxxxxxxxx" inputMode="numeric" maxLength={15} />
          <Field label="Alamat Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} onBlur={() => setTouched((current) => ({ ...current, email: true }))} error={shouldShowError("email") ? fieldErrors.email : undefined} placeholder="nama@email.com" type="email" />
          <div className={s.formFull}><Field label="Alamat Domisili" value={form.address} onChange={(value) => setForm({ ...form, address: value })} onBlur={() => setTouched((current) => ({ ...current, address: true }))} error={shouldShowError("address") ? fieldErrors.address : undefined} required placeholder="Alamat lengkap sesuai domisili" /></div>
        </div>
        <div className={s.formSectionTitle}><span>Siswa Tertaut (Student Linking) *</span><StatusBadge tone="primary">1 Siswa Terpilih</StatusBadge></div>
        <div className={shouldShowError("student") && fieldErrors.student ? s.formFieldInvalid : ""}><label className={s.searchField}><AdminIcon name="magnifer-linear" size={16} /><input aria-label="Siswa tertaut" aria-invalid={shouldShowError("student") && Boolean(fieldErrors.student)} aria-describedby={shouldShowError("student") && fieldErrors.student ? "parent-student-error" : undefined} value={form.student} onBlur={() => setTouched((current) => ({ ...current, student: true }))} onChange={(e) => setForm({ ...form, student: e.target.value })} placeholder="Ketik NISN atau nama siswa untuk menautkan..." /></label>{shouldShowError("student") && fieldErrors.student && <small id="parent-student-error" className={s.fieldError} role="alert"><AdminIcon name="danger-triangle-linear" size={14} />{fieldErrors.student}</small>}</div>
        <div className={s.linkedStudent} style={{ marginTop: "var(--space-sm)" }}><span className={s.initialAvatar}>AP</span><div style={{ flex: 1 }}><strong>Andi Pratama <StatusBadge tone="success">Siswa Terhubung Utama</StatusBadge></strong><small>NISN: 0098471204 • Kelas 8B</small><small>Wali Kelas: Ibu Rina Marlina, M.Pd. • Aktif Semester Genap</small></div><button type="button" className={s.iconButton} aria-label="Hapus tautan"><AdminIcon name="close-linear" size={14} /></button></div>
        <button type="button" className={s.textLink} style={{ marginTop: "var(--space-md)", width: "100%", padding: "var(--space-sm)", border: "1px dashed var(--color-primary-light)", borderRadius: "var(--radius-s)" }}>+ Tautkan Anak / Siswa Lain (Multi-Child Support)</button>
        <div className={s.successLine} style={{ marginTop: "var(--space-md)" }}><AdminIcon name="check-circle-linear" size={15} /> Data terhubung dengan 1 peserta didik aktif</div>
        </form>
      </Modal>}
    </div>
  );
}
