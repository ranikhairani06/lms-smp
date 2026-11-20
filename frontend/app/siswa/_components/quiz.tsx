"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Solar } from "./icon";
import { Badge, ButtonLink, Card, Heading, Stats } from "./ui";
import {
  saveQuizAttempt,
  useQuizAttempt,
  type QuizAttempt as Attempt,
} from "./quiz-store";
import { StudentEmpty, StudentError, StudentLoading } from "./api-state";
import { useStudentResource } from "@/lib/useStudentResource";
import { getStudentAssessment, logStudentExamActivity, submitStudentAssessment } from "@/lib/student-api";

export function QuizIntro() {
  const params = useParams();
  const subjectSlug = typeof params.subject === "string" ? params.subject : String(params.subject?.[0] ?? "");
  const quizId = typeof params.quiz === "string" ? params.quiz : String(params.quiz?.[0] ?? "");
  const loadAssessment = useCallback(() => getStudentAssessment(quizId), [quizId]);
  const resource = useStudentResource(loadAssessment);
  const b = `/siswa/mata-pelajaran/${subjectSlug}/kuis/${quizId}`;

  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [valid, setValid] = useState(false);

  if (resource.status === "loading") return <StudentLoading title="Memuat asesmen..." />;
  if (resource.status === "error") return <StudentError resource={resource} />;
  if (resource.status === "empty") return <StudentEmpty title="Asesmen belum tersedia." />;
  const { assessment, can_attempt: canAttempt } = resource.data;
  const title = assessment.title;

  const rules = [
    {
      title: "Navigasi Bebas & Tombol Ragu-ragu",
      description:
        "Siswa bebas melompat antar nomor soal dan dapat menandai opsi dengan label kuning Ragu-ragu untuk ditinjau kembali sebelum klik selesai.",
      tone: "blue",
    },
    {
      title: "Penyimpanan Otomatis",
      description:
        "Jawaban disimpan otomatis di browser selama sesi pengerjaan. Hindari menutup tab atau berpindah perangkat.",
      tone: "green",
    },
    {
      title: "Anti-Curang & Kunci Layar Penuh",
      description:
        "Kerjakan ujian secara mandiri. Ikuti arahan pengawas dan tetap berada di halaman ujian selama pengerjaan.",
      tone: "red",
    },
    {
      title: "Penutupan Otomatis (Auto-Submit)",
      description:
        "Jika waktu telah habis, sistem akan menutup lembar kerja secara otomatis dan memasukkan semua jawaban yang sudah terisi.",
      tone: "yellow",
    },
  ];

  return (
    <div className="es-qi">
      {/* Header */}
      <section className="es-qi-hero">
        <div className="es-qi-hero-copy">
          <h1>{title}</h1>

          <p>{assessment.description ?? "Deskripsi asesmen tidak tersedia dari API."}</p>
        </div>

        <div className="es-qi-schedule">
          <span>JADWAL DIMULAI</span>
          <strong>{assessment.start_at ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(assessment.start_at)) : "Jadwal tidak tersedia dari API"}</strong>
        </div>
      </section>

      {/* Statistik */}
      <div className="es-qi-stats">
        {[
          {
            label: "DURASI UJIAN",
            value: assessment.duration_minutes ? `${assessment.duration_minutes} Menit` : "—",
            icon: "clock-circle",
            hint: "Timer otomatis & auto-submit aktif",
            tone: "blue",
          },
          {
            label: "TOTAL SOAL",
            value: `${assessment.questions.length} Butir`,
            icon: "document-text",
            hint: "Jumlah soal berasal dari backend.",
            tone: "sky",
          },
          {
            label: "STANDAR KKM",
            value: assessment.passing_score?.toString() ?? "—",
            suffix: "/100 Poin",
            icon: "medal-star",
            hint: "Ambang batas dari backend.",
            tone: "yellow",
          },
          {
            label: "PERCOBAAN",
            value: `${assessment.maximum_attempt}x Kesempatan`,
            icon: "restart",
            hint: "Batas kesempatan pada asesmen.",
            tone: "yellow",
          },
        ].map((item) => (
          <Card className="es-qi-stat" key={item.label}>
            <div className="es-qi-stat-top">
              <span
                className={`es-qi-stat-icon es-qi-icon-${item.tone}`}
              >
                <Solar name={item.icon} />
              </span>

              <span className="es-qi-stat-label">
                {item.label}
              </span>
            </div>

            <div className="es-qi-stat-value">
              <strong>{item.value}</strong>
              {item.suffix && <span>{item.suffix}</span>}
            </div>

            <p>{item.hint}</p>
          </Card>
        ))}
      </div>

      {/* Token dan bantuan */}
      <div className="es-qi-access-grid">
        <Card className="es-qi-token-card">
          <div className="es-qi-section-heading">
            <h2>Verifikasi Token</h2>
            <p>
              Masukkan 8 karakter token ujian yang telah dirilis oleh
              pengawas ruang.
            </p>
          </div>

          <form
            className="es-qi-token-form"
            onSubmit={(e) => {
              e.preventDefault();

              setValid(false);
              setError(canAttempt
                ? "Backend belum menyediakan endpoint verifikasi token asesmen."
                : "Asesmen ini belum dapat dikerjakan pada tingkat kelas Anda.");
            }}
          >
            <div className="es-qi-token-box">
              <label htmlFor="quiz-token">
                <Solar name="lock-keyhole" />
                TOKEN UJIAN
              </label>

              <div className="es-qi-token-input-row">
                <input
                  id="quiz-token"
                  value={token}
                  placeholder="INF-CBT8"
                  autoComplete="off"
                  spellCheck={false}
                  required
                  onChange={(e) => {
                    setToken(e.target.value);
                    setValid(false);
                    setError("");
                  }}
                />

                <button className="es-qi-button" type="submit">
                  Periksa Token
                  <Solar name="alt-arrow-right" />
                </button>
              </div>

              {valid && (
                <div className="es-qi-token-success" role="status">
                  <Solar name="shield-check" />
                  <span>
                    Asesmen tersedia untuk akun siswa ini.
                  </span>
                </div>
              )}

              {error && (
                <p className="es-qi-token-error" role="alert">
                  {error}
                </p>
              )}
            </div>

            <div className="es-qi-start">
              {valid && canAttempt ? (
                <ButtonLink
                  href={`${b}/kerjakan`}
                  className="es-qi-button"
                >
                  Mulai Ujian Sekarang
                  <Solar name="alt-arrow-right" />
                </ButtonLink>
              ) : (
                <button
                  type="button"
                  className="es-qi-button"
                  disabled
                >
                  Mulai Ujian Sekarang
                  <Solar name="alt-arrow-right" />
                </button>
              )}
            </div>
          </form>
        </Card>

        <Card className="es-qi-help-card">
          <div className="es-qi-help-heading">
            <span className="es-qi-help-icon">
              <Solar name="shield-warning" />
            </span>

            <div>
              <h2>Bantuan & Protokol Darurat</h2>
              <p>Panduan jika terjadi kendala tak terduga</p>
            </div>
          </div>

          <p>
            Jika koneksi terputus atau browser macet saat pengerjaan:
          </p>

          <div className="es-qi-help-message">
            <strong>
              <Solar name="info-circle" />
              Pedoman Siswa:
            </strong>

            <p>
              “Tetap tenang, jangan panik. Segera angkat tangan dan
              lapor ke pengawas. Soal ujian dapat dilanjutkan sesuai
              arahan pengawas.”
            </p>
          </div>
        </Card>
      </div>

      {/* Struktur soal */}
      <Card className="es-qi-structure-card">
        <div className="es-qi-section-heading">
          <h2>Struktur Soal & Distribusi Bobot Nilai</h2>
          <p>
            Komposisi indikator capaian pembelajaran berbasis
            Kurikulum Merdeka
          </p>
        </div>

        <div className="es-qi-parts">
          <div className="es-qi-part es-qi-part-blue">
            <div className="es-qi-part-top">
              <span>Bagian A</span>
              <strong>15 Butir Soal</strong>
            </div>

            <h3>Pilihan Ganda</h3>
            <p>
              Dekomposisi masalah, pengenalan pola algoritmik, dan
              abstraksi logika sederhana.
            </p>

            <div className="es-qi-part-bottom">
              <span>4 Poin per Butir</span>
              <strong>Bobot: 60 Poin</strong>
            </div>
          </div>

          <div className="es-qi-part es-qi-part-yellow">
            <div className="es-qi-part-top">
              <span>Bagian B</span>
              <strong>5 Butir Soal</strong>
            </div>

            <h3>Uraian Kasus & Logika Percabangan</h3>
            <p>
              Perancangan pseudocode sederhana, analisis diagram
              alir, dan solusi masalah nyata.
            </p>

            <div className="es-qi-part-bottom">
              <span>8 Poin per Butir</span>
              <strong>Bobot: 40 Poin</strong>
            </div>
          </div>
        </div>

        <div className="es-qi-total">
          <span>
            <Solar name="calculator" />
            Akumulasi Nilai Maksimum
          </span>
          <strong>100.0 Poin</strong>
        </div>
      </Card>

      {/* Tata tertib */}
      <Card className="es-qi-rules-card">
        <div className="es-qi-section-heading">
          <h2>Tata Tertib & Panduan Pengerjaan CBT</h2>
          <p>
            Peraturan teknis yang berlaku selama sesi asesmen
            berlangsung
          </p>
        </div>

        <div className="es-qi-rules-grid">
          {rules.map((rule, index) => (
            <div
              className={`es-qi-rule es-qi-rule-${rule.tone}`}
              key={rule.title}
            >
              <h3>
                <span>{index + 1}</span>
                {rule.title}
              </h3>

              <p>{rule.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Tombol kembali */}
      <Card className="es-qi-bottom">
        <ButtonLink
          href={`/siswa/mata-pelajaran/${params.subject}?tab=asesmen`}
          variant="outline"
          className="es-qi-back"
        >
          <Solar name="alt-arrow-left" />
          Kembali ke Daftar Asesmen
        </ButtonLink>
      </Card>
    </div>
  );
}
export function QuizWork() {
  const params = useParams();
  const router = useRouter();
  const subjectSlug = typeof params.subject === "string" ? params.subject : String(params.subject?.[0] ?? "");
  const quizId = typeof params.quiz === "string" ? params.quiz : String(params.quiz?.[0] ?? "");
  const b = `/siswa/mata-pelajaran/${subjectSlug}/kuis/${quizId}`;
  const storageKey = `eduspace-student:${subjectSlug}:${quizId}:draft`;
  const loadAssessment = useCallback(() => getStudentAssessment(quizId), [quizId]);
  const resource = useStudentResource(loadAssessment);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [number, setNumber] = useState(0);
  const [marked, setMarked] = useState<number[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [savedAt, setSavedAt] = useState("");
  const [submitError, setSubmitError] = useState("");
  const submitting = useRef(false);
  const loggedSession = useRef<number | null>(null);
  const assessmentResponse = resource.status === "ready" ? resource.data : null;
  const assessment = assessmentResponse?.assessment ?? null;
  const questions = assessment?.questions ?? [];
  const durationSeconds = assessmentResponse?.remaining_seconds ?? (assessment?.duration_minutes ? assessment.duration_minutes * 60 : null);

  useEffect(() => {
    if (!assessmentResponse) return;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as Attempt;
        if (saved && !saved.submitted) {
          setAnswers(saved.answers || {});
          setRemaining(durationSeconds ?? 0);
        } else {
          setRemaining(durationSeconds ?? 0);
        }
      } else {
        setRemaining(durationSeconds ?? 0);
      }
    } catch {
      setStorageError(true);
      setRemaining(durationSeconds ?? 0);
    }
    setLoaded(true);
  }, [assessmentResponse, durationSeconds, storageKey]);

  useEffect(() => {
    if (!loaded || !assessmentResponse?.exam_session || loggedSession.current === assessmentResponse.exam_session.id) return;
    loggedSession.current = assessmentResponse.exam_session.id;
    void logStudentExamActivity(assessmentResponse.exam_session.id, "started");
  }, [assessmentResponse]);

  useEffect(() => {
    if (!loaded || durationSeconds === null) return;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [durationSeconds, loaded]);

  const submit = useCallback(async () => {
    if (!assessment || !assessmentResponse?.can_attempt || submitting.current) return;
    submitting.current = true;
    setSubmitError("");
    const payload: Record<number, string | number> = {};
    questions.forEach((question, index) => {
      const selected = answers[index];
      if (selected === undefined) return;
      if (question.type === "multiple_choice") {
        const option = question.options[selected];
        if (option) payload[question.id] = option.id;
      } else if (question.type === "true_false") {
        payload[question.id] = selected === 0 ? "true" : "false";
      }
    });
    try {
      const result = await submitStudentAssessment(assessment.id, payload);
      const attempt: Attempt = {
        answers,
        submitted: true,
        duration: Math.max(0, (durationSeconds ?? 0) - remaining),
        submittedAt: result.submitted_at,
        serverScore: result.score,
        serverStatus: result.status,
        passingScore: assessment.passing_score,
      };
      saveQuizAttempt(subjectSlug, quizId, attempt);
      sessionStorage.removeItem(storageKey);
      if (assessmentResponse.exam_session) {
        void logStudentExamActivity(assessmentResponse.exam_session.id, "submitted");
      }
      router.push(`${b}/hasil`);
    } catch {
      setSubmitError("Jawaban belum dapat dikirim. Silakan coba lagi.");
      submitting.current = false;
    }
  }, [assessment, assessmentResponse, answers, b, durationSeconds, questions, quizId, remaining, router, storageKey, subjectSlug]);

  useEffect(() => {
    if (loaded && durationSeconds !== null && remaining === 0) void submit();
  }, [durationSeconds, loaded, remaining, submit]);

  useEffect(() => {
    if (!loaded || Object.keys(answers).length === 0) return;
    try {
      const raw = sessionStorage.getItem(storageKey);
      const saved = raw ? (JSON.parse(raw) as Attempt) : null;
      sessionStorage.setItem(storageKey, JSON.stringify({ answers, submitted: false }));
      setSavedAt(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date()));
      setStorageError(false);
      const sessionId = assessmentResponse?.exam_session?.id;
    } catch {
      setStorageError(true);
    }
  }, [answers, assessmentResponse, loaded, storageKey]);

  if (resource.status === "loading") return <StudentLoading title="Memuat soal asesmen..." />;
  if (resource.status === "error") return <StudentError resource={resource} />;
  if (resource.status === "empty" || questions.length === 0) return <StudentEmpty title="Soal asesmen belum tersedia." />;
  if (!assessmentResponse?.can_attempt) return <StudentError resource={{ status: "error", statusCode: 403, message: "Asesmen ini belum dapat dikerjakan pada tingkat kelas Anda." }} />;

  const q = questions[number];
  if (!q) return <StudentEmpty title="Soal asesmen tidak ditemukan." />;
  if (!assessment) return <StudentEmpty title="Data asesmen tidak tersedia." />;
  const options = q.options.length ? q.options.map((option) => ({ text: option.option_text })) :
    q.type === "true_false" ? [{ text: "Benar" }, { text: "Salah" }] : [];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);
  const timeText = durationSeconds === null ? "—" : [Math.floor(remaining / 3600), Math.floor((remaining % 3600) / 60), remaining % 60].map((value) => String(value).padStart(2, "0")).join(":");
  return (
    <div className="es-qw">
      {/* Header */}
      <Card className="es-qw-heading">
        <div className="es-qw-heading-copy">
          <span className="es-qw-subject">Asesmen</span>
          <h1>{assessment.title}</h1>
        </div>

        <div className="es-qw-timer" role="timer">
          <span className="es-qw-timer-icon">
            <Solar name="clock-circle" />
          </span>

          <div>
            <span>SISA WAKTU UJIAN</span>
            <p>
              <strong>{timeText}</strong> Menit
            </p>
          </div>
        </div>
      </Card>

      {storageError && (
        <div className="es-qw-storage-warning" role="alert">
          Penyimpanan browser tidak tersedia. Hindari memuat ulang
          halaman selama mengerjakan.
        </div>
      )}
      {submitError && <p role="alert">{submitError}</p>}

      <div className="es-qw-columns">
        <div className="es-qw-main">
          {/* Nomor soal dan tombol ragu-ragu */}
          <Card className="es-qw-question-top">
            <div className="es-qw-question-badges">
              <span className="es-qw-number-badge">
                Soal Nomor {number + 1} dari {questions.length}
              </span>

              <span className="es-qw-weight-badge">
                Bobot: {q.points} Poin
              </span>
            </div>

            <button
              type="button"
              className={`es-qw-mark ${
                marked.includes(number) ? "is-marked" : ""
              }`}
              aria-pressed={marked.includes(number)}
              onClick={() =>
                setMarked((items) =>
                  items.includes(number)
                    ? items.filter((value) => value !== number)
                    : [...items, number],
                )
              }
            >
              <Solar name="flag" />
              {marked.includes(number)
                ? "Hapus Tanda Ragu-ragu"
                : "Tandai Ragu-ragu"}
            </button>
          </Card>

          {/* Pertanyaan dan pilihan */}
          <Card className="es-qw-question-card">
            <p className="es-qw-question-text">{q.prompt}</p>

            <p className="es-qw-question-instruction">
              Pilihlah satu opsi jawaban yang paling tepat:
            </p>

            <fieldset className="es-qw-options">
              <legend className="es-sr-only">
                Pilih jawaban untuk soal {number + 1}
              </legend>

              {options.length ? options.map((option, index) => (
                <label
                  className={`es-qw-option ${
                    answers[number] === index ? "is-selected" : ""
                  }`}
                  key={`${q.id}-${index}`}
                >
                  <input
                    type="radio"
                    name={`question-${number}`}
                    checked={answers[number] === index}
                    onChange={() =>
                      setAnswers((items) => ({
                        ...items,
                        [number]: index,
                      }))
                    }
                  />

                  <span className="es-qw-option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>

                  <span>{option.text}</span>
                </label>
              )) : <p>Jenis jawaban ini belum didukung oleh form asesmen saat ini.</p>}
            </fieldset>
          </Card>

          {/* Navigasi bawah */}
          <Card className="es-qw-controls">
            <button
              type="button"
              className="es-qw-previous"
              disabled={number === 0}
              onClick={() => setNumber((value) => value - 1)}
            >
              <Solar name="arrow-left" />
              Soal Sebelumnya
            </button>

            <span className="es-qw-save-status" role="status">
              <Solar
                name={storageError ? "info-circle" : "check-circle"}
              />

              <span>
                {storageError
                  ? "Draft gagal tersimpan di perangkat"
                  : savedAt
                    ? `Draft tersimpan di perangkat pada ${savedAt} WIB`
                    : "Jawaban akan tersimpan sebagai draft di perangkat"}
              </span>
            </span>

            <button
              type="button"
              className="es-qw-primary-button"
              disabled={number === questions.length - 1}
              onClick={() => setNumber((value) => value + 1)}
            >
              Soal Berikutnya
              <Solar name="arrow-right" />
            </button>
          </Card>
        </div>

        {/* Kolom kanan */}
        <aside className="es-qw-aside">
          <Card className="es-qw-navigation">
            <div className="es-qw-card-heading">
              <h2>Nomor Soal</h2>
              <span>{questions.length} Butir</span>
            </div>

            <div className="es-qw-number-grid">
              {questions.map((_, index) => {
                const isAnswered = answers[index] !== undefined;
                const isMarked = marked.includes(index);
                const isCurrent = number === index;

                return (
                  <button
                    type="button"
                    key={index}
                    className={[
                      isAnswered ? "is-answered" : "",
                      isMarked ? "is-marked" : "",
                      isCurrent ? "is-current" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-label={`Soal ${index + 1}${
                      isAnswered ? ", sudah dijawab" : ", belum dijawab"
                    }${isMarked ? ", ragu-ragu" : ""}`}
                    aria-current={isCurrent ? "step" : undefined}
                    onClick={() => setNumber(index)}
                  >
                    <span>{index + 1}</span>

                    <small aria-hidden="true">
                      {isMarked
                        ? "?"
                        : isAnswered
                          ? "✓"
                          : isCurrent
                            ? "•"
                            : "·"}
                    </small>
                  </button>
                );
              })}
            </div>

            <div className="es-qw-legend">
              <p>
                <span>
                  <i className="es-qw-dot-blue" />
                  Sudah Dijawab
                </span>
                <strong>{answeredCount} Butir</strong>
              </p>

              <p>
                <span>
                  <i className="es-qw-dot-yellow" />
                  Ragu-ragu
                </span>
                <strong>{marked.length} Butir</strong>
              </p>

              <p>
                <span>
                  <i className="es-qw-dot-grey" />
                  Belum Dijawab
                </span>
                <strong>{unansweredCount} Butir</strong>
              </p>
            </div>
          </Card>

          <Card className="es-qw-summary">
            <h2>Ringkasan Ujian</h2>

            <div className="es-qw-summary-copy">
              <p>
                <span>Total Butir Soal</span>
                <strong>{questions.length} Butir</strong>
              </p>

              <p>
                <span>Progres Pengerjaan</span>
                <strong className="es-qw-progress-value">
                  {progressPercent}% Selesai
                </strong>
              </p>
            </div>

            <div
              className="es-qw-progress-track"
              role="progressbar"
              aria-label="Progres pengerjaan kuis"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: `${progressPercent}%` }} />
            </div>

            <div className="es-qw-time-note">
              <Solar name="lock-keyhole" />
              <span>
                Ujian dikumpulkan otomatis apabila timer berakhir.
                Periksa jawaban sebelum waktu habis.
              </span>
            </div>
          </Card>

          <Card className="es-qw-submit-card">
            <button
              type="button"
              className="es-qw-primary-button"
              disabled={!loaded}
              onClick={() => setConfirm(true)}
            >
              <Solar name="clipboard-check" />
              Kumpulkan & Selesaikan Ujian
            </button>

            <p>
              <Solar name="info-circle" />
              <span>
                Pastikan seluruh soal telah dijawab dan diperiksa
                kembali sebelum menyelesaikan ujian. Jawaban tidak
                dapat diubah setelah dikumpulkan.
              </span>
            </p>
          </Card>
        </aside>
      </div>

      {/* Konfirmasi pengumpulan */}
      {confirm && (
        <div className="es-modal-overlay">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-title"
            className="es-card es-modal es-qw-modal"
          >
            <h2 id="submit-title">Kumpulkan jawaban kuis?</h2>

            <p>
              {answeredCount} dari {questions.length} soal telah
              dijawab. Jawaban tidak dapat diubah setelah
              dikumpulkan.
            </p>

            <div className="es-actions">
              <button
                type="button"
                autoFocus
                className="es-qw-previous"
                onClick={() => setConfirm(false)}
              >
                Periksa Kembali
              </button>

              <button
                type="button"
                className="es-qw-primary-button"
                onClick={() => void submit()}
              >
                Kumpulkan
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
export function QuizResult() {
  const params = useParams();
  const subjectSlug = typeof params.subject === "string" ? params.subject : String(params.subject?.[0] ?? "");
  const quizId = typeof params.quiz === "string" ? params.quiz : String(params.quiz?.[0] ?? "");
  const loadAssessment = useCallback(() => getStudentAssessment(quizId), [quizId]);
  const resource = useStudentResource(loadAssessment);
  const attempt = useQuizAttempt(subjectSlug, quizId);
  const [filter, setFilter] = useState("semua");
  const [page, setPage] = useState(1);
  const questions = resource.status === "ready" ? resource.data.assessment.questions : [];
  const answers = attempt?.answers || {};
  const answered = questions.filter((_, index) => answers[index] !== undefined).length;
  const skipped = questions.length - answered;
  const score = attempt?.serverScore ?? null;
  const passingScore = attempt?.passingScore ?? (resource.status === "ready" ? resource.data.assessment.passing_score : null);
  const passed = score !== null && passingScore !== null && score >= passingScore;
  const durationText = attempt ? `${Math.floor(attempt.duration / 60)}m ${attempt.duration % 60}s` : "—";
  const filteredQuestions = questions.map((question, index) => ({ question, index }));
  const pageSize = 2;
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleQuestions = filteredQuestions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (resource.status === "loading") return <StudentLoading title="Memuat hasil asesmen..." />;
  if (resource.status === "error") return <StudentError resource={resource} />;
  if (resource.status === "empty") return <StudentEmpty title="Asesmen tidak ditemukan." />;
  if (!attempt) return <StudentEmpty title="Hasil asesmen belum tersedia di perangkat ini." description="API backend belum menyediakan endpoint riwayat atau detail hasil untuk memulihkan pengiriman ini." />;
  return (
    <div className="es-qr">
      <Card className="es-qr-heading">
        <div className="es-qr-heading-copy">
          <h1>
            <span>Hasil & Evaluasi:</span>
            {resource.data.assessment.title}
          </h1>

          <div className="es-qr-heading-meta">
            <p>
              <Solar name="clock-circle" />
              <span>Waktu pengerjaan: {durationText}</span>
            </p>

            <p>
              <Solar name="user-rounded" />
              <span>
                Guru Pengampu:{" "}
                <strong>Informasi pengampu tidak tersedia dari API.</strong>
              </span>
            </p>
          </div>
        </div>

        <ButtonLink
          href={`/siswa/mata-pelajaran/${params.subject}`}
          variant="outline"
          className="es-qr-back"
        >
          <Solar name="arrow-left" />
          Kembali ke Mata Pelajaran
        </ButtonLink>
      </Card>

      <Card className="es-qr-score-card">
        <div className="es-qr-section-top">
          <h2>Ringkasan Nilai & Kelulusan</h2>

          <button
            type="button"
            className="es-qr-print"
            onClick={() => window.print()}
          >
            <Solar name="download" />
            Unduh Lembar Pembahasan (PDF)
          </button>
        </div>

        <div className="es-qr-score-panel">
          <div>
            <span className="es-qr-score-label">
              NILAI AKHIR ASESMEN
            </span>

            <p className="es-qr-score-number">
              <strong>{score ?? "—"}</strong>
              <span>/ 100</span>
            </p>
          </div>

          <span
            className={`es-qr-result-status ${
              score === null
                ? "is-neutral"
                : passed
                  ? "is-passed"
                  : "is-failed"
            }`}
          >
            <Solar name="shield-check" />

            {score === null
              ? "MENUNGGU PENILAIAN"
              : passed
                ? "TUNTAS MELAMPAUI KKTP"
                : "BELUM MENCAPAI KKTP"}
          </span>
        </div>
      </Card>

      <div className="es-qr-stats">
        {[
          {
            label: "AKURASI JAWABAN",
            value: "—",
            suffix: `/ ${questions.length} Soal`,
            icon: "check-circle",
            tone: "green",
            hint: "Backend tidak menyediakan rincian benar dan salah per soal.",
          },
          {
            label: "WAKTU PENGERJAAN",
            value: durationText,
            icon: "clock-circle",
            tone: "blue",
            hint: "Durasi pengerjaan dicatat oleh sesi browser ini.",
          },
          {
            label: "RERATA KELAS",
            value: "—",
            icon: "users-group-rounded",
            tone: "sky",
            hint: "Rerata kelas tidak tersedia dari API.",
          },
        ].map((item) => (
          <Card className="es-qr-stat" key={item.label}>
            <div className="es-qr-stat-top">
              <span
                className={`es-qr-stat-icon es-qr-icon-${item.tone}`}
              >
                <Solar name={item.icon} />
              </span>

              <span className="es-qr-stat-label">
                {item.label}
              </span>
            </div>

            <div className="es-qr-stat-value">
              <strong>{item.value}</strong>
              {item.suffix && <span>{item.suffix}</span>}
            </div>

            <p>{item.hint}</p>
          </Card>
        ))}
      </div>

      <Card className="es-qr-review-heading">
        <div>
          <h2>Ringkasan Pembahasan & Butir Soal Terpilih</h2>
          <p>
            Daftar telaah butir soal evaluasi formatif untuk
            pemahaman konsep mandiri
          </p>
        </div>

        <div
          className="es-qr-filters"
          role="group"
          aria-label="Filter pembahasan soal"
        >
          {[
            ["semua", "Semua Soal"],
            ["benar", "Soal Benar"],
            ["salah", "Soal Salah"],
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={filter === value ? "is-selected" : ""}
              aria-pressed={filter === value}
              disabled={value !== "semua"}
              onClick={() => {
                setFilter(value);
                setPage(1);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>

      <div className="es-qr-review-list">
        {visibleQuestions.map(({ question, index }) => {
          const isSkipped = answers[index] === undefined;
          return (
            <Card className="es-qr-review-card" key={index}>
              <div className="es-qr-review-top">
                <div className="es-qr-review-number">
                  <span>{index + 1}</span>
                  <strong>Butir Soal No. {index + 1}</strong>
                  <small>Bobot: {question.points} Poin</small>
                </div>
                <span className="es-qr-answer-status is-neutral">
                  {isSkipped ? "BELUM DIJAWAB" : "HASIL PER SOAL TIDAK TERSEDIA DARI API"}
                </span>
              </div>
              <p className="es-qr-question">{question.prompt}</p>
              <div className="es-qr-options">
                {question.options.map((option, optionIndex) => {
                  const isSelected =
                    attempt !== null &&
                    answers[index] === optionIndex;

                  return (
                    <div
                      className={`es-qr-option ${
                        isSelected ? "is-selected" : ""
                      }`}
                      key={option.id}
                    >
                      <span className="es-qr-option-copy">
                        <Solar
                          name={
                            isSelected ? "check-circle" : "minus-circle"
                          }
                        />

                        <span>
                          {String.fromCharCode(65 + optionIndex)}.{" "}
                          {option.option_text}
                        </span>
                      </span>

                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}

        {!visibleQuestions.length && (
          <Card className="es-qr-empty">
            Tidak ada soal sesuai filter yang dipilih.
          </Card>
        )}
      </div>

      <Card className="es-qr-pagination">
        <p>
          Menampilkan {visibleQuestions.length} butir soal dari total{" "}
          {filteredQuestions.length} butir soal
        </p>

        <div>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Sebelumnya
          </button>

          <span>
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            Selanjutnya
          </button>
        </div>
      </Card>
    </div>
  );
}

  
