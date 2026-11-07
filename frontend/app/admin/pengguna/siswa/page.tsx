"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import {
  Button,
  Field,
  InfoBanner,
  Modal,
  PageHeading,
  Pagination,
  SearchField,
  SelectField,
  StatusBadge,
  TableEmpty,
  adminStyles as s
} from "@/app/admin/_components/AdminUI";

const initialStudents = [
  { nisn: "0098723412", name: "Andi Pratama", rombel: "8A", gender: "Laki-laki", status: "Aktif (Sandi Diperbarui)", activity: "12 Menit lalu" },
  { nisn: "0098723415", name: "Siti Rahma", rombel: "8A", gender: "Perempuan", status: "Aktif (Sandi Diperbarui)", activity: "Hari ini, 09:14" },
  { nisn: "0099631245", name: "Budi Santoso", rombel: "7A", gender: "Laki-laki", status: "Terkunci (Salah Sandi)", activity: "Kemarin, 14:02" },
  { nisn: "0099631248", name: "Dewi Lestari", rombel: "7A", gender: "Perempuan", status: "Aktif (Sandi Diperbarui)", activity: "1 jam lalu" },
  { nisn: "0097451290", name: "Farhan Maulana", rombel: "9A", gender: "Laki-laki", status: "Aktif (Sandi Diperbarui)", activity: "Hari ini, 07:45" },
  { nisn: "0097451294", name: "Gita Maharani", rombel: "9A", gender: "Perempuan", status: "Aktif (Sandi Diperbarui)", activity: "3 hari lalu" },
  { nisn: "0099631250", name: "Hendro Prabowo", rombel: "7B", gender: "Laki-laki", status: "Belum Aktivasi", activity: "-" },
];

type Student = typeof initialStudents[number];

export default function SiswaPage() {
  const [students, setStudents] = useState(initialStudents);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("Semua Kategori");
  const [modal, setModal] = useState<"add" | "edit" | "detail" | "reset" | null>(null);
  const [selected, setSelected] = useState<Student>(initialStudents[0]);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ name: "", nisn: "", nik: "", birthplace: "", birthdate: "", gender: "Laki-laki", rombel: "Kelas 8B — Wali: Ibu Rina Marlina, M.Pd." });
  const [verified, setVerified] = useState(false);
  const filtered = useMemo(() => students.filter((item) => {
    const match = `${item.name} ${item.nisn}`.toLowerCase().includes(keyword.toLowerCase());
    const matchCategory = category === "Semua Kategori" || item.status.includes(category);
    return match && matchCategory;
  }), [students, keyword, category]);

  const openModal = (type: "add" | "edit" | "detail" | "reset", student?: Student) => {
    if (student) {
      setSelected(student);
      setForm({ name: student.name, nisn: student.nisn, nik: "327601xxxxxxxxxx", birthplace: "Jakarta", birthdate: "14/05/2010", gender: student.gender, rombel: `Kelas ${student.rombel} — Wali: Ibu Rina Marlina, M.Pd.` });
    } else {
      setForm({ name: "", nisn: "", nik: "", birthplace: "", birthdate: "", gender: "Laki-laki", rombel: "Kelas 8B — Wali: Ibu Rina Marlina, M.Pd." });
    }
    setVerified(false);
    setModal(type);
  };

  const saveStudent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.nisn.length !== 10) return;
    if (modal === "edit") {
      setStudents((rows) => rows.map((row) => row.nisn === selected.nisn ? { ...row, name: form.name, nisn: form.nisn, gender: form.gender, rombel: form.rombel.match(/Kelas (\w+)/)?.[1] ?? row.rombel } : row));
    } else {
      setStudents((rows) => [{ nisn: form.nisn, name: form.name, rombel: form.rombel.match(/Kelas (\w+)/)?.[1] ?? "8B", gender: form.gender, status: "Belum Aktivasi", activity: "-" }, ...rows]);
    }
    setModal(null);
  };

  return (
    <>
      
      <PageHeading
        breadcrumbs={["LMS", "Manajemen Pengguna", "Manajemen Siswa"]}
        title="Manajemen Siswa"
        description="Pengelolaan basis data peserta didik, alokasi kelas rombel, status kredensial NISN, dan verifikasi akun portal siswa."
        actions={
          <>
            {/* Tombol Import Data */}
            <Button
              variant="outline"
              className={s.importStudentButton}
              icon="upload-bold"
              onClick={() => alert("Pilih file Excel/CSV untuk proses import.")}
            >
              Import Data (Excel/CSV)
            </Button>

            {/* Tombol Tambah Siswa */}
            <Button
              className={s.addStudentButton}
              icon="user-plus-rounded-linear"
              onClick={() => openModal("add")}
            >
              Tambah Siswa
            </Button>
          </>
        }
      />

      {/* Bagian tampilan: kartu ringkasan akun peserta didik. */}
     {/* Kartu statistik khusus halaman Manajemen Siswa */}
      <div className={`${s.statGridFour} ${s.studentStatGrid}`}>
        {[
          {
            label: "Total Siswa Terdaftar",
            value: "860",
            icon: "users-group-rounded-linear",
            tone: "tone_primary",
          },
          {
            label: "Siswa Aktif Login",
            value: "812",
            icon: "user-check-linear",
            tone: "tone_success",
          },
          {
            label: "Belum Ganti Password",
            value: "48",
            icon: "lock-keyhole-linear",
            tone: "tone_warning",
          },
          {
            label: "Perlu Verifikasi NISN",
            value: "18",
            icon: "clipboard-check-linear",
            tone: "tone_danger",
          },
        ].map((item) => (
          <div className={s.studentStatCard} key={item.label}>

            {/* Ikon statistik di sebelah kiri */}
            <div className={`${s.statIcon} ${s[item.tone]}`}>
              <AdminIcon name={item.icon} size={20} />
            </div>

            {/* Angka dan keterangan di sebelah kanan */}
            <div className={s.studentStatContent}>
              <strong className={s.studentStatValue}>
                {item.value}
              </strong>

              <span className={s.studentStatLabel}>
                {item.label}
              </span>
            </div>

          </div>
        ))}
      </div>
      {/* Bagian tampilan: pencarian dan penyaringan direktori siswa. */}
      <div className={s.toolbar}>
        <SearchField value={keyword} onChange={setKeyword} placeholder="Cari nama / NISN..." />
        <div className={s.toolbarSpacer} />
        <SelectField value={category} onChange={setCategory} options={["Semua Kategori", "Aktif", "Terkunci", "Belum Aktivasi"]} />
      </div>
      {/* Bagian tampilan: tabel peserta didik beserta aksi detail, edit, dan reset kredensial. */}
      <div className={s.tableWrap}>
        <table className={s.dataTable}>
          <thead><tr><th>NISN</th><th>Nama Siswa</th><th>Rombel / Kelas</th><th>Jenis Kelamin</th><th>Status Akun LMS</th><th>Aktivitas Terakhir</th><th>Aksi</th></tr></thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student.nisn}>
                <td>{student.nisn}</td><td><span className={s.tableStrong}>{student.name}</span></td><td><span className={s.levelTag}>{student.rombel}</span></td><td>{student.gender}</td>
                <td><StatusBadge tone={student.status.startsWith("Aktif") ? "info" : student.status.startsWith("Terkunci") ? "danger" : "neutral"}>{student.status}</StatusBadge></td><td>{student.activity}</td>
                <td><div className={s.tableActions}>{student.status.startsWith("Terkunci") && <button className={s.textLink} onClick={() => setStudents((rows) => rows.map((row) => row.nisn === student.nisn ? { ...row, status: "Aktif (Sandi Diperbarui)" } : row))}>Buka Kunci</button>}<button className={s.iconButton} title="Detail" onClick={() => openModal("detail", student)}><AdminIcon name="eye-linear" size={15} /></button><button className={s.iconButton} title="Edit" onClick={() => openModal("edit", student)}><AdminIcon name="pen-linear" size={15} /></button><button className={s.iconButton} title="Reset kata sandi" onClick={() => openModal("reset", student)}><AdminIcon name="lock-keyhole-linear" size={15} /></button></div></td>
              </tr>
            ))}
            {filtered.length === 0 && <TableEmpty colSpan={7} />}
          </tbody>
        </table>
        <Pagination current={page} total={3} onChange={setPage} label={`Menampilkan 1-${filtered.length} dari 860 siswa`} />
      </div>

      {/* Bagian tampilan: modal tambah atau edit siswa, termasuk aturan kredensial login awal. */}
      {(modal === "add" || modal === "edit") && <Modal title={modal === "add" ? "Tambah Siswa Baru" : "Edit Data Siswa"} subtitle="Daftarkan akun peserta didik baru ke sistem portal LMS." onClose={() => setModal(null)} width="wide" footer={<><Button variant="outline" onClick={() => setModal(null)}>Batal</Button><Button type="submit" form="student-form" icon="diskette-linear">Simpan Siswa</Button></>}>
        <form id="student-form" onSubmit={saveStudent}>
          <InfoBanner><strong>Kredensial Login Siswa:</strong><p>NISN dipakai sebagai username awal. Kata sandi awal = tanggal lahir siswa (DDMMYYYY). Siswa wajib memperbarui sandi saat login perdana.</p></InfoBanner>
          <div className={s.formGrid}>
            <Field label="Nama Lengkap" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required placeholder="Nama lengkap peserta didik" />
            <Field label="NISN (Nomor Induk Siswa Nasional)" value={form.nisn} onChange={(value) => setForm({ ...form, nisn: value.replace(/\D/g, "").slice(0, 10) })} required hint="10 digit angka" placeholder="Masukkan 10 digit NISN" />
            <Field label="NIK (Nomor Induk Kependudukan) (16 digit)" value={form.nik} onChange={(value) => setForm({ ...form, nik: value })} placeholder="327601xxxxxxxxxx" />
            <Field label="Tempat Lahir" value={form.birthplace} onChange={(value) => setForm({ ...form, birthplace: value })} required placeholder="Kota kelahiran" />
            <Field label="Tanggal Lahir" value={form.birthdate} onChange={(value) => setForm({ ...form, birthdate: value })} required placeholder="DD/MM/YYYY" />
            <label className={s.formField}><span>Jenis Kelamin *</span><select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option>Laki-laki</option><option>Perempuan</option></select></label>
            <label className={`${s.formField} ${s.formFull}`}><span>Rombongan Belajar (Rombel) *</span><select value={form.rombel} onChange={(e) => setForm({ ...form, rombel: e.target.value })}><option>Kelas 8B — Wali: Ibu Rina Marlina, M.Pd.</option><option>Kelas 7A — Wali: Joko Susilo, S.Pd.</option><option>Kelas 9A — Wali: Ahmad Fauzi, M.Pd.</option></select><small>Kapasitas kelas mengikuti master data rombel.</small></label>
          </div>
          <div className={s.formSectionTitle}>Orang Tua / Wali Tertaut <button type="button" className={s.textLink}>+ Buat akun orang tua baru</button></div>
          <div className={s.linkedStudent}><span className={s.initialAvatar}>HA</span><div><strong>Hendra Ardiansyah</strong><small>Ayah Kandung</small></div><StatusBadge tone="success">Akun Terhubung</StatusBadge></div>
          {form.nisn.length > 0 && form.nisn.length !== 10 && <InfoBanner tone="danger">NISN harus terdiri dari 10 digit angka.</InfoBanner>}
        </form>
      </Modal>}

      {/* Bagian tampilan: modal detail siswa. */}
      {modal === "detail" && <Modal title="Detail Peserta Didik" subtitle={`${selected.name} • ${selected.rombel}`} onClose={() => setModal(null)} footer={<Button onClick={() => setModal(null)}>Tutup</Button>}>
        <div className={s.formGrid}><Field label="Nama Lengkap" value={selected.name} onChange={() => undefined} /><Field label="NISN" value={selected.nisn} onChange={() => undefined} /><Field label="Rombel" value={selected.rombel} onChange={() => undefined} /><Field label="Jenis Kelamin" value={selected.gender} onChange={() => undefined} /><div className={s.formFull}><StatusBadge tone={selected.status.startsWith("Aktif") ? "success" : "warning"}>{selected.status}</StatusBadge></div></div>
      </Modal>}

      {/* Bagian tampilan: konfirmasi reset sandi sesuai modal pada PDF. */}
      {modal === "reset" && <Modal title={`Reset kata sandi ${selected.name}?`} subtitle={`Peran: Siswa • Kelas ${selected.rombel}`} onClose={() => setModal(null)} footer={<><Button variant="outline" onClick={() => setModal(null)}>Batal</Button><Button variant="danger" disabled={!verified} onClick={() => { setStudents((rows) => rows.map((row) => row.nisn === selected.nisn ? { ...row, status: "Belum Ganti Password" } : row)); setModal(null); }}>Ya, Reset Kata Sandi</Button></>}>
        <InfoBanner tone="warning">Kata sandi akan dikembalikan ke tanggal lahir siswa. Siswa diminta membuat kata sandi baru saat login berikutnya.</InfoBanner>
        <p className={s.pageDescription}>Nomor Induk (NISN): <strong>{selected.nisn}</strong></p>
        <label className={s.choicePill}><input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} /> Saya sudah memverifikasi identitas pengguna</label>
        <p className={s.pageDescription}>Verifikasi identitas wali murid / siswa fisik telah dilakukan oleh admin.</p>
      </Modal>}
    </>
  );
}
