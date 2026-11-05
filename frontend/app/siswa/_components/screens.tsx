"use client";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Solar } from "./icon";
import { subjects, student, modules, assignments } from "./data";
import {
  Attachment,
  Badge,
  ButtonLink,
  Card,
  Heading,
  Progress,
  Stats,
} from "./ui";
const base = "/siswa/mata-pelajaran";

const subjectCardDetails: Record<
  string,
  {
    teacher: string;
    schedule: string;
    modules: string;
    progress: number;
    assessment: string;
  }
> = {
  informatika: {
    teacher: "Bpk. Hendra Gunawan, S.Kom.",
    schedule: "Senin & Rabu | 08.00 – 09.20 WIB",
    modules: "4/6",
    progress: 65,
    assessment: "1 Tugas Aktif",
  },
  matematika: {
    teacher: "Ibu Siti Nurhaliza, M.Pd.",
    schedule: "Selasa & Kamis | 07.15 – 08.45 WIB",
    modules: "8/10",
    progress: 80,
    assessment: "Tidak ada tugas aktif",
  },
  ipa: {
    teacher: "Bpk. Bambang Sutrisno, M.Si.",
    schedule: "Rabu & Jumat | 09.30 – 11.00 WIB",
    modules: "7/10",
    progress: 70,
    assessment: "1 Kuis CBT Terjadwal",
  },
  "bahasa-indonesia": {
    teacher: "Ibu Ratna Dewi, S.Pd.",
    schedule: "Senin & Kamis | 10.00 – 11.30 WIB",
    modules: "9/10",
    progress: 90,
    assessment: "1 Tugas Portofolio",
  },
  "bahasa-inggris": {
    teacher: "Bpk. Michael Tan, S.Pd.",
    schedule: "Selasa & Jumat | 08.00 – 09.30 WIB",
    modules: "6/10",
    progress: 60,
    assessment: "1 Tugas Listening",
  },
  ppkn: {
    teacher: "Bpk. Ahmad Wahyudi, S.Pd.",
    schedule: "Kamis | 13.00 – 14.30 WIB",
    modules: "6/7",
    progress: 85,
    assessment: "Selesai Semua",
  },
};

function SubjectCard({
  subject,
}: {
  subject: (typeof subjects)[number];
}) {
  const detail = subjectCardDetails[subject.id];

  if (!detail) return null;

  return (
    <Card className="es-mapel-card">
      <h2>{subject.name}</h2>

      <div className="es-mapel-info">
        <p>
          <Solar name="user-rounded" />
          <span>{detail.teacher}</span>
        </p>

        <p>
          <Solar name="clock-circle" />
          <span>{detail.schedule}</span>
        </p>
      </div>

      <div className="es-mapel-progress">
        <div className="es-mapel-progress-label">
          <span>Progres Belajar ({detail.modules} Modul)</span>
          <strong>{detail.progress}%</strong>
        </div>

        <div
          className="es-mapel-progress-track"
          role="progressbar"
          aria-label={`Progres belajar ${subject.name}`}
          aria-valuenow={detail.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div style={{ width: `${detail.progress}%` }} />
        </div>
      </div>

      <div className="es-mapel-assessment">
        <Solar name="document-add" />

        <div>
          <span>STATUS ASESMEN</span>
          <p>{detail.assessment}</p>
        </div>
      </div>

      <ButtonLink
        href={`${base}/${subject.id}`}
        className="es-mapel-button"
      >
        Buka Mata Pelajaran
        <Solar name="arrow-right" />
      </ButtonLink>
    </Card>
  );
}
export function Dashboard() {
  return (
    <div className="es-dashboard">
      <Card className="es-student-heading">
      <div className="es-student-heading-copy">
        <h1>Halo, Andi Pratama!</h1>

        <div className="es-student-info">
          <div>
            <Solar name="user-id" />
            <p>
              NISN: <strong>0098471204</strong>
            </p>
          </div>

          <div>
            <Solar name="square-academic-cap" />
            <p>
              Kelas: <strong>VIII B</strong>
            </p>
          </div>

          <div>
            <Solar name="user-rounded" />
            <p>
              Wali Kelas: <strong>Ibu Rina Marlina, M.Pd.</strong>
            </p>
          </div>
        </div>
      </div>

  <div className="es-student-heading-badges">
    <span className="es-student-status">
      <Solar name="check-circle" />
      Siswa Aktif
    </span>

    <span className="es-student-year">
      <Solar name="calendar" />
      Tahun Ajaran 2026/2027
    </span>
  </div>
</Card>
     <div className="es-hero es-exam-banner">
        <div className="es-exam-date">
          <span>HARI INI</span>
          <strong>14 Okt</strong>
          <small>10:00 WIB</small>
        </div>

        <div className="es-exam-copy">
          <h2>Ujian Tengah Semester Matematika</h2>
          <p>
            Pastikan koneksi internet stabil dan masuk ruang ujian
            10 menit sebelum mulai.
          </p>
        </div>

        <ButtonLink
          href="/siswa/mata-pelajaran/matematika/kuis/1"
          variant="secondary"
          className="es-exam-button"
        >
          Mulai Ujian Sekarang
        </ButtonLink>
      </div>
     <Card
        className="es-semester-progress"
        title="Progres Belajar Semester Ganjil"
        subtitle="Pantau target pencapaian Capaian Pembelajaran"
      >
        <div
          className="es-semester-progress-track"
          role="progressbar"
          aria-label="Progres belajar semester ganjil"
          aria-valuenow={70}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="es-semester-progress-fill"
            style={{ width: "70%" }}
          />

          <span
            className="es-semester-progress-value"
            style={{ left: "70%" }}
          >
            70%
          </span>
        </div>

        <div className="es-semester-stats">
          {[
            {
              value: "28",
              label: "Tugas Tuntas",
              icon: "medal-ribbons-star",
              tone: "green",
            },
            {
              value: "8",
              label: "Tugas Berjalan",
              icon: "clipboard-text",
              tone: "amber",
            },
            {
              value: "28",
              label: "Modul Tuntas",
              icon: "book",
              tone: "blue",
            },
            {
              value: "8",
              label: "Modul Berjalan",
              icon: "refresh",
              tone: "blue",
            },
            {
              value: "88.4",
              label: "Rata-rata Nilai",
              icon: "medal-star",
              tone: "amber",
            },
          ].map((item) => (
            <div className="es-semester-stat" key={item.label}>
              <span
                className={`es-semester-stat-icon es-semester-icon-${item.tone}`}
              >
                <Solar name={item.icon} />
              </span>

              <div className="es-semester-stat-copy">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div className="es-columns es-dashboard-columns">
        <div className="es-stack">
          <Card
            className="es-current-subjects"
            title="Mata Pelajaran Sedang Dipelajari"
            subtitle="Lanjutkan materi dan tuntaskan asesmen formatif"
            action={
              <Link
                className="es-current-subjects-link"
                href="/siswa/mata-pelajaran"
              >
                Lihat Semua 10 Mapel
                <Solar name="alt-arrow-right" />
              </Link>
            }
          >
            <div className="es-current-subjects-list">
              <article className="es-current-subject">
                <div className="es-current-subject-label">
                  <span className="es-current-subject-icon">
                    <Solar name="calculator" />
                  </span>
                  <span className="es-current-subject-badge">
                    Matematika
                  </span>
                </div>

                <div className="es-current-subject-copy">
                  <h3>Matematika Kelas 8</h3>
                  <p>Bab 3: Teorema Pythagoras &amp; Tripel Pythagoras</p>
                </div>

                <div className="es-current-subject-next">
                  <Solar name="arrow-right" />
                  <p>
                    Selanjutnya: <strong>Kuis 3.2 (Segitiga Siku-Siku)</strong>
                  </p>
                </div>

                <ButtonLink
                  href="/siswa/mata-pelajaran/matematika"
                  className="es-current-subject-button"
                >
                  Buka Modul Matematika
                  <Solar name="arrow-right" />
                </ButtonLink>
              </article>

              <article className="es-current-subject">
                <div className="es-current-subject-label">
                  <span className="es-current-subject-icon">
                    <Solar name="dna" />
                  </span>
                  <span className="es-current-subject-badge">
                    Sains / IPA Terpadu
                  </span>
                </div>

                <div className="es-current-subject-copy">
                  <h3>IPA Terpadu Kelas 8</h3>
                  <p>Bab 4: Sistem Peredaran Darah Manusia</p>
                </div>

                <div className="es-current-subject-next">
                  <Solar name="arrow-right" />
                  <p>
                    Selanjutnya: <strong>Video Praktikum Denyut Nadi</strong>
                  </p>
                </div>

                <ButtonLink
                  href="/siswa/mata-pelajaran/ipa"
                  className="es-current-subject-button"
                >
                  Buka Modul IPA
                  <Solar name="arrow-right" />
                </ButtonLink>
              </article>
            </div>
          </Card>
          <Card
            title="Materi Baru Ditambahkan"
            subtitle="Bahan ajar dan modul PDF dari guru mata pelajaran"
            className="es-new-material"
          >
            <div className="es-new-material-row">
              <span className="es-pdf-icon">
                <Solar name="file-text" />
              </span>

              <div className="es-new-material-copy">
                <h3>Bab 3: Sistem Persamaan Linear - Matematika</h3>
                <p>Diunggah kemarin • PDF (2.4 MB)</p>
              </div>

              <ButtonLink
                href="/siswa/mata-pelajaran/matematika/materi/3"
                variant="outline"
                className="es-open-module"
              >
                Buka Modul
              </ButtonLink>
            </div>
          </Card>
        </div>
        <div className="es-stack">
          <Card
            title="Asesmen & Tugas Aktif"
            className="es-active-assessments"
            action={
              <span className="es-assessments-count">
                2 PERLU DIKERJAKAN
              </span>
            }
          >
            <div className="es-assessments-list">
              {/* Kartu kuis */}
              <article className="es-assessment-item">
                <div className="es-assessment-type-row">
                  <span className="es-assessment-type es-assessment-type-quiz">
                    Kuis
                  </span>
                </div>

                <div className="es-assessment-copy">
                  <h3>Kuis Aljabar Linear</h3>
                  <p>Matematika Kelas 8</p>
                </div>

                <div className="es-assessment-footer">
                  <span className="es-assessment-deadline es-assessment-urgent">
                    <Solar name="clock-circle" />
                    <span>Hari ini, 23:59 WIB</span>
                  </span>

                  <ButtonLink
                    href="/siswa/mata-pelajaran/matematika/kuis/1"
                    className="es-assessment-action"
                  >
                    Kerjakan Kuis
                  </ButtonLink>
                </div>
              </article>

              {/* Kartu tugas */}
              <article className="es-assessment-item">
                <div className="es-assessment-type-row">
                  <span className="es-assessment-type es-assessment-type-task">
                    TUGAS
                  </span>
                </div>

                <div className="es-assessment-copy">
                  <h3>Tugas Menulis Esai Deskriptif</h3>
                  <p>Bahasa Indonesia</p>
                </div>

                <div className="es-assessment-footer">
                  <span className="es-assessment-deadline">
                    <Solar name="upload" />
                    <span>Besok, 12:00 WIB</span>
                  </span>

                  <ButtonLink
                    href="/siswa/mata-pelajaran/bahasa-indonesia/tugas/1"
                    className="es-assessment-action"
                  >
                    Unggah Berkas
                  </ButtonLink>
                </div>
              </article>
            </div>
          </Card>
          <Card
          title="Jadwal Hari Ini"
          className="es-today-schedule"
          action={
            <span className="es-schedule-date">
              Senin, 14 Okt 2026
            </span>
          }
        >
          <div className="es-schedule-timeline">
            {/* Jadwal berlangsung */}
            <article className="es-schedule-item">
              <span className="es-schedule-dot es-schedule-dot-active" />

              <div className="es-schedule-top">
                <span className="es-schedule-time es-schedule-time-active">
                  09:15 – 10:45 WIB
                </span>

                <span className="es-schedule-status es-schedule-status-active">
                  Berlangsung
                </span>
              </div>

              <h3>IPA Terpadu</h3>
              <p>Laboratorium IPA 2</p>
            </article>

            {/* Jadwal selesai */}
            <article className="es-schedule-item">
              <span className="es-schedule-dot es-schedule-dot-finished" />

              <div className="es-schedule-top">
                <span className="es-schedule-time">
                  07:30 – 09:00 WIB
                </span>

                <span className="es-schedule-status es-schedule-status-finished">
                  Selesai
                </span>
              </div>

              <h3>Matematika</h3>
              <p>Ruang Kelas 8A</p>
            </article>
          </div>
        </Card>
        </div>
      </div>
     </div>
  );
}

export function Subjects() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("highest");

  const filtered = subjects
  .filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  )
  .sort((a, b) => {
    const progressA =
      subjectCardDetails[a.id]?.progress ?? a.progress;
    const progressB =
      subjectCardDetails[b.id]?.progress ?? b.progress;

    if (sort === "lowest") return progressA - progressB;
    if (sort === "name") return a.name.localeCompare(b.name);

    return progressB - progressA;
  });
  return (
    <>
      <Card className="es-subjects-heading">
        <div>
          <h1>Mata Pelajaran Tersedia</h1>

          <div className="es-subjects-heading-info">
            <div>
              <Solar name="document-text" />
              <span>Semester 1</span>
            </div>

            <div>
              <Solar name="square-academic-cap" />
              <span>
                Kelas: <strong>VIII B</strong>
              </span>
            </div>
          </div>
        </div>

        <span className="es-subjects-heading-count">
          <Solar name="book-bookmark" />
          10 Mata Pelajaran Terdaftar
        </span>
      </Card>
      <div className="es-subjects-summary">
        {[
          {
            label: "TOTAL MAPEL TERDAFTAR",
            value: "10 Mapel",
            icon: "book",
          },
          {
            label: "RATA-RATA PROGRES BELAJAR",
            value: "74.8%",
            icon: "book-bookmark",
            hint: "Total 48 dari 64 modul selesai",
          },
          {
            label: "TUGAS & ASESMEN MENUNGGU",
            value: "5 Tugas Aktif",
            icon: "clipboard-text",
            hint: "Perlu dikerjakan pekan ini",
            tone: "orange",
          },
          {
            label: "RATA-RATA NILAI FORMATIF",
            value: "88.2",
            suffix: "/ 100",
            icon: "medal-star",
            hint: "Di atas ambang batas KKM",
            tone: "green",
          },
        ].map((item) => (
          <Card className="es-subject-stat-card" key={item.label}>
            <div className="es-subject-stat-top">
              <span className="es-subject-stat-icon">
                <Solar name={item.icon} />
              </span>

              <span className="es-subject-stat-label">
                {item.label}
              </span>
            </div>

            <div className="es-subject-stat-number">
              <strong>{item.value}</strong>
              {item.suffix && <span>{item.suffix}</span>}
            </div>

            {item.hint && (
              <p
                className={`es-subject-stat-hint ${
                  item.tone ? `es-subject-hint-${item.tone}` : ""
                }`}
              >
                {item.hint}
              </p>
            )}
          </Card>
        ))}
      </div>
      <div className="es-toolbar es-subjects-toolbar">
      <label className="es-search es-subjects-search">
        <Solar name="magnifier" />
        <input
          aria-label="Cari mata pelajaran"
          placeholder="Cari Mata Pelajaran..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>

      <div className="es-subjects-toolbar-actions">
        <div className="es-subjects-sort">
          <select
            aria-label="Urutkan mata pelajaran"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="highest">Progres Tertinggi</option>
            <option value="lowest">Progres Terendah</option>
            <option value="name">Nama A–Z</option>
          </select>

          <Solar name="alt-arrow-down" />
        </div>

        <div className="es-subjects-view">
          <button
            type="button"
            className={view === "grid" ? "is-selected" : ""}
            aria-label="Tampilan kartu"
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
          >
            <Solar name="widget-2" />
          </button>

          <button
            type="button"
            className={view === "list" ? "is-selected" : ""}
            aria-label="Tampilan daftar"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <Solar name="list" />
          </button>
        </div>
      </div>
  </div>
      <div className={view === "grid" ? "es-course-grid" : "es-stack"}>
        {filtered.map((s) => (
          <SubjectCard subject={s} key={s.id} />
        ))}
      </div>
      {filtered.length > 0 && (
      <nav className="es-mapel-pagination" aria-label="Halaman mata pelajaran">
        <span>Halaman 1 dari 2</span>

        <div className="es-mapel-pagination-buttons">
          <button type="button" disabled aria-label="Halaman pertama">
            <Solar name="double-alt-arrow-left" />
          </button>

          <button type="button" disabled aria-label="Halaman sebelumnya">
            <Solar name="alt-arrow-left" />
          </button>

          <button type="button" className="is-active" aria-current="page">
            1
          </button>

          <button type="button" disabled aria-label="Halaman 2 belum tersedia">
            2
          </button>

          <button type="button" disabled aria-label="Halaman berikutnya">
            <Solar name="alt-arrow-right" />
          </button>

          <button type="button" disabled aria-label="Halaman terakhir">
            <Solar name="double-alt-arrow-right" />
          </button>
        </div>
  </nav>
)}
      {!filtered.length && (
        <Card>
          <p>Tidak ada mata pelajaran yang sesuai pencarian.</p>
        </Card>
      )}
    </>
  );
}
export function SubjectDetail() {
  const params = useParams();
  const subject = subjects.find((s) => s.id === params.subject) || subjects[0];
  const query = useSearchParams();
  const [tab, setTab] = useState(query.get("tab") || "ringkasan");
  const [search, setSearch] = useState("");
  const [materialSemester, setMaterialSemester] = useState("1");
  const [materialView, setMaterialView] = useState("grid");
  const [assessmentSemester, setAssessmentSemester] = useState("1");
  const [assessmentView, setAssessmentView] = useState("grid");
  const b = `${base}/${subject.id}`;
  const materialItems = [
  {
    id: 1,
    category: "MODUL 01 • BERPIKIR KOMPUTASIONAL (BAB 1)",
    title: "Pengenalan Algoritma dalam Kehidupan Sehari-hari",
    release: "22 Sep 2026",
    completed: "24 Sep 2026",
    attachment: "1 Berkas PDF (3.5 MB)",
    status: "done",
  },
  {
    id: 2,
    category: "MODUL 02 • BERPIKIR KOMPUTASIONAL (BAB 2)",
    title: "Lembar Kerja Praktikum Konversi Bilangan Biner ke Desimal",
    release: "02 Okt 2026",
    completed: "04 Okt 2026",
    status: "done",
  },
  {
    id: 3,
    category: "MODUL 03 • JARINGAN KOMPUTER & INTERNET (BAB 3)",
    title: "Algoritma, Pemrograman Dasar & Struktur Percabangan",
    release: "11 Okt 2026",
    completed: "14 Okt 2026",
    status: "done",
  },
  {
    id: 4,
    category: "MODUL 04 • JARINGAN KOMPUTER & INTERNET (BAB 4)",
    title: "Perangkat Keras Jaringan Komputer",
    release: "18 Okt 2026",
    lastRead: "Hari ini, 08:15 WIB",
    status: "active",
  },
  {
    id: 5,
    category: "MODUL 05 • ALGORITMA & PEMROGRAMAN VISUAL (BAB 5)",
    title: "Pengantar Logika Percabangan (If-Else)",
    release: "Menunggu Sesi Kelas (08 Nov 2026)",
    status: "locked",
  },
  {
    id: 6,
    category: "MODUL 06 • ALGORITMA & PEMROGRAMAN VISUAL (BAB 5)",
    title: "Struktur Perulangan (Looping) & Proyek Animasi Sederhana",
    release: "Menunggu Sesi Kelas (15 Nov 2026)",
    status: "locked",
  },
];
  return (
    <>
      <Card className="es-subject-detail-heading">
        <div className="es-subject-detail-heading-copy">
          <h1>{subject.name} Kelas VIII</h1>
          <p>
            Modul pembelajaran berpikir komputasional, jaringan komputer
            &amp; internet, analisis data, dan algoritma.
          </p>
        </div>

        <ButtonLink
          variant="outline"
          href={base}
          className="es-subject-detail-back"
        >
          <Solar name="arrow-left" />
          Kembali ke Mata Pelajaran
        </ButtonLink>
      </Card>
     {tab === "ringkasan" ? (
  <div className="es-detail-summary">
    {[
      {
        label: "GURU PENGAMPU",
        icon: "user-rounded",
        value: "Hendra",
        secondLine: "Gunawan, S.Kom.",
        hint: "NIP: 198204122008011003",
      },
      {
        label: "RUANG & KELAS",
        icon: "home-2",
        value: "8B",
        secondLine: "Lab Komputer 1",
        hint: "Kapasitas: 32 Siswa",
      },
      {
        label: "JADWAL SESI",
        icon: "calendar",
        value: "Senin & Rabu",
        hint: "07:30 – 09:00 WIB",
      },
      {
        label: "KRITERIA KETUNTASAN",
        icon: "clipboard-check",
        value: "75.0",
        suffix: "/ 100",
        hint: "Skala 0 – 100",
      },
    ].map((item) => (
      <Card className="es-detail-stat" key={item.label}>
        <div className="es-detail-stat-top">
          <span className="es-detail-stat-icon">
            <Solar name={item.icon} />
          </span>

          <span className="es-detail-stat-label">
            {item.label}
          </span>
        </div>

        <div className="es-detail-stat-value">
          <strong>
            {item.value}
            {item.secondLine && (
              <>
                <br />
                {item.secondLine}
              </>
            )}
          </strong>

          {item.suffix && <span>{item.suffix}</span>}
        </div>

        <p className="es-detail-stat-hint">{item.hint}</p>
      </Card>
    ))}
  </div>
) : (
  tab === "materi" ? (
  <div className="es-material-summary">
    {[
      {
        label: "PROGRES MATERI",
        value: "4 dari 6 Modul",
        secondLine: "Selesai",
        icon: "book-2",
        hint: "2 Modul Tersisa",
      },
      {
        label: "DISELESAIKAN",
        value: "3 Modul",
        icon: "check-circle",
        hint: "Tuntas Terverifikasi",
      },
      {
        label: "SEDANG AKTIF",
        value: "1 Modul",
        icon: "document",
        hint: "Modul 04",
      },
      {
        label: "BELUM DIBUKA",
        value: "2 Modul",
        icon: "lock-keyhole",
        hint: "Terkunci",
      },
    ].map((item) => (
      <Card className="es-material-stat" key={item.label}>
        <div className="es-material-stat-top">
          <span className="es-material-stat-icon">
            <Solar name={item.icon} />
          </span>

          <span className="es-material-stat-label">
            {item.label}
          </span>
        </div>

        <strong className="es-material-stat-value">
          {item.value}
          {item.secondLine && (
            <>
              <br />
              {item.secondLine}
            </>
          )}
        </strong>

        <p className="es-material-stat-hint">{item.hint}</p>
      </Card>
    ))}
  </div>
) : (
  <div className="es-assessment-summary">
  {[
    {
      label: "TUGAS & ASESMEN MENUNGGU",
      value: "2 Tugas Aktif",
      icon: "clipboard-text",
      hint: "Perlu dikerjakan pekan ini",
      tone: "orange",
    },
    {
      label: "RATA-RATA NILAI FORMATIF",
      value: "90",
      suffix: "/ 100",
      icon: "medal-star",
      hint: "Di atas ambang batas KKM",
      tone: "green",
    },
    {
      label: "DISIPLIN WAKTU",
      value: "5",
      icon: "clock-circle",
      hint: "5 Tugas On-Time berturut-turut",
      tone: "neutral",
    },
  ].map((item) => (
    <Card className="es-assessment-stat" key={item.label}>
      <div className="es-assessment-stat-top">
        <span className="es-assessment-stat-icon">
          <Solar name={item.icon} />
        </span>

        <span className="es-assessment-stat-label">
          {item.label}
        </span>
      </div>

      <div className="es-assessment-stat-value">
        <strong>{item.value}</strong>
        {item.suffix && <span>{item.suffix}</span>}
      </div>

      <p
        className={`es-assessment-stat-hint es-assessment-stat-hint-${item.tone}`}
      >
        {item.hint}
      </p>
    </Card>
  ))}
</div>
)
)}
      <div
        className="es-tabs"
        role="tablist"
        aria-label="Bagian mata pelajaran"
      >
        {[
          ["ringkasan", "Ringkasan Mapel"],
          ["materi", "Daftar Materi"],
          ["asesmen", "Daftar Tugas & Asesmen"],
        ].map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => {
              setTab(id);
              setSearch("");
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "ringkasan" ? (
        <div className="es-columns">
          <div className="es-stack">
           <Card className="es-detail-learning-progress">
            <div className="es-detail-learning-copy">
              <h2>Progres Belajar {subject.name}</h2>
              <p>Tuntas 6 dari total 10 modul pembelajaran semester ini.</p>
            </div>

            <div className="es-detail-learning-meter">
              <div
                className="es-detail-learning-track"
                role="progressbar"
                aria-label={`Progres belajar ${subject.name}`}
                aria-valuenow={65}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div style={{ width: "65%" }} />
              </div>

              <strong>65%</strong>
            </div>
          </Card>
            <Card
              className="es-current-module"
              title="Materi yang Sedang Dipelajari"
              subtitle="Fokus sesi aktif minggu ini"
            >
              <div className="es-current-module-copy">
                <span className="es-current-module-badge">MODUL 04</span>

                <h3>
                  Perangkat Keras Jaringan Komputer &amp; Subnetting Sederhana
                </h3>

                <p>
                  Materi ini membahas fungsi switch, router, kabel UTP, access
                  point, topologi LAN/WLAN serta pengenalan dasar pengalamatan
                  IPv4 untuk jaringan sekolah lokal.
                </p>
              </div>

              <div className="es-module-attachments">
                <h4>BERKAS LAMPIRAN &amp; BAHAN AJAR</h4>

                <div className="es-module-files">
                  <div className="es-module-file">
                    <span className="es-module-file-icon es-module-file-pdf">
                      <Solar name="file-text" />
                    </span>

                    <div className="es-module-file-copy">
                      <strong>Modul_Jaringan_Komputer.pdf</strong>
                      <span>1.4 MB</span>
                    </div>

                    <a
                      href="/siswa-demo/Modul_Jaringan_Komputer.pdf"
                      download
                      aria-label="Unduh Modul Jaringan Komputer"
                    >
                      <Solar name="download" />
                    </a>
                  </div>

                  <div className="es-module-file">
                    <span className="es-module-file-icon es-module-file-slide">
                      <Solar name="document-text" />
                    </span>

                    <div className="es-module-file-copy">
                      <strong>Slide_Topologi_dan_Perangkat.pptx</strong>
                      <span>3.8 MB</span>
                    </div>

                    <a
                      href="/siswa-demo/Slide_Topologi_dan_Perangkat.pptx"
                      download
                      aria-label="Unduh Slide Topologi dan Perangkat"
                    >
                      <Solar name="download" />
                    </a>
                  </div>
                </div>
              </div>

              <ButtonLink
                href={`${b}/materi/4`}
                className="es-current-module-button"
              >
                Lanjutkan Belajar Modul 04
                <Solar name="arrow-right" />
              </ButtonLink>
            </Card>
            <Card
            className="es-subject-syllabus"
            title="Silabus Pembelajaran"
            subtitle="Alur pencapaian target kompetensi"
          >
            <div className="es-syllabus-list">
              {[
                {
                  title: "Bab 01: Berpikir Komputasional (BK)",
                  description: "Dekomposisi, Pengenalan Pola, dan Abstraksi Masalah",
                  status: "done",
                },
                {
                  title: "Bab 02: Bilangan Biner & Konversi Desimal",
                  description: "Representasi Data Biner, Heksadesimal, dan Logika Gerbang",
                  status: "done",
                },
                {
                  title: "Bab 03: Arsitektur Internet & Protokol TCP/IP",
                  description: "Model OSI, Alur Pengiriman Paket Data & Domain Name System",
                  status: "done",
                },
                {
                  title: "Bab 04: Jaringan Komputer & Internet",
                  description: "Topologi LAN/WLAN, Subnet Mask & Konfigurasi Router",
                  status: "active",
                },
                {
                  title: "Bab 05: Algoritma & Pemrograman Visual (Blockly)",
                  description: "Percabangan Logika, Perulangan Loop & Variabel Pemrograman",
                  status: "locked",
                },
              ].map((item, index) => {
                const content = (
                  <>
                    <div className="es-syllabus-copy">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>

                    {item.status === "done" ? (
                      <span className="es-syllabus-status es-syllabus-status-done">
                        TUNTAS
                      </span>
                    ) : item.status === "active" ? (
                      <span className="es-syllabus-status es-syllabus-status-active">
                        PROSES EVALUASI
                      </span>
                    ) : (
                      <span className="es-syllabus-locked-label">
                        <Solar name="lock-keyhole" />
                        Terkunci
                      </span>
                    )}
                  </>
                );

                return (
                  <div
                    className={`es-syllabus-item es-syllabus-item-${item.status}`}
                    key={item.title}
                  >
                    <span className="es-syllabus-marker">
                      {item.status === "done" ? (
                        <Solar name="check-circle" />
                      ) : item.status === "locked" ? (
                        <Solar name="lock-keyhole" />
                      ) : (
                        <span className="es-syllabus-active-dot" />
                      )}
                    </span>

                    {item.status === "locked" ? (
                      <div
                        className="es-syllabus-chapter"
                        aria-disabled="true"
                      >
                        {content}
                      </div>
                    ) : (
                      <Link
                        href={`${b}/materi/${index + 1}`}
                        className="es-syllabus-chapter"
                      >
                        {content}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
          </div>
          <div className="es-stack">
            <Card
              className="es-upcoming-assessment"
              title="Tugas & Asesmen Mendatang"
            >
              <div className="es-upcoming-task">
                <span className="es-upcoming-task-badge">
                  <Solar name="info-circle" />
                  Sisa 2 Hari Lagi
                </span>

                <div className="es-upcoming-task-copy">
                  <h3>
                    Tugas 01: Pembuatan ERD Database Sistem Klinik Sederhana
                  </h3>

                  <p>
                    Rancang skema ERD entitas pasien, dokter, dan rekam medis
                    beserta kardinalitas relasinya sesuai panduan LKPD.
                  </p>
                </div>

                <div className="es-upcoming-task-deadline">
                  <Solar name="clock-circle" />
                  <span>25 Oktober 2026, 23:59 WIB</span>
                </div>

                <ButtonLink
                  href={`${b}/tugas/1`}
                  className="es-upcoming-task-button"
                >
                  Buka Halaman Tugas
                  <Solar name="arrow-right" />
                </ButtonLink>
              </div>
            </Card>
            <Card
            className="es-learning-statistics"
            title={`Statistik Belajar ${subject.name}`}
          >
            <div className="es-learning-score">
              <div className="es-learning-score-top">
                <span>RATA-RATA NILAI FORMATIF</span>
                <span className="es-learning-score-badge">TUNTAS</span>
              </div>

              <div className="es-learning-score-value">
                <strong>90.0</strong>
                <span>/ 100</span>
              </div>
            </div>

            <div className="es-learning-score-details">
              {[
                { label: "Nilai Rata-rata Kuis", value: "92" },
                { label: "Nilai Tugas Mandiri", value: "88" },
                { label: "Nilai LKPD Praktikum", value: "90" },
              ].map((item) => (
                <div className="es-learning-score-row" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </Card>
          </div>
        </div>
      ) : (
        <>
          {tab === "materi" ? (
            <div className="es-material-toolbar">
              <div className="es-material-semesters">
                <button
                  type="button"
                  className={materialSemester === "1" ? "is-selected" : ""}
                  aria-pressed={materialSemester === "1"}
                  onClick={() => setMaterialSemester("1")}
                >
                  Semester 1 (Ganjil)
                </button>

                <button
                  type="button"
                  className={materialSemester === "2" ? "is-selected" : ""}
                  aria-pressed={materialSemester === "2"}
                  onClick={() => setMaterialSemester("2")}
                >
                  Semester 2 (Genap)
                </button>
              </div>

              <label className="es-material-search">
                <Solar name="magnifier" />
                <input
                  aria-label="Cari nama modul"
                  placeholder="Cari nama modul..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>

              <div className="es-material-toolbar-actions">
                <div className="es-material-category">
                  <select aria-label="Kategori modul">
                    <option value="all">Semua Kategori</option>
                  </select>
                  <Solar name="alt-arrow-down" />
                </div>

                <div className="es-material-view">
                  <button
                    type="button"
                    className={materialView === "grid" ? "is-selected" : ""}
                    aria-label="Tampilan kartu"
                    aria-pressed={materialView === "grid"}
                    onClick={() => setMaterialView("grid")}
                  >
                    <Solar name="widget-2" />
                  </button>

                  <button
                    type="button"
                    className={materialView === "list" ? "is-selected" : ""}
                    aria-label="Tampilan daftar"
                    aria-pressed={materialView === "list"}
                    onClick={() => setMaterialView("list")}
                  >
                    <Solar name="list" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="es-material-toolbar">
            <div className="es-material-semesters">
              <button
                type="button"
                className={assessmentSemester === "1" ? "is-selected" : ""}
                aria-pressed={assessmentSemester === "1"}
                onClick={() => setAssessmentSemester("1")}
              >
                Semester 1 (Ganjil)
              </button>

              <button
                type="button"
                className={assessmentSemester === "2" ? "is-selected" : ""}
                aria-pressed={assessmentSemester === "2"}
                onClick={() => setAssessmentSemester("2")}
              >
                Semester 2 (Genap)
              </button>
            </div>

            <label className="es-material-search">
              <Solar name="magnifier" />

              <input
                aria-label="Cari nama tugas dan asesmen"
                placeholder="Cari nama tugas & asesmen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>

            <div className="es-material-toolbar-actions">
              <div className="es-material-category">
                <select aria-label="Kategori tugas dan asesmen">
                  <option value="all">Semua Kategori</option>
                </select>

                <Solar name="alt-arrow-down" />
              </div>

              <div className="es-material-view">
                <button
                  type="button"
                  className={assessmentView === "grid" ? "is-selected" : ""}
                  aria-label="Tampilan kartu"
                  aria-pressed={assessmentView === "grid"}
                  onClick={() => setAssessmentView("grid")}
                >
                  <Solar name="widget-2" />
                </button>

                <button
                  type="button"
                  className={assessmentView === "list" ? "is-selected" : ""}
                  aria-label="Tampilan daftar"
                  aria-pressed={assessmentView === "list"}
                  onClick={() => setAssessmentView("list")}
                >
                  <Solar name="list" />
                </button>
              </div>
            </div>
          </div>
          )}

          {tab === "materi" ? (
            <div className="es-material-list">
            {materialItems
              .filter((item) =>
                item.title.toLowerCase().includes(search.toLowerCase()),
              )
              .map((item) => (
                <Card
                  key={item.id}
                  className={`es-material-item es-material-item-${item.status}`}
                >
                  <span className="es-material-item-icon">
                    <Solar
                      name={
                        item.status === "done"
                          ? "check-read"
                          : item.status === "active"
                            ? "play"
                            : "lock-keyhole"
                      }
                    />
                  </span>

                  <div className="es-material-item-copy">
                    <p className="es-material-item-category">
                      {item.category}
                    </p>

                    <h3>{item.title}</h3>

                    <div className="es-material-item-meta">
                      <span>
                        <Solar name="calendar" />
                        Rilis: {item.release}
                      </span>

                      {item.completed && (
                        <span className="es-material-item-completed">
                          <Solar name="check-circle" />
                          Diselesaikan: {item.completed}
                        </span>
                      )}

                      {item.lastRead && (
                        <span className="es-material-item-read">
                          <Solar name="eye" />
                          Terakhir Dibaca: {item.lastRead}
                        </span>
                      )}

                      {item.attachment && (
                        <span>
                          <Solar name="file-text" />
                          {item.attachment}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.status === "locked" ? (
                    <button
                      type="button"
                      className="es-material-item-locked-button"
                      disabled
                    >
                      <Solar name="lock-keyhole" />
                      Terkunci
                    </button>
                  ) : (
                    <ButtonLink
                      href={`${b}/materi/${item.id}`}
                      variant={item.status === "active" ? "primary" : "outline"}
                      className="es-material-item-button"
                    >
                      {item.status === "active" ? (
                        <>
                          Lihat Detail Modul
                          <Solar name="arrow-right" />
                        </>
                      ) : (
                        <>
                          <Solar name="eye" />
                          Buka Ulang Materi
                        </>
                      )}
                    </ButtonLink>
                  )}
                </Card>
              ))}

            {!materialItems.some((item) =>
              item.title.toLowerCase().includes(search.toLowerCase()),
            ) && (
              <Card>
                <p>Tidak ada modul yang sesuai pencarian.</p>
              </Card>
            )}
          </div>
          ) : (
            <div className="es-assessment-content">
            <div className="es-assessment-top-grid">
              <Card className="es-priority-task">
                <div className="es-priority-task-header">
                  <span className="es-task-pill es-task-pill-red">
                    <Solar name="info-circle" />
                    14 Jam Tersisa
                  </span>

                  <span className="es-task-pill es-task-pill-yellow">
                    Batas: 27 Okt 2026 • 23:59 WIB
                  </span>
                </div>

                <div className="es-priority-task-body">
                  <div>
                    <span className="es-task-topic">
                      Informatika • Bab 3 Algoritma, Pemrograman Dasar
                      &amp; Struktur Percabangan
                    </span>

                    <h2>
                      Latihan Mandiri : Membuat Pemrograman Dasar
                      &amp; Struktur Percabangan
                    </h2>

                    <p className="es-priority-task-description">
                      Kerjakan 5 butir soal uraian pada lembar folio bergaris,
                      sertakan langkah eliminasi lengkap, lalu foto/pindai
                      menjadi 1 berkas PDF rapi sebelum batas waktu penutupan portal.
                    </p>
                  </div>

                  <div className="es-priority-task-footer">
                    <div className="es-task-info-grid">
                      <div className="es-task-info-box">
                        <span className="es-task-info-icon">
                          <Solar name="file-text" />
                        </span>

                        <div>
                          <span>Format Berkas</span>
                          <p>
                            <strong>PDF / JPG</strong>
                            <small> (Maks 10 MB)</small>
                          </p>
                        </div>
                      </div>

                      <div className="es-task-info-box es-task-info-status">
                        <span className="es-task-info-icon">
                          <Solar name="info-circle" />
                        </span>

                        <div>
                          <span>Status Pengumpulan</span>
                          <p>Belum Mengumpulkan</p>
                        </div>
                      </div>
                    </div>

                    <ButtonLink
                      href={`${b}/tugas/1`}
                      className="es-task-primary-button"
                    >
                      Kerjakan Tugas
                      <Solar name="arrow-right" />
                    </ButtonLink>
                  </div>
                </div>
              </Card>

              <Card className="es-week-deadlines">
                <div className="es-week-deadlines-heading">
                  <h2>Tenggat Pekan Ini</h2>
                  <p>27 Okt – 01 Nov 2026</p>
                </div>

                <div className="es-week-days">
                  {[
                    { day: "SEN", date: "28", active: true, dot: "red" },
                    { day: "SEL", date: "28", dot: "blue" },
                    { day: "RAB", date: "29" },
                    { day: "KAM", date: "30", dot: "blue" },
                    { day: "JUM", date: "31", dot: "blue" },
                  ].map((item) => (
                    <div
                      className={`es-week-day ${item.active ? "is-active" : ""}`}
                      key={item.day}
                    >
                      <span>{item.day}</span>
                      <strong>{item.date}</strong>
                      {item.dot && (
                        <span className={`es-week-dot es-week-dot-${item.dot}`} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="es-week-events">
                  {[
                    {
                      time: "Hari Ini, 23:59 WIB",
                      subject: "Informatika",
                      title:
                        "Latihan Mandiri : Membuat Pemrograman Dasar & Struktur Percabangan",
                      urgent: true,
                    },
                    {
                      time: "Selasa, 14:00 WIB",
                      subject: "IPA Terpadu",
                      title: "IPA: Laporan Praktikum Darah & Rhesus",
                    },
                    {
                      time: "Kamis, 23:59 WIB",
                      subject: "B. Inggris",
                      title: "B. Inggris: Kuis CBT Reading Recount",
                    },
                  ].map((item) => (
                    <div
                      className={`es-week-event ${item.urgent ? "is-urgent" : ""}`}
                      key={item.title}
                    >
                      <div className="es-week-event-top">
                        <span>{item.time}</span>
                        <span className="es-week-event-subject">
                          {item.subject}
                        </span>
                      </div>

                      <h3>{item.title}</h3>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="es-assessment-row-list">
              {[
                {
                  id: "task-1",
                  status: "pending",
                  badge: "Perlu Dikerjakan • Tenggat 4 Hari Lagi",
                  metaLabel: "Tenggat Waktu:",
                  metaValue: "Jumat, 31 Oktober 2026, 23:59 WIB",
                  title: "Tugas 01: Analisis Topologi Jaringan Komputer & Skema LAN",
                  topic: "Topik / Bab: Jaringan Komputer & Internet (Bab 4)",
                  button: "Kerjakan Sekarang",
                  href: `${b}/tugas/1`,
                  icon: "arrow-right",
                },
                {
                  id: "task-2",
                  status: "review",
                  badge: "Menunggu Koreksi Guru",
                  metaLabel: "Dikumpulkan pada:",
                  metaValue: "10 Okt 2026, 14:20 WIB",
                  title: "Tugas 02: Lembar Kerja Praktikum Konversi Bilangan Biner ke Desimal",
                  topic: "Topik / Bab: Berpikir Komputasional (Bab 2)",
                  button: "Lihat Berkas Terkirim",
                  icon: "folder",
                },
                {
                  id: "quiz-1",
                  status: "done",
                  badge: "STATUS SELESAI",
                  metaLabel: "Nilai Akhir:",
                  title: "Kuis Formatif Bab 1: Logika Komputasional & Dekomposisi Masalah",
                  topic: "Topik / Bab: Berpikir Komputasional (Bab 1)",
                  button: "Lihat Hasil & Pembahasan",
                  icon: "download",
                },
                {
                  id: "final-exam",
                  status: "locked",
                  badge: "Terkunci",
                  metaLabel: "Jadwal Pelaksanaan:",
                  metaValue: "08 November 2026, 08:00 WIB",
                  title: "Ulangan Akhir Semester",
                  topic: "Topik / Bab: Semua Bab",
                  button: "Terkunci – Belum Dibuka",
                  icon: "lock-keyhole",
                },
              ]
                .filter((item) =>
                  item.title.toLowerCase().includes(search.toLowerCase()),
                )
                .map((item) => (
                  <Card
                    key={item.id}
                    className={`es-assessment-row es-assessment-row-${item.status}`}
                  >
                    <div className="es-assessment-row-header">
                      <span
                        className={`es-task-pill es-task-pill-${item.status}`}
                      >
                        {item.badge}
                      </span>

                      <div className="es-assessment-row-meta">
                        <span>{item.metaLabel}</span>

                        {item.status === "done" ? (
                          <div className="es-assessment-final-score">
                            <strong>92</strong>
                            <span>/ 100</span>
                          </div>
                        ) : (
                          <strong>{item.metaValue}</strong>
                        )}
                      </div>
                    </div>

                    <div className="es-assessment-row-body">
                      <div className="es-assessment-row-copy">
                        <h3>{item.title}</h3>
                        <p>{item.topic}</p>

                        {item.status === "done" && (
                          <div className="es-assessment-quiz-details">
                            <p>Tanggal Ujian: 28 September 2026, 09:15 WIB</p>
                            <p>Status: 18 dari 20 Soal Benar</p>
                            <p>Durasi pengerjaan: 25 menit</p>
                          </div>
                        )}
                      </div>

                      {item.href ? (
                        <ButtonLink
                          href={item.href}
                          className="es-task-primary-button"
                        >
                          {item.button}
                          <Solar name={item.icon} />
                        </ButtonLink>
                      ) : (
                        <button
                          type="button"
                          className="es-task-outline-button"
                          disabled={item.status === "locked"}
                        >
                          <Solar name={item.icon} />
                          {item.button}
                        </button>
                      )}
                    </div>
                  </Card>
                ))}
            </div>
          </div>
          )}
        </>
      )}
    </>
  );
}
export function Material() {
  const params = useParams();
  const subject =
    subjects.find((s) => s.id === params.subject) || subjects[0];
  const b = `${base}/${subject.id}`;

  const [finished, setFinished] = useState(false);

  const files = [
    {
      name: "Modul_03_Algoritma_Pemrograman.pdf",
      size: "3.4 MB",
      tone: "red",
    },
    {
      name: "Slide_Presentasi_Informatika_Bab3.pptx",
      size: "5.8 MB",
      tone: "yellow",
    },
    {
      name: "Lembar_Kerja_Siswa_Mandiri_LKPD.pdf",
      size: "1.2 MB",
      tone: "blue",
    },
  ];

  return (
    <div className="es-material-detail">
      <Card className="es-material-detail-heading">
        <div className="es-material-detail-heading-top">
          <div className="es-material-detail-heading-copy">
            <h1>
              Algoritma, Pemrograman Dasar &amp; Struktur Percabangan
            </h1>

            <p>
              <Solar name="user-rounded" />
              <span>
                Guru: <strong>Bpk. Hendra Gunawan, S.Kom.</strong>
              </span>
            </p>

            <p>
              <Solar name="calendar" />
              <span>
                Rilis: <strong>14 Oktober 2026</strong>
              </span>
            </p>
          </div>

          <div className="es-material-detail-heading-actions">
            <button
              type="button"
              className="es-md-button es-md-button-primary"
              disabled={finished}
              onClick={() => setFinished(true)}
            >
              <Solar name="check-circle" />
              {finished ? "Sudah Selesai" : "Tandai Sudah Selesai"}
            </button>

            <ButtonLink
              href={`${b}?tab=materi`}
              variant="outline"
              className="es-md-button es-md-button-outline"
            >
              <Solar name="arrow-left" />
              Kembali ke Sebelumnya
            </ButtonLink>
          </div>
        </div>

        <div className="es-material-detail-resources">
          {[
            { icon: "videocamera", label: "1 Video Pembahasan" },
            { icon: "book-2", label: "1 Catatan Bacaan" },
            { icon: "link", label: "3 Berkas Lampiran" },
            { icon: "pen-new-square", label: "1 Kuis Wajib" },
          ].map((item) => (
            <div key={item.label}>
              <span>
                <Solar name={item.icon} />
              </span>
              <strong>{item.label}</strong>
            </div>
          ))}
        </div>
      </Card>

      <div className="es-material-detail-columns">
        <div className="es-material-detail-main">
          <Card className="es-md-video-card">
            <div className="es-md-section-heading">
              <h2>Video Penjelasan Logika Flowchart</h2>
              <p>Tonton untuk memahami pembelajaran</p>
            </div>

            <div className="es-md-video-preview">
              <span className="es-md-video-play">
                <Solar name="play" />
              </span>

              <p>
                Penjelasan Logika &amp; Flowchart Algoritma Pemrograman
              </p>

              <div className="es-md-video-controls">
                <div className="es-md-video-track">
                  <span />
                </div>

                <div className="es-md-video-controls-bottom">
                  <Solar name="play" />
                  <Solar name="volume-loud" />
                  <span>07:45 / 18:24</span>
                  <span className="es-md-video-quality">1080p HD</span>
                  <Solar name="settings" />
                  <Solar name="full-screen" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="es-md-reading-card">
            <div className="es-md-section-heading">
              <h2>Bahan Bacaan &amp; Catatan Belajar</h2>
            </div>

            <div className="es-md-reading-copy">
              <h3>Pengertian Algoritma dan Pemrograman</h3>
              <p>
                Dalam ilmu informatika, algoritma adalah urutan
                langkah-langkah logis dan terstruktur yang disusun
                secara sistematis untuk menyelesaikan suatu masalah
                atau menghasilkan keluaran tertentu. Setiap instruksi
                harus jelas, tidak menimbulkan makna ganda (ambigu),
                serta memiliki langkah awal dan batas akhir yang pasti.
              </p>
            </div>
          </Card>

          <Card className="es-md-files-card">
            <div className="es-md-section-heading">
              <h2>Berkas Lampiran &amp; Unduhan Belajar</h2>
              <p>Materi penunjang resmi yang disiapkan oleh pengampu</p>
            </div>

            <div className="es-md-file-list">
              {files.map((file) => (
                <div className="es-md-file" key={file.name}>
                  <span
                    className={`es-md-file-icon es-md-file-icon-${file.tone}`}
                  >
                    <Solar name="file-text" />
                  </span>

                  <div className="es-md-file-copy">
                    <strong>{file.name}</strong>
                    <span>{file.size}</span>
                  </div>

                  <a
                    href={`/siswa-demo/${file.name}`}
                    download
                    className="es-md-file-download"
                  >
                    Unduh
                  </a>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="es-material-detail-aside">
          <Card className="es-md-quiz-card">
            <h2>Kuis Pemahaman Bab 3</h2>

          <div className="es-md-quiz-info">
            <p>
              <span>
                <Solar name="clock-circle" />
                Batas Waktu:
              </span>
              <strong>20 Okt 2026, 23:59</strong>
            </p>

            <p>
              <span>
                <Solar name="target" />
                Nilai KKM Minimal:
              </span>
              <strong>75 Poin</strong>
            </p>
          </div>

            <ButtonLink
              href={`${b}/kuis/1`}
              className="es-md-quiz-button"
            >
              Mulai Kuis Sekarang
              <Solar name="arrow-right" />
            </ButtonLink>
          </Card>

          <Card className="es-md-navigation-card">
            <div className="es-md-section-heading">
              <h2>Navigasi Topik Bab</h2>
            </div>

            <Link
              href={`${b}/materi/2`}
              className="es-md-navigation-item"
            >
              <span className="es-md-navigation-direction">
                <Solar name="arrow-left" />
                Materi Sebelumnya
              </span>

              <strong>
                Bab 02:
                <br />
                Bilangan Biner &amp; Konversi Desimal
              </strong>

              <span className="es-md-navigation-done">
                <Solar name="check-read" />
                Telah Selesai
              </span>
            </Link>

            <Link
              href={`${b}/materi/4`}
              className="es-md-navigation-item"
            >
              <span className="es-md-navigation-direction es-md-navigation-next">
                Materi Selanjutnya
                <Solar name="arrow-right" />
              </span>

              <strong>
                Bab 04:
                <br />
                Jaringan Komputer &amp; Internet
              </strong>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
export function Assignment() {
  const params = useParams();
  const b = `${base}/${params.subject}`;

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState("");

  function selectFile(selected?: File) {
    if (!selected || submitted) return;

    const extension = selected.name.split(".").pop()?.toLowerCase();

    if (
      !["pdf", "png", "jpg", "jpeg"].includes(extension || "") ||
      selected.size > 5 * 1024 * 1024
    ) {
      setError("Gunakan PDF, PNG, atau JPG maksimal 5 MB.");
      return;
    }

    setFile(selected);
    setError("");
    setMessage("");
  }

  function previewFile() {
    if (!file) return;

    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener,noreferrer");

    // Memberi waktu browser membuka berkas sebelum URL dibersihkan.
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  return (
    <div className="es-ad">
      {/* Header */}
      <Card className="es-ad-heading">
        <div className="es-ad-heading-copy">
          <span className="es-ad-deadline-badge">
            <Solar name="clock-circle" />
            Tenggat 2 Hari Lagi
          </span>

          <h1>
            Tugas 01: Analisis Topologi Jaringan Komputer & Skema LAN
          </h1>

          <p>
            <Solar name="calendar" />
            Dibuka: 18 Okt 2024, 08:00 WIB
          </p>
        </div>

        <ButtonLink
          href={`${b}?tab=asesmen`}
          variant="outline"
          className="es-ad-back"
        >
          <Solar name="alt-arrow-left" />
          Kembali ke Informatika
        </ButtonLink>
      </Card>

      <div className="es-ad-columns">
        <div className="es-ad-main">
          {/* Deskripsi */}
          <Card className="es-ad-description">
            <h2>Deskripsi & Instruksi Pengerjaan</h2>

            <p>
              Pada praktikum laboratorium kali ini, Anda diminta
              untuk merancang skema jaringan lokal (LAN) skala
              sekolah menengah yang menghubungkan 24 unit komputer
              siswa (PC Client) dan 1 unit Server Pembelajaran ke
              gerbang internet utama melalui router gateway.
            </p>
          </Card>

          {/* Lampiran guru */}
          <Card className="es-ad-material">
            <h2>Bahan & Lampiran Guru</h2>

            <div className="es-ad-teacher-file">
              <span className="es-ad-file-icon is-red">
                <Solar name="documents" variant="bold" />
              </span>

              <div className="es-ad-file-copy">
                <strong>
                  LKPD_Praktikum_Topologi_Jaringan_Kelas8.pdf
                </strong>
                <span>1.8 MB • Diperbarui 18 Okt 2024</span>
              </div>

              <a
                href="/siswa-demo/LKPD_Praktikum_Topologi_Jaringan_Kelas8.pdf"
                download
                className="es-ad-download"
              >
                <Solar name="cloud-download" variant="bold" />
                Unduh LKPD
              </a>
            </div>
          </Card>

          {/* Form pengumpulan */}
          <Card className="es-ad-upload-card">
            <h2>Formulir Pengumpulan Berkas</h2>

            <form
              className="es-ad-form"
              onSubmit={(event) => {
                event.preventDefault();

                if (!file) {
                  setError("Pilih berkas tugas terlebih dahulu.");
                  return;
                }

                if (!agreed) {
                  setError(
                    "Centang pernyataan pengerjaan mandiri terlebih dahulu.",
                  );
                  return;
                }

                setSubmitted(true);
                setError("");
                setMessage(
                  "Pengumpulan berhasil pada sesi demo. Berkas belum dikirim ke server.",
                );
              }}
            >
              <label
                className={`es-ad-dropzone ${
                  submitted ? "is-disabled" : ""
                }`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  selectFile(event.dataTransfer.files[0]);
                }}
              >
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  disabled={submitted}
                  onChange={(event) => {
                    selectFile(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />

                <span className="es-ad-upload-icon">
                  <Solar name="upload" />
                </span>

                <strong>
                  Tarik & lepas berkas tugas Anda di sini, atau{" "}
                  <span>jelajahi komputer</span>
                </strong>

                <p>
                  Pastikan nama file menyertakan Nama dan Kelas
                  sesuai panduan
                </p>

                <div className="es-ad-formats">
                  <span>PDF</span>
                  <span>PNG</span>
                  <span>JPG</span>
                  <span className="is-limit">Maks 5 MB</span>
                </div>
              </label>

              <div className="es-ad-attached">
                <h3>BERKAS TERLAMPIR SAAT INI</h3>

                {file ? (
                  <div className="es-ad-student-file">
                    <span className="es-ad-file-icon is-blue">
                      <Solar name="file-text" />
                    </span>

                    <div className="es-ad-file-copy">
                      <strong>{file.name}</strong>
                      <span>
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                        {" • "}
                        {submitted
                          ? "Dikumpulkan pada sesi demo"
                          : "Dipilih untuk pengumpulan"}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="es-ad-preview"
                      onClick={previewFile}
                    >
                      <Solar name="eye" />
                      Pratinjau
                    </button>

                    <button
                      type="button"
                      className="es-ad-remove"
                      aria-label="Hapus berkas terlampir"
                      disabled={submitted}
                      onClick={() => {
                        setFile(null);
                        setMessage("");
                      }}
                    >
                      <Solar name="trash-bin-trash" />
                    </button>
                  </div>
                ) : (
                  <p className="es-ad-no-file">
                    Belum ada berkas yang dipilih.
                  </p>
                )}
              </div>

              <label className="es-ad-declaration">
                <input
                  type="checkbox"
                  checked={agreed}
                  disabled={submitted}
                  onChange={(event) => setAgreed(event.target.checked)}
                />

                <span>
                  Saya menyatakan bahwa tugas praktikum ini
                  dikerjakan secara mandiri dan bebas dari
                  kecurangan akademik serta plagiarisme berkas
                  teman sebaya.
                </span>
              </label>

              {error && (
                <p className="es-ad-error" role="alert">
                  {error}
                </p>
              )}

              {message && (
                <p className="es-ad-message" role="status">
                  {message}
                </p>
              )}

              <div className="es-ad-form-actions">
                <button
                  type="button"
                  className="es-ad-draft"
                  disabled={submitted}
                  onClick={() => {
                    if (!file) {
                      setError("Pilih berkas sebelum menyimpan draf.");
                      return;
                    }

                    setError("");
                    setMessage(
                      "Draf dipertahankan selama halaman ini tetap terbuka.",
                    );
                  }}
                >
                  Simpan Draf
                </button>

                <button
                  type="submit"
                  className="es-ad-submit"
                  disabled={submitted}
                >
                  {submitted
                    ? "Tugas Sudah Dikirim"
                    : "Kirim Tugas Sekarang"}
                  <Solar name="alt-arrow-right" />
                </button>
              </div>
            </form>
          </Card>
        </div>

        <aside className="es-ad-aside">
          {/* Status */}
          <Card className="es-ad-status-card">
            <div className="es-ad-status-top">
              <h2>Status Tugas</h2>

              <span
                className={`es-ad-status-badge ${
                  submitted ? "is-submitted" : ""
                }`}
              >
                {submitted
                  ? "Sudah Mengumpulkan"
                  : "Belum Mengumpulkan"}
              </span>
            </div>

            <div className="es-ad-countdown">
              <span>SISA WAKTU PENGERJAAN</span>

              <p>
                <strong>2</strong>h{" "}
                <strong>14</strong>j{" "}
                <strong>22</strong>m
              </p>
            </div>
          </Card>

          {/* Rubrik */}
          <Card className="es-ad-rubric-card">
            <h2>Rubrik Penilaian</h2>

            <div className="es-ad-rubric-weights">
              {[
                { label: "Skema Topologi & Routing", weight: 40 },
                { label: "Kelengkapan Perangkat Keras", weight: 40 },
                { label: "Kerapian Dokumen & Format", weight: 20 },
              ].map((item) => (
                <div key={item.label} className="es-ad-rubric-weight">
                  <div className="es-ad-rubric-weight-heading">
                    <strong>{item.label}</strong>
                    <span>{item.weight}%</span>
                  </div>

                  <div className="es-ad-rubric-weight-track">
                    <span style={{ width: `${item.weight}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="es-ad-rubric-weight-total">
              <span>
                Akumulasi Bobot
                <br />
                Maksimal
              </span>
              <strong>100 Poin</strong>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
export function LearningProgress() {
  const [search, setSearch] = useState("");
  const [activity, setActivity] = useState("all");

  const summary = [
    {
      label: "Progres Keseluruhan",
      value: "75%",
      suffix: "",
      icon: "document-text",
      tone: "blue",
      hint: <>Target Semester: <strong>80%</strong></>,
    },
    {
      label: "Materi Selesai",
      value: "18",
      suffix: "/ 24 Modul",
      icon: "documents",
      tone: "blue",
      hint: "6 materi siap dipelajari minggu ini",
    },
    {
      label: "Asesmen Tuntas",
      value: "6",
      suffix: "/ 8 Ujian & Tugas",
      icon: "check-circle",
      tone: "green",
      hint: "2 asesmen menunggu batas waktu",
    },
    {
      label: "Rata-rata Nilai",
      value: "84.0",
      suffix: "/ 100",
      icon: "cup",
      tone: "yellow",
      hint: "Akumulasi seluruh evaluasi mapel",
    },
  ];

  const courses = [
    {
      id: "matematika",
      name: "Matematika",
      teacher: "Dra. Sri Wahyuni, M.Pd",
      score: "88.0",
      progress: 80,
      materials: "8/10 Materi Selesai",
      assessments: "4/5 Asesmen Selesai",
      complete: false,
    },
    {
      id: "ipa",
      name: "Ilmu Pengetahuan Alam",
      teacher: "Ahmad Fauzi, S.Si",
      score: "81.0",
      progress: 72,
      materials: "7/10 Materi Selesai",
      assessments: "3/6 Asesmen Selesai",
      complete: false,
    },
    {
      id: "informatika",
      name: "Informatika",
      teacher: "Hendra Gunawan, S.Kom.",
      score: "90.0",
      progress: 88,
      materials: "9/10 Materi Selesai",
      assessments: "4/4 Lengkap!",
      complete: true,
    },
    {
      id: "bahasa-indonesia",
      name: "Bahasa Indonesia",
      teacher: "Siti Rahmah, S.Pd",
      score: "79.0",
      progress: 65,
      materials: "6/10 Materi Selesai",
      assessments: "2/4 Asesmen Selesai",
      complete: false,
    },
  ];

  const rows = [
    {
      id: 1,
      type: "assignment",
      title: "Persamaan Linear Dua Variabel",
      date: "14 Sep 2026, 10:20 WIB",
      subject: "Matematika",
      score: 90,
      icon: "document-text",
      href: `${base}/matematika/tugas/1`,
      action: "Lihat Berkas",
    },
    {
      id: 2,
      type: "quiz",
      title: "Kuis Formatif Bab 1: Logika Komputasi",
      date: "16 Sep 2026, 08:45 WIB",
      subject: "Informatika",
      score: 92,
      icon: "clipboard-text",
      href: `${base}/informatika/kuis/1/hasil`,
      action: "Lihat Pembahasan",
    },
  ];

  const filtered = rows.filter((row) => {
    const matchesSearch = `${row.title} ${row.subject}`
      .toLowerCase()
      .includes(search.toLowerCase());

    return (
      matchesSearch &&
      (activity === "all" || row.type === activity)
    );
  });

  return (
    <div className="es-lp">
      <Card className="es-lp-heading">
        <div>
          <h1>Progres Pembelajaran</h1>
          <p>
            Pantau perkembangan pembelajaran dan hasil belajarmu.
          </p>
        </div>

        <span className="es-lp-semester">
          <Solar name="document-text" />
          Semester Ganjil 2026/2027
        </span>
      </Card>

      <div className="es-lp-summary">
        {summary.map((item) => (
          <Card className="es-lp-stat" key={item.label}>
            <div className="es-lp-stat-top">
              <span
                className={`es-lp-stat-icon es-lp-${item.tone}`}
              >
                <Solar name={item.icon} />
              </span>

              <div className="es-lp-stat-copy">
                <h2>{item.label}</h2>
                <p>
                  <strong>{item.value}</strong>
                  {item.suffix && <span>{item.suffix}</span>}
                </p>
              </div>
            </div>

            <div className="es-lp-stat-hint">
              {item.hint}
            </div>
          </Card>
        ))}
      </div>

      <div className="es-lp-courses">
        {courses.map((course) => (
          <Card className="es-lp-course" key={course.id}>
            <div className="es-lp-course-heading">
              <div>
                <h2>{course.name}</h2>
                <p>{course.teacher}</p>
              </div>

              <span
                className={`es-lp-score ${
                  Number(course.score) < 80
                    ? "es-lp-score-yellow"
                    : ""
                }`}
              >
                {course.score} Rata-rata
              </span>
            </div>

            <div className="es-lp-progress">
              <div className="es-lp-progress-label">
                <span>Penguasaan Capaian</span>
                <strong>{course.progress}%</strong>
              </div>

              <div className="es-lp-track">
                <span
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>

           <div className="es-lp-course-counts">
              <span>
                <Solar name="notebook" />
                {course.materials}
              </span>

              <span
                className={
                  course.complete ? "es-lp-count-complete" : ""
                }
              >
                <Solar
                  name={
                    course.complete
                      ? "check-circle"
                      : "clipboard-check"
                  }
                />
                {course.assessments}
              </span>
            </div>

            <Link
              className="es-lp-course-link"
              href={`${base}/${course.id}`}
            >
              Buka Rincian Mapel
              <Solar name="arrow-right" />
            </Link>
          </Card>
        ))}
      </div>

      <Card className="es-lp-results">
        <div className="es-lp-results-heading">
          <h2>Nilai Tugas & Asesmen</h2>

          <div className="es-lp-results-actions">
            <label className="es-lp-search">
              <Solar name="magnifier" />
              <input
                aria-label="Cari aktivitas atau materi"
                placeholder="Cari aktivitas atau materi..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </label>

            <div className="es-lp-filter">
              <select
                aria-label="Filter aktivitas"
                value={activity}
                onChange={(event) =>
                  setActivity(event.target.value)
                }
              >
                <option value="all">Semua Aktivitas</option>
                <option value="assignment">Tugas</option>
                <option value="quiz">Kuis</option>
              </select>
              <Solar name="alt-arrow-down" />
            </div>
          </div>
        </div>

        <div className="es-lp-table-wrap">
          <table className="es-lp-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Aktivitas & Materi</th>
                <th>Mata Pelajaran</th>
                <th>Skor / KKM</th>
                <th>Status & Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>

                  <td>
                    <div className="es-lp-activity">
                      <span
                        className={`es-lp-activity-icon ${
                          row.type === "quiz"
                            ? "es-lp-yellow"
                            : "es-lp-blue"
                        }`}
                      >
                        <Solar
                          name={
                            row.type === "assignment"
                              ? "document-text"
                              : "clipboard-text"
                          }
                          variant={
                            row.type === "assignment" ? "bold" : "linear"
                          }
                        />
                      </span>

                      <div>
                        <strong>{row.title}</strong>
                        <p>Diserahkan: {row.date}</p>
                      </div>
                    </div>
                  </td>

                  <td>{row.subject}</td>

                  <td>
                    <div className="es-lp-result-score">
                      <strong>{row.score}</strong>
                      <span>KKM: 75</span>
                    </div>
                  </td>

                  <td>
                    <div className="es-lp-status-action">
                      <span>Tuntas</span>
                      <Link href={row.href}>
                        {row.action}
                        <Solar name="arrow-right" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {!filtered.length && (
                <tr>
                  <td colSpan={5}>
                    Tidak ada aktivitas yang sesuai pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="es-lp-results-footer">
          <span>
            Menampilkan {filtered.length} entri pembelajaran
          </span>

          <div className="es-lp-pagination">
            <button
              type="button"
              disabled
              aria-label="Halaman sebelumnya"
            >
              <Solar name="alt-arrow-left" />
            </button>
            <button
              type="button"
              className="is-active"
              aria-current="page"
            >
              1
            </button>
            <button
              type="button"
              disabled
              aria-label="Halaman berikutnya"
            >
              <Solar name="alt-arrow-right" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
function MaterialHistory({
  onOpenAssessments,
}: {
  onOpenAssessments: () => void;
}) {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const rows = [
    {
      id: "network",
      subjectId: "informatika",
      subject: "Informatika",
      teacher: "Pak Dimas Setiawan, S.Kom.",
      title:
        "Modul 04: Perangkat Keras Jaringan Komputer & Subnetting",
      topic: "Topologi, Switch, Router & Konfigurasi IP",
      date: "Hari Ini",
      time: "08:15 WIB",
      order: 3,
      progress: 60,
      detail: "3/5 Bab",
      archived: false,
      href: `${base}/informatika/materi/4`,
    },
    {
      id: "essay",
      subjectId: "bahasa-indonesia",
      subject: "Bahasa Indonesia",
      teacher: "Pak Budi Santoso, M.Pd.",
      title: "Bab 2: Menulis Esai dan Teks Eksposisi Populer",
      topic: "Struktur Argumen, Kaidah Kebahasaan & Fakta",
      date: "08 Okt 2026",
      time: "13:10 WIB",
      order: 2,
      progress: 40,
      detail: "2/5 Modul",
      archived: false,
      href: `${base}/bahasa-indonesia/materi/2`,
    },
    {
      id: "scratch",
      subjectId: "informatika",
      subject: "Informatika",
      teacher: "",
      title: "Modul Algoritma & Pemrograman Visual Scratch",
      topic: "Logika Percabangan, Perulangan & Sprite Animasi",
      date: "12 Sep 2026",
      time: "11:00 WIB",
      order: 1,
      progress: 100,
      detail: "Tuntas",
      archived: true,
      href: `${base}/informatika/materi/1?arsip=1`,
    },
  ];

  const filtered = rows
    .filter((row) => {
      const matchesSearch =
        `${row.title} ${row.topic} ${row.subject}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesSubject =
        subjectFilter === "all" ||
        row.subjectId === subjectFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !row.archived) ||
        (statusFilter === "archive" && row.archived) ||
        (statusFilter === "complete" && row.progress === 100);

      return matchesSearch && matchesSubject && matchesStatus;
    })
    .sort((a, b) =>
      sort === "oldest"
        ? a.order - b.order
        : b.order - a.order,
    );

  return (
    <div className="es-mh">
      <div className="es-mh-heading">
        <h1>Riwayat Akses Materi Pembelajaran</h1>
        <p>
          Daftar materi dan modul yang telah dipelajari atau
          diselesaikan.
        </p>
      </div>

      <div className="es-mh-tabs">
        <button type="button" className="is-active">
          Riwayat Materi
        </button>
        <button type="button" onClick={onOpenAssessments}>
          Riwayat Asesmen & Ujian
        </button>
      </div>

      <div className="es-mh-summary">
        {[
          {
            label: "MODUL DIAKSES",
            value: "48",
            icon: "documents",
            tone: "blue",
          },
          {
            label: "MODUL SELESAI",
            value: "42",
            icon: "check-circle",
            tone: "green",
          },
          {
            label: "ARSIP KELAS 7",
            value: "36",
            icon: "archive",
            tone: "gray",
          },
        ].map((item) => (
          <Card className="es-mh-stat" key={item.label}>
            <div className="es-mh-stat-top">
              <span
                className={`es-mh-stat-icon es-mh-${item.tone}`}
              >
                <Solar name={item.icon} />
              </span>
              <h2>{item.label}</h2>
            </div>
            <strong>{item.value}</strong>
          </Card>
        ))}
      </div>

      <div className="es-mh-notice">
        <Solar name="info-circle" variant="bold" />
        <div>
          <h2>Ketentuan Akses Riwayat Tingkat Kelas:</h2>
          <p>
            Sebagai siswa Kelas VIII, Anda memiliki akses penuh
            ke materi Kelas VIII yang sedang berjalan, serta
            akses arsip Baca-Saja (Read-Only) terhadap modul
            pembelajaran Kelas VII yang telah lalu untuk
            keperluan referensi dan pengulangan konsep dasar.
            Seluruh modul Kelas VII diberi penanda.
          </p>
        </div>
      </div>

      <div className="es-mh-toolbar">
        <label className="es-mh-search">
          <Solar name="magnifier" />
          <input
            aria-label="Cari materi"
            placeholder="Cari judul materi, topik, atau kata kunci..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <div className="es-mh-filters">
          <label>
            <select
              aria-label="Filter mata pelajaran"
              value={subjectFilter}
              onChange={(event) =>
                setSubjectFilter(event.target.value)
              }
            >
              <option value="all">Semua Mata Pelajaran</option>
              <option value="informatika">Informatika</option>
              <option value="bahasa-indonesia">
                Bahasa Indonesia
              </option>
            </select>
            <Solar name="alt-arrow-down" />
          </label>

          <label>
            <select
              aria-label="Filter status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="all">Semua Status</option>
              <option value="active">Kelas 8</option>
              <option value="archive">Arsip Kelas 7</option>
              <option value="complete">Tuntas</option>
            </select>
            <Solar name="alt-arrow-down" />
          </label>

          <label>
            <select
              aria-label="Urutkan riwayat"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="newest">Diakses Terbaru</option>
              <option value="oldest">Diakses Terlama</option>
            </select>
            <Solar name="alt-arrow-down" />
          </label>
        </div>
      </div>

      <Card className="es-mh-table-card">
        <div className="es-mh-table-wrap">
          <table className="es-mh-table">
            <thead>
              <tr>
                <th>Tingkat / Status</th>
                <th>Mata Pelajaran</th>
                <th>Judul Materi / Modul</th>
                <th>Terakhir Diakses</th>
                <th>Progres Belajar</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className={row.archived ? "is-archived" : ""}
                >
                  <td>
                    <span
                      className={`es-mh-level ${
                        row.archived ? "is-archive" : ""
                      }`}
                    >
                      {row.archived && <Solar name="archive" />}
                      {row.archived ? "Arsip Kelas 7" : "Kelas 8"}
                    </span>
                  </td>

                  <td>
                    <strong>{row.subject}</strong>
                    {row.teacher && <p>{row.teacher}</p>}
                  </td>

                  <td>
                    <strong>{row.title}</strong>
                    <p>Topik: {row.topic}</p>
                  </td>

                  <td>
                    <strong>{row.date}</strong>
                    <p>{row.time}</p>
                  </td>

                  <td>
                    <div className="es-mh-progress">
                      <div>
                        <strong>{row.progress}%</strong>
                        <span
                          className={
                            row.progress === 100
                              ? "is-complete"
                              : ""
                          }
                        >
                          {row.detail}
                        </span>
                      </div>
                      <div className="es-mh-track">
                        <span
                          style={{
                            width: `${row.progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  <td>
                    <Link
                      className={`es-mh-open ${
                        row.archived ? "is-outline" : ""
                      }`}
                      href={row.href}
                    >
                      {row.archived && (
                        <Solar name="arrow-right" />
                      )}
                      {row.archived ? "Buka Arsip" : "Buka Materi"}
                      {!row.archived && (
                        <Solar name="arrow-right" />
                      )}
                    </Link>
                  </td>
                </tr>
              ))}

              {!filtered.length && (
                <tr>
                  <td colSpan={6}>
                    Tidak ada riwayat yang sesuai pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="es-mh-footer">
          <span>
            Menampilkan {filtered.length} dari {rows.length}
            {" "}materi riwayat
          </span>

          <div className="es-mh-pagination">
            <button
              type="button"
              disabled
              aria-label="Halaman sebelumnya"
            >
              <Solar name="alt-arrow-left" />
            </button>
            <button type="button" aria-current="page">
              1
            </button>
            <button
              type="button"
              disabled
              aria-label="Halaman berikutnya"
            >
              <Solar name="alt-arrow-right" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
function AssessmentHistory({
  onOpenMaterials,
}: {
  onOpenMaterials: () => void;
}) {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const rows = [
    {
      id: 1,
      title: "Kuis Formatif Bab 1: Logika Komputasional",
      subject: "Informatika",
      subjectId: "informatika",
      type: "quiz",
      date: "28 Sep 2026",
      time: "09:45 WIB",
      score: 92,
      archived: false,
      href: `${base}/informatika/kuis/1/hasil`,
    },
    {
      id: 2,
      title: "Tugas 02: Praktikum Konversi Biner & Heksadesimal",
      subject: "Informatika",
      subjectId: "informatika",
      type: "assignment",
      date: "22 Sep 2026",
      time: "11:20 WIB",
      score: 90,
      archived: false,
      href: `${base}/informatika/tugas/2`,
    },
    {
      id: 3,
      title:
        "Ulangan Harian Bab 2: Sistem Persamaan Linear Dua Variabel",
      subject: "Matematika",
      subjectId: "matematika",
      type: "exam",
      date: "15 Sep 2026",
      time: "08:30 WIB",
      score: 88,
      archived: false,
      href: `${base}/matematika/kuis/1/hasil`,
    },
    {
      id: 4,
      title:
        "Kuis Formatif Struktur Sel & Organisasi Kehidupan",
      subject: "IPA Terpadu",
      subjectId: "ipa",
      type: "quiz",
      date: "08 Sep 2026",
      time: "10:15 WIB",
      score: 84,
      archived: false,
      href: `${base}/ipa/kuis/1/hasil`,
    },
    {
      id: 5,
      title:
        "Sumatif Akhir Semester (SAS) Genap Informatika VII",
      subject: "Informatika Kelas VII",
      subjectId: "informatika",
      type: "exam",
      date: "10 Jun 2026",
      time: "08:00 WIB",
      score: 90,
      archived: true,
      href: `${base}/informatika/kuis/1/hasil?arsip=1`,
    },
    {
      id: 6,
      title:
        "Praktikum Mandiri: Animasi Interaktif Scratch & Blockly",
      subject: "Informatika Kelas VII",
      subjectId: "informatika",
      type: "assignment",
      date: "18 Mei 2026",
      time: "14:00 WIB",
      score: 86,
      archived: true,
      href: `${base}/informatika/tugas/1?arsip=1`,
    },
  ];

  const filtered = rows
    .filter((row) => {
      const matchesSearch = `${row.title} ${row.subject}`
        .toLowerCase()
        .includes(search.toLowerCase());

      return (
        matchesSearch &&
        (subjectFilter === "all" ||
          row.subjectId === subjectFilter) &&
        (typeFilter === "all" || row.type === typeFilter)
      );
    })
    .sort((a, b) =>
      sort === "oldest" ? b.id - a.id : a.id - b.id,
    );

  return (
    <div className="es-mh es-ah">
      <div className="es-mh-heading">
        <h1>Riwayat & Arsip Nilai Asesmen</h1>
        <p>
          Seluruh catatan hasil pengerjaan kuis formatif,
          tugas praktikum LKPD, dan sumatif yang pernah
          dikerjakan.
        </p>
      </div>

      <div className="es-mh-tabs">
        <button type="button" onClick={onOpenMaterials}>
          Riwayat Materi
        </button>
        <button type="button" className="is-active">
          Riwayat Asesmen & Ujian
        </button>
      </div>

      <div className="es-mh-summary">
        <Card className="es-mh-stat es-ah-stat">
          <div className="es-mh-stat-top">
            <span className="es-mh-stat-icon es-mh-green">
              <Solar name="clipboard-check" />
            </span>
            <h2>TOTAL ASESMEN TUNTAS</h2>
          </div>

          <div className="es-ah-stat-value">
            <strong>22 Asesmen</strong>
          </div>

          <div className="es-ah-stat-hint">
            14 Kelas 8 + 8 Arsip Kelas 7
          </div>
        </Card>

        <Card className="es-mh-stat es-ah-stat">
          <div className="es-mh-stat-top">
            <span className="es-mh-stat-icon es-mh-green">
              <Solar name="star" />
            </span>
            <h2>RATA-RATA NILAI FORMATIF</h2>
          </div>

          <div className="es-ah-stat-value">
            <strong>88.4</strong>
            <span>/ 100</span>
          </div>

          <div className="es-ah-stat-hint">
            <span className="es-ah-threshold">
              <Solar name="check-circle" />
              Di atas KKTP 75.0
            </span>
          </div>
        </Card>

        <Card className="es-mh-stat es-ah-stat">
          <div className="es-mh-stat-top">
            <span className="es-mh-stat-icon es-mh-yellow">
              <Solar name="clock-circle" />
            </span>
            <h2>WAKTU PENGERJAAN UJIAN</h2>
          </div>

          <div className="es-ah-stat-value">
            <strong>14.5 Jam</strong>
          </div>

          <div className="es-ah-stat-hint">
            Akumulasi seluruh asesmen
          </div>
        </Card>
      </div>

      <div className="es-mh-toolbar">
        <label className="es-mh-search">
          <Solar name="magnifier" />
          <input
            aria-label="Cari asesmen"
            placeholder="Cari judul asesmen atau kuis..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <div className="es-mh-filters">
          <label>
            <select
              aria-label="Filter mata pelajaran"
              value={subjectFilter}
              onChange={(event) =>
                setSubjectFilter(event.target.value)
              }
            >
              <option value="all">Semua Mata Pelajaran</option>
              <option value="informatika">Informatika</option>
              <option value="matematika">Matematika</option>
              <option value="ipa">IPA Terpadu</option>
            </select>
            <Solar name="alt-arrow-down" />
          </label>

          <label>
            <select
              aria-label="Filter tipe asesmen"
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
            >
              <option value="all">Semua Tipe</option>
              <option value="quiz">Kuis Formatif</option>
              <option value="assignment">Tugas Praktikum</option>
              <option value="exam">Ujian / Sumatif</option>
            </select>
            <Solar name="alt-arrow-down" />
          </label>

          <label>
            <select
              aria-label="Urutkan asesmen"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
            </select>
            <Solar name="alt-arrow-down" />
          </label>
        </div>
      </div>

      <Card className="es-mh-table-card">
        <div className="es-mh-table-wrap">
          <table className="es-mh-table es-ah-table">
            <thead>
              <tr>
                <th>Jenjang / Rombel</th>
                <th>Judul Asesmen & Mapel</th>
                <th>Tanggal Selesai</th>
                <th>Skor / KKTP</th>
                <th>Status Kelulusan</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className={row.archived ? "is-archived" : ""}
                >
                  <td>
                    <span
                      className={`es-mh-level ${
                        row.archived ? "is-archive" : ""
                      }`}
                    >
                      {row.archived ? "Arsip Kelas 7" : "Kelas 8"}
                    </span>
                  </td>

                  <td>
                    <strong>{row.title}</strong>
                    <p className="es-ah-subject">
                      {row.subject}
                    </p>
                  </td>

                  <td>
                    <div className="es-ah-date">{row.date}</div>
                    <p>{row.time}</p>
                  </td>

                  <td>
                    <div className="es-ah-score">
                      <strong>{row.score}</strong>
                      <span>/ 100</span>
                    </div>
                    <p>KKTP: 75</p>
                  </td>

                  <td className="es-ah-status-cell">
                    <span
                      className={`es-mh-level ${
                        row.archived ? "is-archive" : ""
                      }`}
                    >
                      {row.archived ? "Arsip Terkunci" : "Tuntas"}
                    </span>
                  </td>

                  <td>
                    <Link
                      className={`es-mh-open ${
                        row.archived ? "is-outline" : ""
                      }`}
                      href={row.href}
                    >
                      {row.archived && (
                        <Solar name="arrow-right" />
                      )}
                      {row.archived
                        ? "Buka Arsip"
                        : "Buka Lembar Hasil"}
                      {!row.archived && (
                        <Solar name="arrow-right" />
                      )}
                    </Link>
                  </td>
                </tr>
              ))}

              {!filtered.length && (
                <tr>
                  <td colSpan={6}>
                    Tidak ada asesmen yang sesuai pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="es-mh-footer">
          <span>
            Menampilkan {filtered.length} dari {rows.length}
            {" "}asesmen tersimpan
          </span>

          <div className="es-mh-pagination">
            <button
              type="button"
              disabled
              aria-label="Halaman sebelumnya"
            >
              <Solar name="alt-arrow-left" />
            </button>
            <button type="button" aria-current="page">
              1
            </button>
            <button
              type="button"
              disabled
              aria-label="Halaman berikutnya"
            >
              <Solar name="alt-arrow-right" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
export function History() {
  const [tab, setTab] = useState("materi");

  return tab === "materi" ? (
    <MaterialHistory
      onOpenAssessments={() => setTab("nilai")}
    />
  ) : (
    <AssessmentHistory
      onOpenMaterials={() => setTab("materi")}
    />
  );
}
export function Profile() {
  const [photoError, setPhotoError] = useState(false);

  const identity = [
    ["Nama Lengkap", "Andi Pratama"],
    ["Tempat, Tanggal Lahir", "Bandung, 14 Mei 2010"],
    ["NIS / NISN", "222307012 / 0098471204"],
    ["Jenis Kelamin", "Laki-laki"],
    ["Agama", "Islam"],
    ["NIK Siswa", "327321•••••0003"],
  ];

  const academic = [
    ["Tahun Ajaran Aktif", "2026/2027 – Ganjil"],
    ["Tingkat & Kelas", "Kelas 8B"],
    ["Status Keaktifan", "Aktif & Terverifikasi"],
    ["Semester Berjalan", "Semester 1 (Ganjil)"],
    ["Wali Kelas", "Bpk. Joko Susilo, S.Pd."],
  ];

  const parent = [
    ["Nama Ayah / Wali", "Bambang Pratama, S.T."],
    ["Nomor WhatsApp Terdaftar", "+62 812-3456-7890"],
    ["Email Orang Tua", "bambang.pratama@email.com"],
    ["Status Hubungan", "Ayah Kandung"],
    [
      "Alamat Tinggal Sesuai KK",
      "Jl. Sukajadi No. 45, Coblong, Kota Bandung, Jawa Barat 40131",
    ],
  ];

  return (
    <div className="es-sp">
      <div className="es-sp-heading">
        <h1>Profil Siswa & Akun</h1>
        <p>
          Informasi data pokok peserta didik, kontak orang tua,
          dan pengaturan keamanan akun.
        </p>
      </div>

      <Card className="es-sp-profile">
        <div className="es-sp-profile-main">
          <div className="es-sp-photo">
            {photoError ? (
              <span>AP</span>
            ) : (
              <img
                src="/images/andi-pratama.jpg"
                alt="Foto profil Andi Pratama"
                onError={() => setPhotoError(true)}
              />
            )}
          </div>

          <div className="es-sp-profile-copy">
            <h2>Andi Pratama</h2>

            <span className="es-sp-nisn">
              NISN: 0098471204
            </span>

            <span className="es-sp-class">
              Rombongan Belajar: Kelas 8B
            </span>

            <p className="es-sp-homeroom">
              <Solar name="user" />
              <span>
                Wali Kelas:{" "}
                <strong>Bpk. Joko Susilo, S.Pd.</strong>
              </span>
            </p>
          </div>
        </div>

        <div className="es-sp-profile-status">
          <span>
            <Solar name="check-circle" />
            Siswa Aktif
          </span>
          <p>T.A. 2026/2027 Ganjil</p>
        </div>
      </Card>

      <div className="es-sp-columns">
        <Card className="es-sp-identity">
          <div className="es-sp-section-heading">
            <span className="es-sp-heading-icon">
              <Solar name="user-id" />
            </span>
            <h2>Informasi Identitas Peserta Didik</h2>
          </div>

          <div className="es-sp-fields">
            {identity.map(([label, value]) => (
              <div className="es-sp-field" key={label}>
                <span>{label}</span>

                <div className="es-sp-field-value">
                  <span>{value}</span>
                  {label === "NIK Siswa" && (
                    <Solar name="eye-closed" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="es-sp-notice">
            <Solar name="shield-check" variant="bold" />
            <p>
              Data identitas disinkronkan dengan data Dapodik
              Kemendikbudristek.
              <br />
              Jika terdapat kesalahan data pokok, ajukan
              perbaikan data melalui Bagian Tata Usaha.
            </p>
          </div>
        </Card>

        <Card className="es-sp-academic">
          <div className="es-sp-section-heading">
            <span className="es-sp-heading-icon">
              <Solar name="square-academic-cap" />
            </span>
            <h2>Status Rombel & Akademik</h2>
          </div>

          <div className="es-sp-academic-list">
            {academic.map(([label, value]) => (
              <div className="es-sp-academic-row" key={label}>
                <span>{label}</span>
                <strong
                  className={
                    label === "Tingkat & Kelas"
                      ? "is-blue"
                      : label === "Status Keaktifan"
                        ? "is-green"
                        : ""
                  }
                >
                  {value}
                </strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="es-sp-parent">
        <div className="es-sp-section-heading">
          <span className="es-sp-heading-icon is-yellow">
            <Solar name="users-group-rounded" />
          </span>

          <div>
            <h2>Data Orang Tua / Wali Murid Terhubung</h2>
            <p>
              Koneksi wali siswa untuk notifikasi rapor & presensi
            </p>
          </div>
        </div>

        <div className="es-sp-fields es-sp-parent-fields">
          {parent.map(([label, value]) => (
            <div
              className={`es-sp-field ${
                label === "Alamat Tinggal Sesuai KK"
                  ? "es-sp-address"
                  : ""
              }`}
              key={label}
            >
              <span>{label}</span>
              <div className="es-sp-field-value">
                <span>{value}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
