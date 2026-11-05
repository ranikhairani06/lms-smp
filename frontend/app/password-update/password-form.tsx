"use client";

import { useState, type FormEvent } from "react";
import { ApiError, apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/lib/auth-types";
import { Icon } from "../../components/lms/Icon";
import "../../styles/lms-tokens.css";
import styles from "./password-update.module.css";

export default function PasswordForm({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState([false, false, false]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const rules = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /[0-9]/.test(password),
  ];

  const descriptions = [
    "Minimal 8 karakter",
    "Kombinasi huruf besar & kecil",
    "Minimal 1 angka (0–9)",
  ];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");
    setMessage("");

    if (!rules.every(Boolean)) {
      setError("Kata sandi baru belum memenuhi seluruh ketentuan.");
      return;
    }

    if (password === current) {
      setError("Kata sandi baru harus berbeda dari kata sandi saat ini.");
      return;
    }

    if (password !== confirmation) {
      setError("Konfirmasi kata sandi tidak sama dengan kata sandi baru.");
      return;
    }

    setPending(true);
    try {
      const result = await apiRequest<{ message: string; redirect: string }>("auth/password", {
        method: "PUT",
        body: JSON.stringify({ current_password: current, password, password_confirmation: confirmation }),
      });
      setMessage(result.message);
      router.replace(result.redirect);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.replace("/login");
        router.refresh();
      }
      setError(error instanceof Error ? error.message : "Kata sandi gagal disimpan.");
      setPending(false);
    }
  }

  function togglePassword(index: number) {
    setVisible((previous) =>
      previous.map((value, position) =>
        position === index ? !value : value,
      ),
    );
  }

  function renderField(
    index: number,
    label: string,
    value: string,
    setValue: (value: string) => void,
    placeholder: string,
    autoComplete: string,
  ) {
    const inputId = `password-${index}`;

    return (
      <div className={styles.field}>
        <label htmlFor={inputId}>
          {label} <span className={styles.required}>*</span>
        </label>

        <div className={styles.inputWrap}>
          <Icon name="lock" />

          <input
            id={inputId}
            name={
              ["current_password", "password", "password_confirmation"][index]
            }
            type={visible[index] ? "text" : "password"}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setError("");
              setMessage("");
            }}
            placeholder={placeholder}
            autoComplete={autoComplete}
            required
          />

          <button
            className={styles.eye}
            type="button"
            onClick={() => togglePassword(index)}
            aria-label={
              visible[index]
                ? `Sembunyikan ${label.toLowerCase()}`
                : `Tampilkan ${label.toLowerCase()}`
            }
            aria-pressed={visible[index]}
          >
            <Icon name="eye" />
          </button>
        </div>

        {index === 0 && (
          <p className={styles.fieldHelp}>
            Kata sandi default: tanggal lahir (DDMMYYYY).
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`lms-theme ${styles.screen}`}>
      <header className={styles.topbar}>
        <a className={styles.brand} href="/login" aria-label="EduSpace">
          <span className={styles.brandLogo}>
            <Icon name="cap" />
          </span>
          <strong>EduSpace</strong>
        </a>

        <span className={styles.systemName}>
          Learning Management System
        </span>
      </header>

      <main className={styles.main}>
        <div className={styles.layout}>
          <section className={styles.formColumn}>
            <h1 className={styles.pageTitle}>Ubah Kata Sandi</h1>

            <aside className={styles.banner}>
              <Icon name="info" />
              <div>
                <h2>Wajib ganti kata sandi saat login pertama</h2>
                <p>
                  Akunmu masih menggunakan kata sandi bawaan (Tanggal Lahir:
                  DDMMYYYY). Perbarui kata sandi sebelum dapat mengakses sistem.
                </p>
              </div>
            </aside>

            <section className={styles.identity}>
              <Icon name="user" />
              <div className={styles.identityCopy}>
                <h2>{user.name}</h2>
                <p>Username: {user.username}</p>
              </div>
              <span className={styles.badge}>{user.student?.class_room?.name ? `Kelas ${user.student.class_room.name}` : user.role}</span>
            </section>

            <form className={styles.form} onSubmit={submit}>
              {renderField(
                0,
                "Kata Sandi Saat Ini",
                current,
                setCurrent,
                "Masukkan kata sandi saat ini",
                "current-password",
              )}

              {renderField(
                1,
                "Kata Sandi Baru",
                password,
                setPassword,
                "Masukkan kata sandi baru yang unik",
                "new-password",
              )}

              <ul className={styles.rules} aria-live="polite">
                {descriptions.map((description, index) => (
                  <li
                    className={
                      password && rules[index] ? styles.passed : ""
                    }
                    key={description}
                  >
                    <span className={styles.ruleCircle}>
                      {password && rules[index] ? "✓" : ""}
                    </span>
                    {description}
                  </li>
                ))}
              </ul>

              {renderField(
                2,
                "Konfirmasi Kata Sandi",
                confirmation,
                setConfirmation,
                "Ulangi kata sandi baru",
                "new-password",
              )}

              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}

              {message && (
                <p className={styles.message} role="status">
                  {message}
                </p>
              )}

              <div className={styles.actions}>
                <a className={styles.backButton} href="/login">
                  <Icon name="arrow-left" />
                  Kembali
                </a>

                <button className={styles.submit} type="submit" disabled={pending}>
                  {pending ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
                </button>
              </div>
            </form>
          </section>

          <aside className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.heroLabel}>
                <Icon name="cap" />
                SMP TERPADU INDONESIA
              </p>

              <h2>Satu ruang untuk tumbuh bersama.</h2>
              <div className={styles.heroDot} />
            </div>

            <div className={styles.illustration} aria-hidden="true">
              <div className={styles.readyBadge}>
                <span className={styles.badgeCheck}>
                  <Icon name="check" />
                </span>
                <span className={styles.badgeText}>
                  <strong>Siap belajar</strong>
                  <small>Bersama EduSpace</small>
                </span>
              </div>

              <div className={styles.capShape} />
              <div className={styles.yellowBlock} />
              <div className={styles.yellowDot} />

              <div className={styles.laptop}>
                <div className={styles.laptopSidebar} />
                <div className={styles.laptopContent}>
                  <div className={styles.book}>
                    <svg viewBox="0 0 64 48" fill="none">
                      <path
                        d="M32 12C24 5 14 5 5 9v27c10-4 19-3 27 4V12Z"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M32 12c8-7 18-7 27-3v27c-10-4-19-3-27 4V12Z"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 16c5-2 10-1 14 1M12 24c5-2 10-1 14 1M52 16c-5-2-10-1-14 1M52 24c-5-2-10-1-14 1"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <span className={styles.blueLine} />
                  <span className={styles.grayLine} />
                </div>
              </div>

              <div className={styles.laptopBase} />
              <div className={styles.laptopShadow} />
            </div>
          </aside>
        </div>
      </main>

      <footer className={styles.footer}>
        <span>LMS • SMP Terpadu Indonesia</span>
        <span>TA 2026/2027 • Kementerian Pendidikan &amp; Kebudayaan</span>
      </footer>
    </div>
  );
}
