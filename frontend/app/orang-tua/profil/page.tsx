import { Solar } from "../../siswa/_components/icon";
import { ParentCard, ParentPageHeading } from "../parent-components";
import { requireUser } from "@/lib/backend";
import { getParentDashboard, studentClass, studentName, studentNisn } from "../parent-api";

function Field({ label, value }: { label: string; value: string }) {
  return <div className="parent-profile-field"><span>{label}</span><div><strong>{value}</strong><Solar name="lock-keyhole" /></div></div>;
}

export default async function ParentProfilePage() {
  const user = await requireUser("parent");
  const data = await getParentDashboard();
  const student = data.student;
  return <>
    <ParentPageHeading title="Profil Orang Tua / Wali Murid" description="Informasi identitas akun orang tua/wali dan data anak terhubung." />
    <div className="parent-profile-grid">
      <div className="parent-profile-main">
        <ParentCard className="parent-profile-card">
          <div className="parent-section-title parent-profile-card-heading"><div><h2>Data Identitas Diri</h2><p>Informasi identitas wali murid resmi sesuai dokumen anak</p></div><span className="parent-readonly-chip"><Solar name="lock-keyhole" />Data Terkunci</span></div>
          <div className="parent-profile-fields"><Field label="NAMA LENGKAP ORANG TUA / WALI" value={user.name || "—"} /><Field label="HUBUNGAN DENGAN SISWA" value="—" /></div>
        </ParentCard>
        <ParentCard className="parent-profile-card">
          <div className="parent-section-title parent-profile-card-heading"><div><h2>Saluran Komunikasi Resmi</h2><p>Kontak aktif yang digunakan pihak sekolah untuk pengiriman info &amp; laporan</p></div></div>
          <div className="parent-profile-fields"><Field label="NOMOR TERDAFTAR" value="—" /><Field label="ALAMAT EMAIL" value={user.email || "—"} /><Field label="ALAMAT DOMISILI TEMPAT TINGGAL" value="—" /></div>
        </ParentCard>
        <ParentCard className="parent-profile-update"><span className="parent-stat-icon"><Solar name="shield-check" /></span><div><h2>Ingin Memperbarui Data Biodata atau Kontak?</h2><p>Silakan hubungi wali kelas atau bagian Tata Usaha sekolah. Perubahan informasi akan diperiksa dan diverifikasi sebelum diperbarui.</p></div></ParentCard>
      </div>
      <aside className="parent-profile-aside">
        <ParentCard className="parent-about-card">
          <div className="parent-section-title parent-divided-heading"><h2>Siswa Terhubung</h2></div>
          <div className="parent-connected-student">
            <div className="parent-child-summary"><span className="parent-avatar">{studentName(student).split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("")}</span><div><strong>{studentName(student)}</strong><p>{studentClass(student)}</p></div></div>
            <div className="parent-child-meta"><div><span>NISN SISWA</span><strong>{studentNisn(student)}</strong></div><div><span>STATUS BELAJAR</span><p className="is-positive">—</p></div></div>
            <div className="parent-homeroom"><span>WALI KELAS PENGAMPU</span><p><Solar name="user" />—</p></div>
          </div>
        </ParentCard>
        <div className="parent-security-card"><h2><Solar name="shield-check" />Keamanan Akses Login</h2><p>Akun orang tua terhubung dengan akun siswa melalui data sekolah. Jaga kerahasiaan kata sandi untuk melindungi informasi akademik putra/putri Anda.</p><div className="parent-security-note"><Solar name="info-circle" /><strong>Jika lupa kata sandi, silakan hubungi bagian Tata Usaha sekolah.</strong></div></div>
        <ParentCard className="parent-profile-contact">
          <div className="parent-section-title parent-divided-heading"><h2>Pusat Layanan Sekolah</h2></div>
          <p>Bapak/Ibu membutuhkan bantuan teknis LMS, klarifikasi nilai, atau pembaruan berkas administrasi? Hubungi tim sekolah atau wali kelas:</p>
          <div className="parent-service-item"><Solar name="user-speak" /><div><strong>Wali Kelas</strong><p>—</p></div></div>
          <div className="parent-service-item"><Solar name="buildings" /><div><strong>Layanan Administrasi</strong><p>Ruang Tata Usaha Sekolah</p></div></div>
        </ParentCard>
      </aside>
    </div>
  </>;
}
