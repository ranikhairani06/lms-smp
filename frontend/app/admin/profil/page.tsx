"use client";

import { useState } from "react";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import { Button, Field, PageHeading, Panel, adminStyles as s } from "@/app/admin/_components/AdminUI";

export default function ProfilAdminPage() {
  const [personal, setPersonal] = useState({ nip: "198504122010011008", name: "Bayu Pradana, S.Kom., M.T.", email: "bayu.admin@smpn1.sch.id", phone: "0812-9844-1120" });
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [saved, setSaved] = useState(false);
  const passwordOkay = password.next.length >= 8 && /[A-Z]/.test(password.next) && /[a-z]/.test(password.next) && /\d/.test(password.next) && /[^A-Za-z0-9]/.test(password.next);

  return (
    <>
      <PageHeading breadcrumbs={["LMS", "Profil"]} title="Profil Administrator" />
      {/* Bagian tampilan: kartu identitas akun administrator dan aksi ubah foto. */}
      <div className={s.profileHero}>
        <div className={s.profilePhoto}>AB</div>
        <div className={s.profileHeroText}><strong>Admin Bayu</strong><p><span style={{ color: "#3B5BDB" }}>● Peran: Super Administrator</span></p><p>NIP/NIK: 198504122010011008</p><p><AdminIcon name="clock-circle-linear" size={12} /> Terakhir masuk: Hari ini, 07:42 WIB</p></div>
        <Button variant="outline" icon="camera-linear" onClick={() => alert("Pilih foto profil baru.")}>Ubah Foto Profil</Button>
      </div>
      <div className={s.profileGrid}>
        {/* Bagian tampilan: informasi pribadi dan identitas resmi administrator. */}
        <Panel>
          <h2 className={s.profileCardTitle}>Informasi Pribadi</h2><p className={s.profileCardDesc}>Data identitas resmi administrator sekolah</p>
          <div className={s.formGrid}>
            <div className={s.formFull}><Field label="NIP / NIK Resmi" value={personal.nip} onChange={(value) => setPersonal({ ...personal, nip: value })} required /></div>
            <div className={s.formFull}><Field label="Nama Lengkap Beserta Gelar" value={personal.name} onChange={(value) => setPersonal({ ...personal, name: value })} required /></div>
            <div className={s.formFull}><Field label="Alamat Email" value={personal.email} onChange={(value) => setPersonal({ ...personal, email: value })} required type="email" /></div>
            <div className={s.formFull}><Field label="Nomor Telepon / WhatsApp" value={personal.phone} onChange={(value) => setPersonal({ ...personal, phone: value })} required /></div>
          </div>
          <div className={s.modalFooter} style={{ padding: "14px 0 0", marginTop: 16 }}><Button variant="outline" onClick={() => setSaved(false)}>Batalkan</Button><Button icon="diskette-linear" onClick={() => setSaved(true)}>Simpan Perubahan Data Diri</Button></div>
          {saved && <p className={s.successLine}><AdminIcon name="check-circle-linear" size={14} /> Perubahan data diri berhasil disimpan (pratinjau lokal).</p>}
        </Panel>

        {/* Bagian tampilan: formulir pembaruan kata sandi dan indikator kekuatan sandi. */}
        <Panel>
          <h2 className={s.profileCardTitle}><AdminIcon name="shield-keyhole-linear" size={16} /> Pembaruan Kata Sandi</h2><p className={s.profileCardDesc}>Gunakan kata sandi yang kuat dan tidak mudah ditebak.</p>
          <div className={s.formGrid}>
            <div className={s.formFull}><label className={s.formField}><span>Kata Sandi Saat Ini *</span><div style={{ display: "flex", alignItems: "center", gap: 8 }}><input style={{ flex: 1 }} type={showCurrent ? "text" : "password"} value={password.current} onChange={(e) => setPassword({ ...password, current: e.target.value })} placeholder="Masukkan kata sandi saat ini" /><button className={s.iconButton} onClick={() => setShowCurrent(!showCurrent)} aria-label="Tampilkan kata sandi"><AdminIcon name={showCurrent ? "eye-closed-linear" : "eye-linear"} size={15} /></button></div></label></div>
            <div className={s.formFull}><label className={s.formField}><span>Kata Sandi Baru *</span><div style={{ display: "flex", alignItems: "center", gap: 8 }}><input style={{ flex: 1 }} type={showNext ? "text" : "password"} value={password.next} onChange={(e) => setPassword({ ...password, next: e.target.value })} placeholder="Masukkan kata sandi baru" /><button className={s.iconButton} onClick={() => setShowNext(!showNext)} aria-label="Tampilkan kata sandi baru"><AdminIcon name={showNext ? "eye-closed-linear" : "eye-linear"} size={15} /></button></div></label></div>
            <div className={s.formFull}><div className={s.passwordStrength}>Kekuatan Sandi: {passwordOkay ? "Sangat Kuat" : password.next.length >= 8 ? "Perlu diperkuat" : "Belum memenuhi syarat"}</div><div className={s.progressTrack}><span style={{ width: passwordOkay ? "100%" : `${Math.min(80, password.next.length * 9)}%`, background: passwordOkay ? "#2F9E44" : "#E8A317" }} /></div><small className={s.tableSub}>Min. 8 karakter • Huruf kapital &amp; kecil • Angka &amp; simbol</small></div>
            <div className={s.formFull}><Field label="Konfirmasi Kata Sandi Baru" value={password.confirm} onChange={(value) => setPassword({ ...password, confirm: value })} type="password" required /></div>
          </div>
          {password.confirm && password.confirm !== password.next && <p style={{ color: "#E03131", fontSize: 9 }}>Konfirmasi kata sandi belum cocok.</p>}
          {password.confirm && password.confirm === password.next && passwordOkay && <p className={s.successLine}><AdminIcon name="check-circle-linear" size={14} /> Kata sandi konfirmasi cocok dengan sandi baru</p>}
          <Button className="" icon="lock-keyhole-linear" disabled={!password.current || !passwordOkay || password.confirm !== password.next} onClick={() => { setPassword({ current: "", next: "", confirm: "" }); alert("Form kata sandi dibersihkan (pratinjau lokal). Integrasikan ke API untuk menyimpan."); }}>Perbarui Kata Sandi</Button>
        </Panel>
      </div>
    </>
  );
}
