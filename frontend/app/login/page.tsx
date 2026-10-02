"use client";

import { useState, type FormEvent } from "react";
import styles from "./login.module.css";

type IconName = "cap" | "user" | "lock" | "eye" | "database" | "student" | "teacher" | "parents" | "info" | "arrow";
function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    cap: <><path d="m3 9 9-4 9 4-9 4-9-4Z"/><path d="M7 11v5c3 2 7 2 10 0v-5M21 9v7"/></>,
    user: <><circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3Z"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1"/></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    database: <><ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v14c0 4 14 4 14 0V5M5 12c0 4 14 4 14 0"/></>,
    student: <><circle cx="11" cy="5" r="3"/><path d="m4 10 3 5h7l3 6M9 10v7h5M5 17a5 5 0 0 0 7 5"/></>,
    teacher: <><circle cx="12" cy="5" r="3"/><path d="M5 22v-9l7-3 7 3v9M9 22v-7h6v7M12 15v7"/></>,
    parents: <><circle cx="9" cy="6" r="3"/><circle cx="17" cy="9" r="2"/><path d="M2 21v-4a7 7 0 0 1 14 0v4M17 14a5 5 0 0 1 5 5v2"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.1"/></>,
    arrow: <><path d="M3 12h18m-7-7 7 7-7 7"/></>,
  };
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
const roles = ["Admin", "Siswa", "Guru", "Orang Tua"] as const;
const roleIcons: IconName[] = ["database", "student", "teacher", "parents"];

export default function LoginPage() {
  const [role, setRole] = useState<(typeof roles)[number]>("Admin");
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Tampilan login sudah siap. Verifikasi akun akan tersedia setelah API Laravel dihubungkan.");
  }
  return (
    <div className={styles.screen}>
      <main className={styles.main}>
        <section className={styles.card} aria-label="Login EduSpace">
          <header className={styles.header}>
            <span className={styles.logo}><Icon name="cap" /></span>
            <h1>EduSpace Learning Management System</h1>
          </header>
          <form className={styles.form} onSubmit={submit}>
            <div className={styles.field}>
              <label htmlFor="username">Username</label>
              <div className={styles.inputWrap}>
                <Icon name="user" />
                <input id="username" name="username" type="text" placeholder="Masukkan NISN siswa atau NIP guru" autoComplete="username" required aria-describedby="username-help" />
              </div>
              <p className={styles.help} id="username-help"><Icon name="info" /> Gunakan 10 digit NISN untuk siswa</p>
            </div>
            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <div className={styles.inputWrap}>
                <Icon name="lock" />
                <input id="password" name="password" type={visible ? "text" : "password"} placeholder="••••••••" autoComplete="current-password" required />
                <button className={styles.eye} type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Sembunyikan password" : "Tampilkan password"} aria-pressed={visible}><Icon name="eye" /></button>
              </div>
            </div>
            <fieldset className={styles.roles}>
              <legend>Login sebagai</legend>
              <div className={styles.roleGrid}>
                {roles.map((item, index) => <label className={`${styles.role} ${role === item ? styles.selected : ""}`} key={item}>
                  <input type="radio" name="role" value={item} checked={role === item} onChange={() => setRole(item)} />
                  <Icon name={roleIcons[index]} /><span>{item}</span>
                </label>)}
              </div>
            </fieldset>
            <label className={styles.remember}><input type="checkbox" name="remember" /> Ingat saya di perangkat ini</label>
            <button type="submit" className={styles.submit}>Masuk ke Sistem <Icon name="arrow" /></button>
            {message && <p className={styles.message} role="status">{message}</p>}
            <aside className={styles.notice}>
              <h2><Icon name="info" /> Informasi Akun &amp; Kata Sandi:</h2>
              <p>Akun default siswa/guru/orang tua menggunakan kredensial awal:<br />Username = NISN/NIP<br />Password default = Tanggal Lahir (DDMMYYYY).<br />Orang tua memilih “Login sebagai → Orang Tua”.</p>
              <p>Lupa kata sandi tidak dapat dilakukan secara mandiri (non self-service). Silakan hubungi Tim IT / Operator Sekolah atau Wali Kelas untuk permohonan reset kata sandi.</p>
            </aside>
          </form>
        </section>
      </main>
      <footer className={styles.footer}><span>LMS • SMP Terpadu Indonesia</span><span>TA 2026/2027 <span className={styles.dot}>•</span> Kementerian Pendidikan &amp; Kebudayaan</span></footer>
    </div>
  );
}
