"use client";

import { useState } from "react";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import { Button, Field, PageHeading, Panel, StatusBadge } from "@/app/admin/_components";
import styles from "./page.module.css";

export default function ProfilAdminPage() {
  const [personal, setPersonal] = useState({ nip: "198504122010011008", name: "Bayu Pradana, S.Kom., M.T.", email: "bayu.admin@smpn1.sch.id", phone: "0812-9844-1120" });
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const minimumLength = password.next.length >= 8;
  const mixedCase = /[A-Z]/.test(password.next) && /[a-z]/.test(password.next);
  const hasNumberAndSymbol = /\d/.test(password.next) && /[^A-Za-z0-9]/.test(password.next);
  const passwordOkay = minimumLength && mixedCase && hasNumberAndSymbol;

  return (
    <main className={styles.profilePage}>
      <PageHeading breadcrumbs={["LMS", "Profil"]} title="Profil Administrator" />

      {/* Bagian tampilan: identitas administrator, status peran, dan aksi foto. */}
      <section className={styles.profileHero}>
        <div className={styles.profileAvatar} aria-label="Inisial Admin Bayu">
          AB
          <span><AdminIcon name="check-bold" size={14} /></span>
        </div>
        <div className={styles.profileIdentity}>
          <strong>Admin Bayu</strong>
          <StatusBadge tone="info" className={styles.profileRole}><AdminIcon name="shield-check-bold" size={13} />Peran: Super Administrator</StatusBadge>
          <p><AdminIcon name="card-2-linear" size={14} />NIP/NIK: <b>198504122010011008</b></p>
          <p><AdminIcon name="clock-circle-linear" size={14} />Terakhir masuk: Hari ini, 07:42 WIB</p>
        </div>
        <Button size="medium" variant="softPrimary" icon="cloud-upload-linear" onClick={() => alert("Pilih foto profil baru.")}>Ubah Foto Profil</Button>
      </section>

      <div className={styles.profileCards}>
        {/* Bagian tampilan: data identitas dan aksi simpan profil. */}
        <Panel className={styles.profileCard}>
          <header className={styles.cardHeading}>
            <h2>Informasi Pribadi</h2>
            <p>Data identitas resmi administrator sekolah</p>
          </header>
          <div className={styles.personalFields}>
            <Field className={styles.profileField} label="NIP / NIK Resmi" value={personal.nip} onChange={(value) => setPersonal({ ...personal, nip: value })} required leadingIcon="card-2-linear" />
            <Field className={styles.profileField} label="Nama Lengkap Beserta Gelar" value={personal.name} onChange={(value) => setPersonal({ ...personal, name: value })} required leadingIcon="user-circle-linear" />
            <Field className={styles.profileField} label="Alamat Email" value={personal.email} onChange={(value) => setPersonal({ ...personal, email: value })} required type="email" leadingIcon="letter-linear" />
            <Field className={styles.profileField} label="Nomor Telepon / WhatsApp" value={personal.phone} onChange={(value) => setPersonal({ ...personal, phone: value })} required leadingIcon="phone-linear" />
          </div>
          <footer className={styles.personalActions}>
            <Button size="medium" variant="ghost" onClick={() => setSaved(false)}>Batalkan</Button>
            <Button size="medium" variant="primarySolid" icon="diskette-linear" onClick={() => setSaved(true)}>Simpan Perubahan Data Diri</Button>
          </footer>
          {saved && <p className={styles.savedMessage}><AdminIcon name="check-circle-linear" size={14} />Perubahan data diri berhasil disimpan (pratinjau lokal).</p>}
        </Panel>

        {/* Bagian tampilan: kolom sandi, indikator kekuatan, dan kriteria sandi. */}
        <Panel className={`${styles.profileCard} ${styles.passwordCard}`}>
          <header className={styles.cardHeading}>
            <h2><AdminIcon name="lock-password-unlocked-linear" size={20} />Pembaruan Kata Sandi</h2>
          </header>
          <div className={styles.passwordFields}>
            <Field className={styles.profileField} label="Kata Sandi Saat Ini" value={password.current} onChange={(value) => setPassword({ ...password, current: value })} placeholder="Masukkan kata sandi saat ini" type={showCurrent ? "text" : "password"} required leadingIcon="key-linear" trailingAction={<button className={styles.passwordToggle} type="button" onClick={() => setShowCurrent(!showCurrent)} aria-label="Tampilkan kata sandi"><AdminIcon name={showCurrent ? "eye-closed-linear" : "eye-linear"} size={17} /></button>} />
            <Field className={styles.profileField} label="Kata Sandi Baru" value={password.next} onChange={(value) => setPassword({ ...password, next: value })} placeholder="Masukkan kata sandi baru" type={showNext ? "text" : "password"} required leadingIcon="password-minimalistic-input-linear" trailingAction={<button className={styles.passwordToggle} type="button" onClick={() => setShowNext(!showNext)} aria-label="Tampilkan kata sandi baru"><AdminIcon name={showNext ? "eye-closed-linear" : "eye-linear"} size={17} /></button>} />

            <div className={styles.strengthBlock}>
              <div className={styles.strengthHeading}><span>Kekuatan Sandi:</span><strong className={passwordOkay ? styles.strengthReady : styles.strengthPending}><AdminIcon name={passwordOkay ? "verified-check-bold" : "info-circle-linear"} size={14} />{passwordOkay ? "Sangat Kuat" : "Belum memenuhi syarat"}</strong></div>
              <div className={styles.strengthBars} aria-hidden="true">
                <span className={minimumLength ? styles.strengthBarReady : ""} />
                <span className={mixedCase ? styles.strengthBarReady : ""} />
                <span className={hasNumberAndSymbol ? styles.strengthBarReady : ""} />
              </div>
              <div className={styles.passwordCriteria}>
                <span className={minimumLength ? styles.criteriaReady : ""}><AdminIcon name={minimumLength ? "check-circle-linear" : "record-circle-linear"} size={13} />Min. 8 karakter</span>
                <span className={mixedCase ? styles.criteriaReady : ""}><AdminIcon name={mixedCase ? "check-circle-linear" : "record-circle-linear"} size={13} />Huruf kapital &amp; kecil</span>
                <span className={hasNumberAndSymbol ? styles.criteriaReady : ""}><AdminIcon name={hasNumberAndSymbol ? "check-circle-linear" : "record-circle-linear"} size={13} />Angka &amp; simbol</span>
              </div>
            </div>

            <Field className={styles.profileField} label="Konfirmasi Kata Sandi Baru" value={password.confirm} onChange={(value) => setPassword({ ...password, confirm: value })} type={showConfirm ? "text" : "password"} required leadingIcon="check-square-linear" trailingAction={<button className={styles.passwordToggle} type="button" onClick={() => setShowConfirm(!showConfirm)} aria-label="Tampilkan konfirmasi kata sandi"><AdminIcon name={showConfirm ? "eye-closed-linear" : "eye-linear"} size={17} /></button>} />
          </div>
          {password.confirm && password.confirm !== password.next && <p className={styles.passwordMismatch}>Konfirmasi kata sandi belum cocok.</p>}
          {password.confirm && password.confirm === password.next && <p className={styles.passwordMatch}><AdminIcon name="check-circle-linear" size={14} />Kata sandi konfirmasi cocok dengan sandi baru</p>}
          <Button size="medium" className={styles.passwordSubmit} variant="dark" icon="lock-keyhole-linear" disabled={!password.current || !passwordOkay || password.confirm !== password.next} onClick={() => { setPassword({ current: "", next: "", confirm: "" }); alert("Form kata sandi dibersihkan (pratinjau lokal). Integrasikan ke API untuk menyimpan."); }}>Perbarui Kata Sandi</Button>
        </Panel>
      </div>
    </main>
  );
}
