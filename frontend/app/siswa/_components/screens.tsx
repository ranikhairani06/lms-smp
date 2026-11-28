"use client";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Solar } from "./icon";
import {
  Attachment,
  AssessmentInstructions,
  Badge,
  ButtonLink,
  Card,
  Heading,
  Progress,
  Stats,
} from "./ui";
import { StudentEmpty, StudentError, StudentLoading } from "./api-state";
import { ApiError } from "@/lib/api";
import { useStudentResource } from "@/lib/useStudentResource";
import { isAllowedUploadExtension, MAX_UPLOAD_FILE_SIZE_BYTES, MAX_UPLOAD_FILE_SIZE_LABEL, uploadAccept, uploadExtensionsLabel } from "@/lib/uploadLimits";
import {
  completeStudentMaterial,
  getCurrentStudentUser,
  getStudentCourse,
  getStudentCourseBySlug,
  getStudentCourses,
  getStudentDashboard,
  getStudentProfile,
  studentCourseSlug,
  type StudentCourse,
} from "@/lib/student-api";
const base = "/siswa/mata-pelajaran";

async function loadDashboardPage() {
  const [dashboard, user] = await Promise.all([getStudentDashboard(), getCurrentStudentUser()]);
  const courseDetails = await Promise.all(dashboard.courses.map(async (course) => {
    try {
      return await getStudentCourse(course.id);
    } catch {
      return null;
    }
  }));
  const loadedCourses = courseDetails.filter((course) => course !== null);
  return { dashboard, user, loadedCourses };
}

async function loadStudentCourses() {
  return getStudentCourses();
}

async function loadStudentProfilePage() {
  const [profile, dashboard, user] = await Promise.all([getStudentProfile(), getStudentDashboard(), getCurrentStudentUser()]);
  return { profile, dashboard, user };
}

function SubjectCard({
  subject,
}: {
  subject: StudentCourse;
}) {
  const slug = studentCourseSlug(subject.name);
  const progress = 0;

  return (
    <Card className="es-mapel-card">
      <h2>{subject.name}</h2>

      <div className="es-mapel-info">
        <p>
          <Solar name="user-rounded" />
          <span>Informasi guru pengampu tidak tersedia dari API.</span>
        </p>

        <p>
          <Solar name="clock-circle" />
          <span>Informasi jadwal tidak tersedia dari API.</span>
        </p>
      </div>

      <div className="es-mapel-progress">
        <div className="es-mapel-progress-label">
          <span>Progres Belajar</span>
          <strong>—</strong>
        </div>

        <div
          className="es-mapel-progress-track"
          role="progressbar"
          aria-label={`Progres belajar ${subject.name}`}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="es-mapel-assessment">
        <Solar name="document-add" />

        <div>
          <span>STATUS ASESMEN</span>
          <p>Informasi status asesmen tidak tersedia dari API.</p>
        </div>
      </div>

      <ButtonLink
        href={`${base}/${slug}`}
        className="es-mapel-button"
      >
        Buka Mata Pelajaran
        <Solar name="arrow-right" />
      </ButtonLink>
    </Card>
  );
}
export function Dashboard() {
  const resource = useStudentResource(loadDashboardPage);
  if (resource.status === "loading") return <StudentLoading title="Memuat dashboard siswa..." />;
  if (resource.status === "error") return <StudentError resource={resource} />;
  if (resource.status === "empty") return <StudentEmpty title="Dashboard siswa belum memiliki data." />;
  const { dashboard, user, loadedCourses } = resource.data;
  const className = dashboard.student.class_room?.name ?? "Belum ditetapkan";
  const eligibleCourses = dashboard.expected_grade === null ? [] : dashboard.courses.filter((course) => course.target_grade <= dashboard.expected_grade!);
  const dashboardAssessments = loadedCourses.flatMap((course) => course.sections.flatMap((section) => section.assessments.map((assessment) => ({
    ...assessment,
    courseName: course.name,
    sectionTitle: section.title,
    courseSlug: studentCourseSlug(course.name),
  }))));
  const dashboardMaterials = loadedCourses.flatMap((course) => course.sections.flatMap((section) => section.materials.map((material) => ({ ...material, courseSlug: studentCourseSlug(course.name) }))));

  return (
    <div className="es-dashboard">
      <Card className="es-student-heading">
      <div className="es-student-heading-copy">
        <h1>Halo, {user.name}!</h1>

        <div className="es-student-info">
          <div>
            <Solar name="user-id" />
            <p>
              NISN: <strong>{dashboard.student.nisn}</strong>
            </p>
          </div>

          <div>
            <Solar name="square-academic-cap" />
            <p>
              Kelas: <strong>{className}</strong>
            </p>
          </div>

          <div>
            <Solar name="user-rounded" />
            <p>Wali Kelas: <strong>Informasi tidak tersedia dari API.</strong></p>
          </div>
        </div>
      </div>

  <div className="es-student-heading-badges">
    <span className="es-student-status">
      <Solar name="check-circle" />
      {dashboard.student.is_active ? "Siswa Aktif" : "Tidak Aktif"}
    </span>

    <span className="es-student-year">
      <Solar name="calendar" />
      {dashboard.expected_grade ? `Tingkat ${dashboard.expected_grade}` : "Tahun ajaran tidak tersedia"}
    </span>
  </div>
</Card>
     <div className="es-hero es-exam-banner">
        <div className="es-exam-date">
          <span>ASESMEN</span>
          <strong>{dashboard.class_update_required ? "Kelas" : "—"}</strong>
          <small>{dashboard.class_update_required ? "Perlu diperbarui" : "Jadwal tidak tersedia"}</small>
        </div>

        <div className="es-exam-copy">
          <h2>{dashboard.class_update_required ? "Data kelas perlu diperbarui" : "Informasi ujian tidak tersedia"}</h2>
          <p>
            {dashboard.class_update_required ? "Kelas yang ditetapkan berbeda dari tingkat kelas yang diharapkan. Silakan hubungi administrator." : "API dashboard tidak menyediakan jadwal ujian."}
          </p>
        </div>

        <ButtonLink
          href="/siswa/mata-pelajaran"
          variant="secondary"
          className="es-exam-button"
        >
          Lihat Mata Pelajaran
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
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext="Progres tidak tersedia dari API"
        >
          <div
            className="es-semester-progress-fill"
            style={{ width: "0%" }}
          />

          <span
            className="es-semester-progress-value"
            style={{ left: "0%" }}
          >
            —
          </span>
        </div>

        <div className="es-semester-stats">
          {[
            {
              value: "—",
              label: "Tugas Tuntas",
              icon: "medal-ribbons-star",
              tone: "green",
            },
            {
              value: "—",
              label: "Tugas Berjalan",
              icon: "clipboard-text",
              tone: "amber",
            },
            {
              value: "—",
              label: "Modul Tuntas",
              icon: "book",
              tone: "blue",
            },
            {
              value: "—",
              label: "Modul Berjalan",
              icon: "refresh",
              tone: "blue",
            },
            {
              value: "—",
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
                Lihat Semua {eligibleCourses.length} Mapel
                <Solar name="alt-arrow-right" />
              </Link>
            }
          >
            <div className="es-current-subjects-list">
              {eligibleCourses.slice(0, 2).map((course) => {
                const slug = studentCourseSlug(course.name);
                const icon = /ipa|sains|alam/i.test(course.name) ? "dna" : /matematika/i.test(course.name) ? "calculator" : "book-bookmark";
                return <article className="es-current-subject" key={course.id}>
                <div className="es-current-subject-label">
                  <span className="es-current-subject-icon">
                    <Solar name={icon} />
                  </span>
                  <span className="es-current-subject-badge">
                    {course.name}
                  </span>
                </div>

                <div className="es-current-subject-copy">
                  <h3>{course.name} Kelas {dashboard.expected_grade ?? course.target_grade}</h3>
                  <p>{course.description || "Deskripsi mata pelajaran belum tersedia dari API."}</p>
                </div>

                <div className="es-current-subject-next">
                  <Solar name="arrow-right" />
                  <p>
                    Selanjutnya: <strong>Materi berikutnya tidak tersedia dari API.</strong>
                  </p>
                </div>

                <ButtonLink
                  href={`${base}/${slug}`}
                  className="es-current-subject-button"
                >
                  Buka Modul {course.name}
                  <Solar name="arrow-right" />
                </ButtonLink>
              </article>;
              })}
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
                <h3>{dashboardMaterials[0]?.title ?? "Materi tidak tersedia dari API dashboard"}</h3>
                <p>{dashboardMaterials[0] ? `${dashboardMaterials[0].type} · ${dashboardMaterials[0].courseSlug}` : "Buka mata pelajaran untuk melihat materi."}</p>
              </div>

              <ButtonLink
                href="/siswa/mata-pelajaran"
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
                {dashboardAssessments.length} ASESMEN TERSEDIA
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
                  <h3>{dashboardAssessments[0]?.title ?? "Asesmen tidak tersedia dari API dashboard"}</h3>
                  <p>{dashboardAssessments[0] ? `${dashboardAssessments[0].courseName} · ${dashboardAssessments[0].sectionTitle}` : "Asesmen tersedia pada halaman mata pelajaran."}</p>
                </div>

                <div className="es-assessment-footer">
                  <span className="es-assessment-deadline es-assessment-urgent">
                    <Solar name="clock-circle" />
                    <span>{dashboardAssessments[0]?.end_at ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(dashboardAssessments[0].end_at)) : "Jadwal tidak tersedia dari API"}</span>
                  </span>

                  <ButtonLink
                    href={dashboardAssessments[0] ? `${base}/${dashboardAssessments[0].courseSlug}/kuis/${dashboardAssessments[0].id}` : "/siswa/mata-pelajaran"}
                    className="es-assessment-action"
                  >
                  Lihat Mata Pelajaran
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
                  <h3>{dashboardAssessments[1]?.title ?? "Asesmen berikutnya tidak tersedia dari API dashboard"}</h3>
                  <p>{dashboardAssessments[1] ? `${dashboardAssessments[1].courseName} · ${dashboardAssessments[1].sectionTitle}` : "Asesmen tersedia pada halaman mata pelajaran."}</p>
                </div>

                <div className="es-assessment-footer">
                  <span className="es-assessment-deadline">
                    <Solar name="upload" />
                    <span>{dashboardAssessments[1]?.end_at ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(dashboardAssessments[1].end_at)) : "Jadwal tidak tersedia dari API"}</span>
                  </span>

                  <ButtonLink
                    href={dashboardAssessments[1] ? `${base}/${dashboardAssessments[1].courseSlug}/kuis/${dashboardAssessments[1].id}` : "/siswa/mata-pelajaran"}
                    className="es-assessment-action"
                  >
                  Buka Asesmen
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
              Jadwal tidak tersedia dari API
            </span>
          }
        >
          <div className="es-schedule-timeline">
            {/* Jadwal berlangsung */}
            <article className="es-schedule-item">
              <span className="es-schedule-dot es-schedule-dot-active" />

              <div className="es-schedule-top">
                <span className="es-schedule-time es-schedule-time-active">
                  Waktu tidak tersedia dari API
                </span>

                <span className="es-schedule-status es-schedule-status-active">
                  Status tidak tersedia dari API
                </span>
              </div>

              <h3>Mata pelajaran tidak tersedia dari API</h3>
              <p>Ruang tidak tersedia dari API</p>
            </article>

            {/* Jadwal selesai */}
            <article className="es-schedule-item">
              <span className="es-schedule-dot es-schedule-dot-finished" />

              <div className="es-schedule-top">
                <span className="es-schedule-time">
                  Waktu tidak tersedia dari API
                </span>

                <span className="es-schedule-status es-schedule-status-finished">
                  Status tidak tersedia dari API
                </span>
              </div>

              <h3>Mata pelajaran tidak tersedia dari API</h3>
              <p>Ruang tidak tersedia dari API</p>
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
  const resource = useStudentResource(loadStudentCourses, (data) => data.data.length === 0);
  if (resource.status === "loading") return <StudentLoading title="Memuat mata pelajaran..." />;
  if (resource.status === "error") return <StudentError resource={resource} />;
  if (resource.status === "empty") return <StudentEmpty title="Daftar mata pelajaran belum tersedia." />;

  const subjects = resource.data.expected_grade === null ? [] : resource.data.data.filter((course) => course.target_grade <= resource.data.expected_grade!);
  if (subjects.length === 0) return <StudentEmpty title="Mata pelajaran yang dapat diakses belum tersedia." description="Tingkat kelas belum diketahui atau API belum mengembalikan mata pelajaran yang sesuai." />;
  const filtered = subjects
  .filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  )
  .sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
  return (
    <>
      <Card className="es-subjects-heading">
        <div>
          <h1>Mata Pelajaran Tersedia</h1>

          <div className="es-subjects-heading-info">
            <div>
              <Solar name="document-text" />
              <span>Semester tidak tersedia dari API</span>
            </div>

            <div>
              <Solar name="square-academic-cap" />
              <span>
                Tingkat: <strong>{resource.data.expected_grade ?? "—"}</strong>
              </span>
            </div>
          </div>
        </div>

        <span className="es-subjects-heading-count">
          <Solar name="book-bookmark" />
          {subjects.length} Mata Pelajaran Terdaftar
        </span>
      </Card>
      <div className="es-subjects-summary">
        {[
          {
            label: "TOTAL MAPEL TERDAFTAR",
            value: `${subjects.length} Mapel`,
            icon: "book",
          },
          {
            label: "RATA-RATA PROGRES BELAJAR",
            value: "—",
            icon: "book-bookmark",
            hint: "Informasi progres tidak tersedia dari API.",
          },
          {
            label: "TUGAS & ASESMEN MENUNGGU",
            value: "—",
            icon: "clipboard-text",
            hint: "Informasi asesmen menunggu tidak tersedia dari API.",
            tone: "orange",
          },
          {
            label: "RATA-RATA NILAI FORMATIF",
            value: "—",
            suffix: "/ 100",
            icon: "medal-star",
            hint: "Informasi nilai tidak tersedia dari API.",
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
  const slug = typeof params.subject === "string" ? params.subject : String(params.subject?.[0] ?? "");
  const loadCourse = useCallback(() => getStudentCourseBySlug(slug), [slug]);
  const resource = useStudentResource(loadCourse, (data) => data.sections.length === 0);
  const query = useSearchParams();
  const [tab, setTab] = useState(query.get("tab") || "ringkasan");
  const [search, setSearch] = useState("");
  const [materialSemester, setMaterialSemester] = useState("1");
  const [materialView, setMaterialView] = useState("grid");
  const [assessmentSemester, setAssessmentSemester] = useState("1");
  const [assessmentView, setAssessmentView] = useState("grid");
  if (resource.status === "loading") return <StudentLoading title="Memuat detail mata pelajaran..." />;
  if (resource.status === "error") return <StudentError resource={resource} />;
  if (resource.status === "empty") return <StudentEmpty title="Mata pelajaran belum memiliki data." />;
  const course = resource.data;
  const subject = { id: studentCourseSlug(course.name), name: course.name };
  const b = `${base}/${subject.id}`;
  const materialItems = course.sections.flatMap((section) => section.materials.map((material) => ({
    ...material,
    category: section.title,
    release: "Informasi tanggal rilis tidak tersedia dari API.",
    status: "active",
    completed: undefined as string | undefined,
    lastRead: undefined as string | undefined,
    attachment: material.file_path ? material.file_path.split("/").pop() : undefined,
  })));
  const assessments = course.sections.flatMap((section) => section.assessments.map((assessment) => ({ ...assessment, sectionTitle: section.title })));
  const currentMaterial = materialItems[0];
  const upcomingAssessment = assessments[0];
  return (
    <>
      <Card className="es-subject-detail-heading">
        <div className="es-subject-detail-heading-copy">
          <h1>{subject.name} Kelas {course.target_grade}</h1>
          <p>{course.description || "Deskripsi mata pelajaran belum tersedia dari API."}</p>
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
        secondLine: undefined,
        value: "—",
        hint: "Informasi pengampu tidak tersedia dari API.",
      },
      {
        label: "RUANG & KELAS",
        icon: "home-2",
        secondLine: undefined,
        value: `Kelas ${course.target_grade}`,
        hint: "Informasi ruang dan kapasitas tidak tersedia dari API.",
      },
      {
        label: "JADWAL SESI",
        icon: "calendar",
        secondLine: undefined,
        value: "—",
        hint: "Waktu tidak tersedia",
      },
      {
        label: "KRITERIA KETUNTASAN",
        icon: "clipboard-check",
        value: assessments.find((item) => item.passing_score !== null)?.passing_score?.toString() ?? "—",
        suffix: assessments.some((item) => item.passing_score !== null) ? "/ 100" : undefined,
        hint: "Ambang nilai ditentukan pada masing-masing asesmen.",
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
        value: `${materialItems.length} Modul tersedia`,
        icon: "book-2",
        secondLine: undefined,
        hint: "Status selesai tidak tersedia dari API.",
      },
      {
        label: "DISELESAIKAN",
        value: "—",
        icon: "check-circle",
        secondLine: undefined,
        hint: "Progres penyelesaian materi tidak tersedia dari API.",
      },
      {
        label: "SEDANG AKTIF",
        value: `${materialItems.length} Modul tersedia`,
        icon: "document",
        secondLine: undefined,
        hint: "Materi dapat dibuka sesuai akses kelas.",
      },
      {
        label: "BELUM DIBUKA",
        value: "—",
        icon: "lock-keyhole",
        secondLine: undefined,
        hint: "Informasi materi terkunci tidak tersedia dari API.",
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
      value: `${assessments.length} Asesmen tersedia`,
      icon: "clipboard-text",
      suffix: undefined,
      hint: "Status pengumpulan belum tersedia dari API.",
      tone: "orange",
    },
    {
      label: "RATA-RATA NILAI FORMATIF",
      value: "—",
      icon: "medal-star",
      suffix: undefined,
      hint: "Informasi nilai belum tersedia dari API.",
      tone: "green",
    },
    {
      label: "DISIPLIN WAKTU",
      value: "—",
      icon: "clock-circle",
      hint: "Informasi ketepatan waktu tidak tersedia dari API.",
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
            <p>Informasi progres penyelesaian materi belum tersedia dari API.</p>
            </div>

            <div className="es-detail-learning-meter">
              <div
                className="es-detail-learning-track"
                role="progressbar"
                aria-label={`Progres belajar ${subject.name}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuetext="Informasi progres belum tersedia"
              >
                <div style={{ width: "0%" }} />
              </div>

              <strong>—</strong>
            </div>
          </Card>
            <Card
              className="es-current-module"
              title="Materi yang Sedang Dipelajari"
              subtitle="Fokus sesi aktif minggu ini"
            >
              <div className="es-current-module-copy">
                <span className="es-current-module-badge">{currentMaterial ? `MODUL ${currentMaterial.section_id}` : "MATERI"}</span>

                <h3>
                  {currentMaterial?.title ?? "Materi belum tersedia dari API."}
                </h3>

                <p>
                  {currentMaterial?.body ?? "Isi materi belum tersedia dari API."}
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
                      <strong>{currentMaterial?.file_path?.split("/").pop() ?? "Berkas materi tidak tersedia"}</strong>
                      <span>{currentMaterial?.type ?? ""}</span>
                    </div>

                    <a
                      href={currentMaterial?.file_path ?? "#"}
                      aria-disabled={!currentMaterial?.file_path}
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
                      <strong>Berkas lampiran tambahan tidak tersedia dari API</strong>
                      <span>—</span>
                    </div>

                    <a
                      href="#"
                      aria-disabled="true"
                      download
                      aria-label="Unduh Slide Topologi dan Perangkat"
                    >
                      <Solar name="download" />
                    </a>
                  </div>
                </div>
              </div>

              <ButtonLink
                href={currentMaterial ? `${b}/materi/${currentMaterial.id}` : `${b}?tab=materi`}
                className="es-current-module-button"
              >
                {currentMaterial ? "Lanjutkan Belajar" : "Lihat Daftar Materi"}
                <Solar name="arrow-right" />
              </ButtonLink>
            </Card>
            <Card
            className="es-subject-syllabus"
            title="Silabus Pembelajaran"
            subtitle="Alur pencapaian target kompetensi"
          >
            <div className="es-syllabus-list">
              {course.sections.map((section) => {
                const item = { title: section.title, description: "Informasi capaian dan progres bagian tidak tersedia dari API.", status: "active" };
                const materialId = section.materials[0]?.id;
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
                        href={materialId ? `${b}/materi/${materialId}` : `${b}?tab=materi`}
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
                  {upcomingAssessment?.end_at ? `Tenggat ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(upcomingAssessment.end_at))}` : "Jadwal tidak tersedia dari API"}
                </span>

                <div className="es-upcoming-task-copy">
                  <h3>
                    {upcomingAssessment?.title ?? "Belum ada asesmen yang tersedia."}
                  </h3>

                  {upcomingAssessment?.description ? <AssessmentInstructions content={upcomingAssessment.description} /> : <p>Deskripsi asesmen belum tersedia dari API.</p>}
                </div>

                <div className="es-upcoming-task-deadline">
                  <Solar name="clock-circle" />
                  <span>{upcomingAssessment?.end_at ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(upcomingAssessment.end_at)) : "Waktu pengumpulan tidak tersedia dari API."}</span>
                </div>

                <ButtonLink
                  href={upcomingAssessment ? `${b}/kuis/${upcomingAssessment.id}` : `${b}?tab=asesmen`}
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
                <span className="es-learning-score-badge">Nilai tidak tersedia</span>
              </div>

              <div className="es-learning-score-value">
                <strong>—</strong>
                <span>/ 100</span>
              </div>
            </div>

            <div className="es-learning-score-details">
              {[
                { label: "Nilai Rata-rata Kuis", value: "—" },
                { label: "Nilai Tugas Mandiri", value: "—" },
                { label: "Nilai LKPD Praktikum", value: "—" },
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
                    Jadwal asesmen
                  </span>

                  <span className="es-task-pill es-task-pill-yellow">
                    Informasi status dan batas pengumpulan tidak tersedia dari API.
                  </span>
                </div>

                <div className="es-priority-task-body">
                  <div>
                    <span className="es-task-topic">{upcomingAssessment?.sectionTitle ?? "Informasi mata pelajaran tidak tersedia dari API"}</span>

                    <h2>{upcomingAssessment?.title ?? "Asesmen tidak tersedia dari API"}</h2>

                    {upcomingAssessment?.description ? <AssessmentInstructions className="es-priority-task-description" content={upcomingAssessment.description} /> : <p className="es-priority-task-description">Deskripsi asesmen tidak tersedia dari API.</p>}
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
                            <strong>Informasi format tidak tersedia dari API</strong>
                            
                          </p>
                        </div>
                      </div>

                      <div className="es-task-info-box es-task-info-status">
                        <span className="es-task-info-icon">
                          <Solar name="info-circle" />
                        </span>

                        <div>
                          <span>Status Pengumpulan</span>
                          <p>Status pengumpulan tidak tersedia dari API.</p>
                        </div>
                      </div>
                    </div>

                    <ButtonLink
                      href={upcomingAssessment ? `${b}/kuis/${upcomingAssessment.id}` : `${b}?tab=asesmen`}
                      className="es-task-primary-button"
                    >
                      Buka Asesmen
                      <Solar name="arrow-right" />
                    </ButtonLink>
                  </div>
                </div>
              </Card>

              <Card className="es-week-deadlines">
                <div className="es-week-deadlines-heading">
                  <h2>Tenggat Pekan Ini</h2>
                  <p>Jadwal pekan ini tidak tersedia dari API.</p>
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
              {assessments.map((assessment) => ({
                id: assessment.id,
                status: "pending",
                badge: "Status pengumpulan tidak tersedia dari API",
                metaLabel: "Jadwal:",
                metaValue: assessment.end_at ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(assessment.end_at)) : "Jadwal tidak tersedia dari API",
                title: assessment.title,
                topic: assessment.sectionTitle,
                button: "Buka Asesmen",
                href: `${b}/kuis/${assessment.id}`,
                icon: "arrow-right",
              })).filter((item) =>
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

                        <strong>{item.metaValue}</strong>
                      </div>
                    </div>

                    <div className="es-assessment-row-body">
                      <div className="es-assessment-row-copy">
                        <h3>{item.title}</h3>
                        <p>{item.topic}</p>

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
  const slug = typeof params.subject === "string" ? params.subject : String(params.subject?.[0] ?? "");
  const materialId = typeof params.material === "string" ? Number(params.material) : Number(params.material?.[0]);
  const loadMaterial = useCallback(async () => {
    const course = await getStudentCourseBySlug(slug);
    const allMaterials = course.sections.flatMap((section) => section.materials.map((material) => ({ ...material, sectionTitle: section.title })));
    const index = allMaterials.findIndex((item) => item.id === materialId);
    const material = allMaterials[index];
    if (!material) throw new ApiError("Materi tidak ditemukan.", 404);
    const section = course.sections.find((item) => item.id === material.section_id);
    return { course, material, section, allMaterials, materialIndex: index };
  }, [slug, materialId]);
  const resource = useStudentResource(loadMaterial);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  if (resource.status === "loading") return <StudentLoading title="Memuat materi..." />;
  if (resource.status === "error") return <StudentError resource={resource} />;
  if (resource.status === "empty") return <StudentEmpty title="Materi belum tersedia." />;
  const { course, material, section, allMaterials, materialIndex } = resource.data;
  const b = `${base}/${studentCourseSlug(course.name)}`;
  const relatedAssessment = section?.assessments[0];
  const previousMaterial = allMaterials[materialIndex - 1];
  const nextMaterial = allMaterials[materialIndex + 1];
  async function markCompleted() {
    if (finished || saving) return;
    setSaving(true);
    setActionError("");
    try {
      await completeStudentMaterial(material.id);
      setFinished(true);
    } catch {
      setActionError("Materi belum dapat ditandai selesai. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="es-material-detail">
      <Card className="es-material-detail-heading">
        <div className="es-material-detail-heading-top">
          <div className="es-material-detail-heading-copy">
            <h1>{material.title}</h1>

            <p>
              <Solar name="user-rounded" />
              <span>
                Guru: <strong>Informasi tidak tersedia dari API.</strong>
              </span>
            </p>

            <p>
              <Solar name="calendar" />
              <span>
                Bagian: <strong>{material.sectionTitle}</strong>
              </span>
            </p>
          </div>

          <div className="es-material-detail-heading-actions">
            <button
              type="button"
              className="es-md-button es-md-button-primary"
              disabled={finished || saving}
              onClick={() => void markCompleted()}
            >
              <Solar name="check-circle" />
              {finished ? "Sudah Selesai" : saving ? "Menyimpan..." : "Tandai Sudah Selesai"}
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
        {actionError && <p role="alert">{actionError}</p>}

        <div className="es-material-detail-resources">
          {[
            { icon: "videocamera", label: "Informasi video tidak tersedia dari API" },
            { icon: "book-2", label: material.body ? "Konten bacaan tersedia" : "Konten bacaan tidak tersedia" },
            { icon: "link", label: material.file_path ? "1 Berkas Lampiran" : "Berkas lampiran tidak tersedia" },
            { icon: "pen-new-square", label: relatedAssessment ? "1 Asesmen tersedia" : "Asesmen tidak tersedia" },
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
              <h2>Video Pembelajaran</h2>
              <p>Konten video tidak tersedia dari API.</p>
            </div>

            <div className="es-md-video-preview">
              <span className="es-md-video-play">
                <Solar name="play" />
              </span>

              <p>
                Konten video tidak tersedia dari API.
              </p>

              <div className="es-md-video-controls">
                <div className="es-md-video-track">
                  <span />
                </div>

                <div className="es-md-video-controls-bottom">
                  <Solar name="play" />
                  <Solar name="volume-loud" />
                  <span>— / —</span>
                  <span className="es-md-video-quality">Informasi tidak tersedia</span>
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
              <h3>{material.title}</h3>
              <p>{material.body ?? "Konten bacaan belum tersedia dari API."}</p>
            </div>
          </Card>

          <Card className="es-md-files-card">
            <div className="es-md-section-heading">
              <h2>Berkas Lampiran &amp; Unduhan Belajar</h2>
              <p>Materi penunjang resmi yang disiapkan oleh pengampu</p>
            </div>

            <div className="es-md-file-list">
              {material.file_path ? [{ name: material.file_path.split("/").pop() ?? material.title, size: material.type, tone: "red" }].map((file) => (
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
                    href={material.file_path ?? "#"}
                    download
                    className="es-md-file-download"
                  >
                    Unduh
                  </a>
                </div>
              )) : <p>Berkas lampiran belum tersedia dari API.</p>}
            </div>
          </Card>
        </div>

        <div className="es-material-detail-aside">
          <Card className="es-md-quiz-card">
            <h2>{relatedAssessment?.title ?? "Asesmen tidak tersedia"}</h2>

          <div className="es-md-quiz-info">
            <p>
              <span>
                <Solar name="clock-circle" />
                Batas Waktu:
              </span>
              <strong>{relatedAssessment?.end_at ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(relatedAssessment.end_at)) : "Jadwal tidak tersedia"}</strong>
            </p>

            <p>
              <span>
                <Solar name="target" />
                Nilai KKM Minimal:
              </span>
              <strong>{relatedAssessment?.passing_score ?? "—"} Poin</strong>
            </p>
          </div>

            <ButtonLink
              href={relatedAssessment ? `${b}/kuis/${relatedAssessment.id}` : `${b}?tab=asesmen`}
              className="es-md-quiz-button"
            >
              {relatedAssessment ? "Mulai Asesmen" : "Lihat Asesmen"}
              <Solar name="arrow-right" />
            </ButtonLink>
          </Card>

          <Card className="es-md-navigation-card">
            <div className="es-md-section-heading">
              <h2>Navigasi Topik Bab</h2>
            </div>

            <Link
              href={previousMaterial ? `${b}/materi/${previousMaterial.id}` : `${b}?tab=materi`}
              className="es-md-navigation-item"
            >
              <span className="es-md-navigation-direction">
                <Solar name="arrow-left" />
                Materi Sebelumnya
              </span>

              <strong>
                {previousMaterial?.title ?? "Materi sebelumnya tidak tersedia"}
              </strong>

              <span className="es-md-navigation-done">
                {previousMaterial ? "Status selesai tidak tersedia" : ""}
              </span>
            </Link>

            <Link
              href={nextMaterial ? `${b}/materi/${nextMaterial.id}` : `${b}?tab=materi`}
              className="es-md-navigation-item"
            >
              <span className="es-md-navigation-direction es-md-navigation-next">
                Materi Selanjutnya
                <Solar name="arrow-right" />
              </span>

              <strong>
                {nextMaterial?.title ?? "Materi selanjutnya tidak tersedia"}
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
  const subjectSlug = typeof params.subject === "string" ? params.subject : String(params.subject?.[0] ?? "");
  const assignmentId = typeof params.assignment === "string" ? params.assignment : String(params.assignment?.[0] ?? "");
  const loadAssignment = useCallback(async () => {
    const course = await getStudentCourseBySlug(subjectSlug);
    const assessment = course.sections.flatMap((section) => section.assessments.map((item) => ({ ...item, sectionTitle: section.title }))).find((item) => String(item.id) === assignmentId);
    if (!assessment) throw new ApiError("Tugas tidak ditemukan.", 404);
    return { course, assessment };
  }, [assignmentId, subjectSlug]);
  const resource = useStudentResource(loadAssignment);
  const b = `${base}/${subjectSlug}`;

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState("");

  if (resource.status === "loading") return <StudentLoading title="Memuat tugas..." />;
  if (resource.status === "error") return <StudentError resource={resource} />;
  if (resource.status === "empty") return <StudentEmpty title="Tugas tidak tersedia." />;
  const { assessment } = resource.data;

  function selectFile(selected?: File) {
    if (!selected) return;

    if (
      !isAllowedUploadExtension(selected.name, "studentAssessment") ||
      selected.size > MAX_UPLOAD_FILE_SIZE_BYTES
    ) {
      setError(`Gunakan ${uploadExtensionsLabel("studentAssessment")} maksimal ${MAX_UPLOAD_FILE_SIZE_LABEL}.`);
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
            {assessment.end_at ? `Tenggat ${new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(assessment.end_at))}` : "Informasi tenggat tidak tersedia dari API"}
          </span>

          <h1>
            {assessment.title}
          </h1>

          <div className="es-ad-description-copy"><Solar name="calendar" />{assessment.description ? <AssessmentInstructions content={assessment.description} /> : <p>Deskripsi tugas tidak tersedia dari API.</p>}</div>
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
                href="#"
                aria-disabled="true"
                download
                className="es-ad-download"
              >
                <Solar name="cloud-download" variant="bold" />
                Lampiran tidak tersedia
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

                setError("");
                setMessage("Backend belum menyediakan endpoint untuk mengunggah berkas tugas.");
              }}
            >
              <label
                className={`es-ad-dropzone ${
                  ""
                }`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  selectFile(event.dataTransfer.files[0]);
                }}
              >
                <input
                  type="file"
                  accept={uploadAccept("studentAssessment")}
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
                  <span className="is-limit">Maks {MAX_UPLOAD_FILE_SIZE_LABEL}</span>
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
                        &quot;Berkas hanya dipilih di perangkat; belum dikirim ke server.&quot;
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
                  onClick={() => {
                    if (!file) {
                      setError("Pilih berkas sebelum menyimpan draf.");
                      return;
                    }

                    setError("");
                    setMessage("Backend belum menyediakan endpoint penyimpanan draft tugas.");
                  }}
                >
                  Simpan Draf
                </button>

                <button
                  type="submit"
                  className="es-ad-submit"
                >
                  Kirim Tugas Sekarang
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
                className="es-ad-status-badge"
              >
                Status pengumpulan tidak tersedia dari API
              </span>
            </div>

            <div className="es-ad-countdown">
              <span>SISA WAKTU PENGERJAAN</span>

              <p>
                {assessment.end_at ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(assessment.end_at)) : "Tidak tersedia"}
              </p>
            </div>
          </Card>

          {/* Rubrik */}
          <Card className="es-ad-rubric-card">
            <h2>Rubrik Penilaian</h2>

            <div className="es-ad-rubric-weights">
              {([] as Array<{ label: string; weight: number }>).map((item) => (
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
              <strong>Informasi tidak tersedia dari API</strong>
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
  const resource = useStudentResource(loadStudentCourses, (data) => data.data.length === 0);
  if (resource.status === "loading") return <StudentLoading title="Memuat progres pembelajaran..." />;
  if (resource.status === "error") return <StudentError resource={resource} />;
  if (resource.status === "empty") return <StudentEmpty title="Mata pelajaran belum tersedia." />;

  const summary = [
    { label: "Progres Keseluruhan", value: "—", suffix: "", icon: "document-text", tone: "blue", hint: "Informasi progres tidak tersedia dari API." },
    { label: "Materi Selesai", value: "—", suffix: "", icon: "documents", tone: "blue", hint: "API tidak menyediakan riwayat penyelesaian materi." },
    { label: "Asesmen Tuntas", value: "—", suffix: "", icon: "check-circle", tone: "green", hint: "API tidak menyediakan riwayat asesmen." },
    { label: "Rata-rata Nilai", value: "—", suffix: "", icon: "cup", tone: "yellow", hint: "Informasi nilai tidak tersedia dari API." },
  ];

  const courses = resource.data.data.map((course) => ({
    id: studentCourseSlug(course.name),
    name: course.name,
    teacher: "Informasi guru tidak tersedia dari API.",
    score: "—",
    progress: 0,
    materials: "Informasi progres materi tidak tersedia dari API.",
    assessments: "Informasi progres asesmen tidak tersedia dari API.",
    complete: false,
  }));

  const rows: Array<{ id: number; type: string; title: string; date: string; subject: string; score: number | null; icon: string; href: string; action: string }> = [];
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
          Informasi semester tidak tersedia dari API
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
                    Riwayat pembelajaran tidak tersedia dari API backend.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="es-lp-results-footer">
          <span>
            Riwayat API: {filtered.length} entri
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

  const rows: Array<{ id: string | number; subjectId: string; subject: string; teacher?: string; title: string; topic?: string; date?: string; time?: string; order?: number; progress?: number; detail?: string; archived: boolean; href: string; type?: string; score?: number }> = [];

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
        ? (a.order ?? 0) - (b.order ?? 0)
        : (b.order ?? 0) - (a.order ?? 0),
    );

  return (
    <div className="es-mh">
      <div className="es-mh-heading">
        <h1>Riwayat Akses Materi Pembelajaran</h1>
        <p>
          API backend belum menyediakan endpoint riwayat akses atau penyelesaian materi.
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
            value: "—",
            icon: "documents",
            tone: "blue",
          },
          {
            label: "MODUL SELESAI",
            value: "—",
            icon: "check-circle",
            tone: "green",
          },
          {
            label: "ARSIP KELAS 7",
            value: "—",
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
            Informasi tingkat akses, arsip kelas sebelumnya, dan riwayat penyelesaian
            materi tidak tersedia melalui endpoint API role Siswa saat ini.
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
                    API backend belum menyediakan endpoint riwayat materi.
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

  const rows: Array<{ id: string | number; subjectId: string; subject: string; teacher?: string; title: string; topic?: string; date?: string; time?: string; order?: number; progress?: number; detail?: string; archived: boolean; href: string; type?: string; score?: number }> = [];

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
      sort === "oldest" ? String(b.id).localeCompare(String(a.id)) : String(a.id).localeCompare(String(b.id)),
    );

  return (
    <div className="es-mh es-ah">
      <div className="es-mh-heading">
        <h1>Riwayat & Arsip Nilai Asesmen</h1>
        <p>
          API backend belum menyediakan endpoint riwayat asesmen dan hasil terdahulu.
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
            <strong>—</strong>
          </div>

          <div className="es-ah-stat-hint">
            Riwayat asesmen tidak tersedia dari API.
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
            <strong>—</strong>
            <span>/ 100</span>
          </div>

          <div className="es-ah-stat-hint">
            Nilai tidak tersedia dari API.
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
            <strong>—</strong>
          </div>

          <div className="es-ah-stat-hint">
            Waktu pengerjaan tidak tersedia dari API.
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
                    API backend belum menyediakan endpoint riwayat asesmen.
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
  const [photoError, setPhotoError] = useState(true);
  const resource = useStudentResource(loadStudentProfilePage);
  if (resource.status === "loading") return <StudentLoading title="Memuat profil siswa..." />;
  if (resource.status === "error") return <StudentError resource={resource} />;
  if (resource.status === "empty") return <StudentEmpty title="Profil siswa belum tersedia." />;
  const { dashboard, user } = resource.data;
  const studentRecord = dashboard.student;
  const className = studentRecord.class_room?.name ?? "Belum ditetapkan";
  const birthDate = studentRecord.birth_date ? new Date(studentRecord.birth_date) : null;
  const birthDateLabel = birthDate && Number.isFinite(birthDate.getTime())
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(birthDate)
    : "Informasi tidak tersedia dari API";

  const identity = [
    ["Nama Lengkap", user.name],
    ["Tempat, Tanggal Lahir", birthDateLabel],
    ["NIS / NISN", studentRecord.nisn],
    ["Jenis Kelamin", "Informasi tidak tersedia dari API"],
    ["Agama", "Informasi tidak tersedia dari API"],
    ["NIK Siswa", "Informasi tidak tersedia dari API"],
  ];

  const academic = [
    ["Tahun Ajaran Aktif", "Informasi tidak tersedia dari API"],
    ["Tingkat & Kelas", `Kelas ${className}`],
    ["Status Keaktifan", studentRecord.is_active ? "Aktif" : "Tidak aktif"],
    ["Semester Berjalan", "Informasi tidak tersedia dari API"],
    ["Wali Kelas", "Informasi tidak tersedia dari API"],
  ];

  const parent = [
    ["Nama Ayah / Wali", "Informasi tidak tersedia dari API siswa"],
    ["Nomor WhatsApp Terdaftar", "Informasi tidak tersedia dari API siswa"],
    ["Email Orang Tua", "Informasi tidak tersedia dari API siswa"],
    ["Status Hubungan", "Informasi tidak tersedia dari API siswa"],
    ["Alamat Tinggal Sesuai KK", "Informasi tidak tersedia dari API siswa"],
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
              <span>{user.name.trim().split(/\s+/).slice(0, 2).map((name) => name[0]).join("").toUpperCase()}</span>
            ) : (
              <img
                src="/images/andi-pratama.jpg"
                alt={`Foto profil ${user.name}`}
                onError={() => setPhotoError(true)}
              />
            )}
          </div>

          <div className="es-sp-profile-copy">
            <h2>{user.name}</h2>

            <span className="es-sp-nisn">
              NISN: {studentRecord.nisn}
            </span>

            <span className="es-sp-class">
              Rombongan Belajar: Kelas {className}
            </span>

            <p className="es-sp-homeroom">
              <Solar name="user" />
              <span>
                Wali Kelas:{" "}
                <strong>Informasi tidak tersedia dari API.</strong>
              </span>
            </p>
          </div>
        </div>

        <div className="es-sp-profile-status">
          <span>
            <Solar name="check-circle" />
            {studentRecord.is_active ? "Siswa Aktif" : "Tidak Aktif"}
          </span>
          <p>Tingkat {dashboard.expected_grade ?? "—"}</p>
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
              API siswa hanya menyediakan sebagian data identitas.
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
