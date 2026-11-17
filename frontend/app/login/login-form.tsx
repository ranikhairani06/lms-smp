"use client";

import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api";
import type { Role } from "@/lib/auth-types";
import { useRouter } from "next/navigation";
import { Icon } from "../../components/lms/Icon";
import "../../styles/lms-tokens.css";
import styles from "./login.module.css";

type IconName =
  | "cap"
  | "user"
  | "lock"
  | "eye"
  | "database"
  | "student"
  | "teacher"
  | "parents"
  | "info"
  | "arrow";

const roles = ["Admin", "Siswa", "Guru", "Orang Tua"] as const;
const apiRoles = { Admin: "admin", Siswa: "student", Guru: "teacher", "Orang Tua": "parent" } as const;
const roleIcons: IconName[] = ["database", "student", "user", "parents"];

export default function LoginForm({ initialRole = "student", roleMismatch = false }: { initialRole?: Role; roleMismatch?: boolean }) {
  const router = useRouter();
  const requestedRole = roles.find((item) => apiRoles[item] === initialRole) ?? "Siswa";
  const [role, setRole] = useState<(typeof roles)[number]>(requestedRole);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const fields = new FormData(event.currentTarget);
    setMessage("");
    setPending(true);
    try {
      const result = await apiRequest<{ redirect: string }>("auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: String(fields.get("username") || "").trim(),
          password: fields.get("password"),
          role: apiRoles[role],
          remember: fields.get("remember") === "on",
        }),
      });
      router.replace(result.redirect);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login gagal. Silakan coba lagi.");
      setPending(false);
    }
  }

  return (
    <div className={`lms-theme ${styles.screen}`}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandLogo}>
            <Icon name="cap" />
          </span>
          <strong>EduSpace</strong>
        </div>

        <span className={styles.systemName}>Learning Management System</span>
      </header>

      <main className={styles.main}>
        <div className={styles.layout}>
          <section className={styles.formColumn} aria-label="Login EduSpace">
            <h1 className={styles.pageTitle}>Selamat datang kembali!</h1>
            {roleMismatch && (
              <p className={styles.message} role="status">
                Sesi yang aktif menggunakan role lain. Untuk membuka portal {requestedRole}, masuk dengan akun {requestedRole}.
              </p>
            )}

            <form className={styles.form} onSubmit={submit}>
              <div className={styles.field}>
                <label htmlFor="username">Username {role === "Siswa" ? "(NISN)" : role === "Guru" ? "(NIP)" : ""}</label>

                <div className={styles.inputWrap}>
                  <Icon name="user" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder={role === "Siswa" ? "Masukkan NISN siswa" : role === "Guru" ? "Masukkan NIP guru" : "Masukkan username akun"}
                    autoComplete="username"
                    required
                    aria-describedby="username-help"
                  />
                </div>

                <p className={styles.help} id="username-help">
                  {role === "Siswa" ? "Gunakan 10 digit NISN siswa." : role === "Guru" ? "Gunakan NIP yang terdaftar di sekolah." : "Gunakan username yang diberikan operator sekolah."}
                </p>
              </div>

              <div className={styles.field}>
                <label htmlFor="password">Password</label>

                <div className={styles.inputWrap}>
                  <Icon name="lock" />
                  <input
                    id="password"
                    name="password"
                    type={visible ? "text" : "password"}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    className={styles.eye}
                    type="button"
                    onClick={() => setVisible((current) => !current)}
                    aria-label={
                      visible ? "Sembunyikan password" : "Tampilkan password"
                    }
                    aria-pressed={visible}
                  >
                    <Icon name="eye" />
                  </button>
                </div>
              </div>

              <fieldset className={styles.roles}>
                <legend>Login sebagai</legend>

                <div className={styles.roleGrid}>
                  {roles.map((item, index) => (
                    <label
                      className={`${styles.role} ${
                        role === item ? styles.selected : ""
                      }`}
                      key={item}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={item}
                        checked={role === item}
                        onChange={() => setRole(item)}
                      />
                      <Icon name={roleIcons[index]} />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className={styles.remember}>
                <input type="checkbox" name="remember" />
                <span>Ingat saya</span>
              </label>

              <button type="submit" className={styles.submit} disabled={pending}>
                {pending ? "Memeriksa akun..." : "Masuk ke Sistem"}
              </button>

              {message && (
                <p className={styles.message} role="status">
                  {message}
                </p>
              )}

              <aside className={styles.notice}>
                <h2>Informasi Akun &amp; Kata Sandi</h2>

                <p>
                  Username = NISN/NIP
                  <br />
                  Password default = Tanggal Lahir (DDMMYYYY).
                  <br />
                  Orang tua memilih “Login sebagai: Orang Tua”.
                </p>

                <p className={styles.firstLogin}>
                  Login pertama? Kata sandi default wajib diganti sebelum
                  mengakses sistem.
                </p>

                <p>
                  Lupa kata sandi tidak dapat dilakukan secara mandiri. Hubungi
                  Tim IT / Operator Sekolah atau Wali Kelas untuk permohonan
                  reset kata sandi.
                </p>
              </aside>
            </form>
          </section>

          <aside className={styles.hero} aria-label="EduSpace">
            <div className={styles.heroCopy}>
              <p className={styles.heroLabel}>
                <Icon name="cap" />
                <span>SMP TERPADU INDONESIA</span>
              </p>

              <h2>Satu ruang untuk tumbuh bersama.</h2>
            </div>

            <span className={styles.heroDot} aria-hidden="true" />

            <div className={styles.illustration} aria-hidden="true">
              <div className={styles.readyBadge}>
                <span className={styles.badgeCheck}>✓</span>
                <span className={styles.badgeText}>
                  <strong>Siap belajar</strong>
                  <small>Bersama EduSpace</small>
                </span>
              </div>

              <div className={styles.capShape} />

              <span className={styles.yellowBlock} />
              <span className={styles.yellowDot} />

              <div className={styles.laptop}>
                <div className={styles.laptopSidebar} />

                <div className={styles.laptopContent}>
                  <div className={styles.book}>
                    <svg viewBox="0 0 64 48" fill="none">
                      <path
                        d="M32 13C25 7 16 7 8 10v28c8-3 17-3 24 3V13Z"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M32 13c7-6 16-6 24-3v28c-8-3-17-3-24 3V13Z"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15 17c4-1 8-1 12 1M15 25c4-1 8 0 12 2m10-9c4-2 8-2 12-1m-12 9c4-2 8-3 12-2"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <span className={styles.blueLine} />
                  <span className={styles.grayLine} />
                </div>
              </div>

              <span className={styles.laptopBase} />
              <span className={styles.laptopShadow} />
            </div>
          </aside>
        </div>
      </main>

      <footer className={styles.footer}>
        <span>LMS • SMP Terpadu Indonesia</span>
      </footer>
    </div>
  );
}
