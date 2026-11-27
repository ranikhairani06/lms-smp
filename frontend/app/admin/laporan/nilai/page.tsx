"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import { AvatarInitials, Button, PageHeading, Pagination, Panel, ScoreChip, StatCard, StatusBadge } from "@/app/admin/_components";
import { adminStyles as s } from "@/app/admin/_components/AdminUI";
import { useAdminResource } from "@/app/admin/_components/useAdminApi";
import { ApiError, apiRequest } from "@/lib/api";
import { EmptyState, ErrorState, LoadingState } from "@/components/lms/state";
import styles from "./page.module.css";

type Submission = { submission_id: number; student_id: number; student_name?: string | null; nisn?: string | null; class_room_id?: number | null; class_room_name?: string | null; grade_level?: number | null; academic_year_id?: number | null; subject_id?: number | null; subject_name?: string | null; teacher_name?: string | null; assessment_id?: number | null; assessment_title?: string | null; assessment_type?: string | null; submitted_at?: string | null; score?: number | null; kktp?: number | null; kktp_status?: string | null };
type Report = { summary?: { total_submissions?: number; graded_count?: number; passed_count?: number; failed_count?: number }; submissions?: Submission[] };
type AcademicYear = { id: number; name: string; start_year: number; is_active: boolean };
type Semester = { id: number; academic_year_id: number; semester_number: number; name: string; start_date?: string | null; end_date?: string | null; is_active: boolean; academicYear?: { id: number; name: string; start_year: number } };
type ClassRoom = { id: number; name: string; grade_level?: number };
type Subject = { id: number; name: string; code?: string };

const text = (value?: string | number | null) => value === null || value === undefined || value === "" ? "—" : String(value);
const formatNumber = (value?: number | null) => typeof value === "number" ? value.toFixed(1) : "—";

export default function LaporanNilaiPage() {
  const router = useRouter();
  const years = useAdminResource<AcademicYear[]>("academic-years");
  const semesters = useAdminResource<Semester[]>("semesters");
  const classes = useAdminResource<ClassRoom[]>("classes");
  const subjectsResource = useAdminResource<Subject[]>("subjects");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState("all");
  const [level, setLevel] = useState("all");
  const [rombel, setRombel] = useState("all");
  const [subject, setSubject] = useState("all");
  const [page, setPage] = useState(1);
  const [applied, setApplied] = useState({ year: "all", level: "all", rombel: "all", subject: "all" });

  const loadReport = async () => {
    setLoading(true); setError(null);
    try { const response = await apiRequest<{ data: Report }>("admin/grades/report"); setReport(response.data); }
    catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) router.replace("/login?role=admin&reason=session-expired");
      setError(cause instanceof Error ? cause.message : "Laporan nilai belum dapat dimuat.");
      if (cause instanceof ApiError && cause.status === 404) setReport(null);
    } finally { setLoading(false); }
  };
  useEffect(() => { void Promise.resolve().then(() => loadReport()); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allRows = useMemo(() => report?.submissions ?? [], [report]);
  const filtered = useMemo(() => allRows.filter((row) => {
    const [yearId, semesterId] = applied.year === "all" ? ["all", "all"] : applied.year.split(":");
    const selectedSemester = semesters.data?.find((item) => String(item.id) === semesterId);
    const yearMatch = yearId === "all" || String(row.academic_year_id ?? "") === yearId;
    const submittedDate = row.submitted_at?.slice(0, 10);
    const semesterMatch = !selectedSemester || !submittedDate || ((!selectedSemester.start_date || submittedDate >= selectedSemester.start_date.slice(0, 10)) && (!selectedSemester.end_date || submittedDate <= selectedSemester.end_date.slice(0, 10)));
    const levelMatch = applied.level === "all" || String(row.grade_level ?? "") === applied.level;
    const classMatch = applied.rombel === "all" || String(row.class_room_id ?? "") === applied.rombel;
    const subjectMatch = applied.subject === "all" || String(row.subject_id ?? "") === applied.subject;
    return yearMatch && semesterMatch && levelMatch && classMatch && subjectMatch;
  }), [allRows, applied, semesters.data]);
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const passed = filtered.filter((row) => row.kktp_status === "tuntas").length;
  const failed = filtered.filter((row) => row.kktp_status === "belum_tuntas").length;
  const subjectRows = useMemo(() => {
    const grouped = new Map<string, { subject: string; className: string; teacher: string; values: number[]; passed: number; failed: number }>();
    for (const row of filtered) {
      const key = `${row.subject_id ?? ""}:${row.class_room_id ?? ""}`;
      const item = grouped.get(key) ?? { subject: row.subject_name || "—", className: row.class_room_name || "—", teacher: row.teacher_name || "—", values: [], passed: 0, failed: 0 };
      if (typeof row.score === "number") item.values.push(row.score);
      if (row.kktp_status === "tuntas") item.passed += 1;
      if (row.kktp_status === "belum_tuntas") item.failed += 1;
      grouped.set(key, item);
    }
    return [...grouped.values()].map((item) => ({ ...item, average: item.values.length ? item.values.reduce((sum, n) => sum + n, 0) / item.values.length : null }));
  }, [filtered]);

  const queryString = () => {
    const params = new URLSearchParams();
    if (applied.year !== "all") params.set("academic_year_id", applied.year);
    if (applied.rombel !== "all") params.set("class_room_id", applied.rombel);
    if (applied.subject !== "all") params.set("subject_id", applied.subject);
    return params.toString();
  };
  const exportReport = async () => {
    try {
      const query = queryString();
      const response = await fetch(`/api/admin/grades/export${query ? `?${query}` : ""}`, { credentials: "same-origin", cache: "no-store" });
      if (response.status === 401) { router.replace("/login?role=admin&reason=session-expired"); return; }
      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        const body = contentType.includes("json") ? await response.json().catch(() => null) : null;
        setError(response.status === 403 ? "Anda tidak memiliki izin untuk melakukan tindakan ini." : response.status === 404 ? "Data yang diminta tidak ditemukan." : response.status >= 500 ? "Server sedang mengalami gangguan. Silakan coba lagi." : body?.message || "Ekspor laporan gagal.");
        if (response.status === 404) await loadReport();
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "laporan-nilai.xlsx"; link.click(); URL.revokeObjectURL(url);
    } catch { setError("Tidak dapat terhubung ke server. Silakan coba lagi."); }
  };
  const applyFilters = () => { setApplied({ year, level, rombel, subject }); setPage(1); };
  const resetFilters = () => { setYear("all"); setLevel("all"); setRombel("all"); setSubject("all"); setApplied({ year: "all", level: "all", rombel: "all", subject: "all" }); setPage(1); };
  const dataLoading = loading || years.loading || semesters.loading || classes.loading || subjectsResource.loading;
  const dataError = error || years.error || semesters.error || classes.error || subjectsResource.error;

  return <>
    <PageHeading className={styles.pageHeader} breadcrumbs={["LMS", "Laporan"]} title="Laporan Nilai & Ketercapaian Hasil Belajar" description="Rekapitulasi nilai formatif, UTS, UAS, dan capaian KKTP. Data terhubung otomatis dengan data kelas dan siswa." variant="card" actions={<Button className={styles.exportButton} icon="table-linear" onClick={() => void exportReport()}>Ekspor Log (XLS)</Button>} />
    <Panel className={styles.filterPanel}><div className={styles.filterGrid}>
      <label className={styles.filterItem}><span className={styles.filterLabel}><AdminIcon name="calendar-linear" size={13} /> Tahun Ajaran</span><span className={styles.selectWrap}><select value={year} onChange={(event) => setYear(event.target.value)}><option value="all">Semua Tahun Ajaran</option>{(semesters.data ?? []).map((semester) => { const yearName = semester.academicYear?.name || years.data?.find((item) => item.id === semester.academic_year_id)?.name || "—"; return <option key={semester.id} value={`${semester.academic_year_id}:${semester.id}`}>{yearName} {semester.name}</option>; })}{(years.data ?? []).filter((item) => !(semesters.data ?? []).some((semester) => semester.academic_year_id === item.id)).map((item) => <option key={`year-${item.id}`} value={`${item.id}:all`}>{item.name}</option>)}</select><AdminIcon name="alt-arrow-down-linear" size={16} /></span></label>
      <label className={styles.filterItem}><span className={styles.filterLabel}><AdminIcon name="buildings-2-linear" size={13} /> Tingkat</span><span className={styles.selectWrap}><select value={level} onChange={(event) => setLevel(event.target.value)}><option value="all">Semua Tingkat</option>{[7, 8, 9].map((value) => <option key={value} value={value}>Kelas {value === 7 ? "VII" : value === 8 ? "VIII" : "IX"}</option>)}</select><AdminIcon name="alt-arrow-down-linear" size={16} /></span></label>
      <label className={styles.filterItem}><span className={styles.filterLabel}><AdminIcon name="users-group-rounded-linear" size={13} /> Rombongan Belajar</span><span className={styles.selectWrap}><select value={rombel} onChange={(event) => setRombel(event.target.value)}><option value="all">Semua Rombel</option>{(classes.data ?? []).filter((item) => level === "all" || String(item.grade_level) === level).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><AdminIcon name="alt-arrow-down-linear" size={16} /></span></label>
      <label className={styles.filterItem}><span className={styles.filterLabel}><AdminIcon name="widget-2-linear" size={13} /> Mata Pelajaran</span><span className={styles.selectWrap}><select value={subject} onChange={(event) => setSubject(event.target.value)}><option value="all">Semua Mapel</option>{(subjectsResource.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><AdminIcon name="alt-arrow-down-linear" size={16} /></span></label>
      <div className={styles.filterActions}><Button className={styles.applyFilterButton} icon="slider-horizontal-linear" onClick={applyFilters}>Terapkan Filter</Button><Button className={styles.resetButton} variant="ghost" icon="refresh-linear" onClick={resetFilters}>Reset</Button></div>
    </div></Panel>
    {dataLoading ? <LoadingState title="Memuat laporan nilai..." /> : dataError ? <ErrorState title={dataError} action={<Button variant="outline" onClick={() => { void loadReport(); void years.reload(); void semesters.reload(); void classes.reload(); void subjectsResource.reload(); }}>Coba Lagi</Button>} /> : <>
      <div className={s.reportStats}>
        <StatCard variant="report" label="Tuntas KKTP" value={text(passed)} valueNote="Penilaian" footer="—" footerTone="success" icon="check-circle-linear" tone="success" />
        <StatCard variant="report" label="Perlu Perhatian" value={text(failed)} footer="—" footerTone="warning" icon="danger-triangle-linear" tone="warning" />
        <StatCard variant="report" label="Total Mata Pelajaran" value={`${subjectsResource.data?.length ?? 0} Mata Pelajaran`} valueFullWidth icon="book-2-linear" tone="primary" hideEmptyDetail />
        <StatCard variant="report" label="Asesmen Aktif" value="—" footer="—" footerTone="warning" icon="clipboard-check-linear" tone="warning" />
      </div>
      <Panel className={styles.reportPanel}><div className={styles.panelTitle}><h2>Hasil Penilaian Siswa</h2></div><div className={styles.tableWrap}>
        {filtered.length === 0 ? <EmptyState title="Belum ada hasil penilaian" description="Tidak ada pengumpulan nilai untuk filter yang dipilih." /> : <table className={`${s.dataTable} ${styles.gradeTable}`}><colgroup><col /><col /><col /><col /><col /><col /><col /><col /></colgroup>
          <thead><tr><th><span className={styles.sortHeading}>Nama Siswa <AdminIcon name="sort-linear" size={12} /></span></th><th><span className={styles.sortHeading}>NISN <AdminIcon name="sort-linear" size={12} /></span></th><th>Kelas</th><th>Formatif</th><th>UTS</th><th>UAS</th><th className={styles.numericHeading}>Nilai Akhir</th><th>Keterangan KKTP</th></tr></thead>
          <tbody>{currentRows.map((row) => {
            const score = formatNumber(row.score);
            const category = row.assessment_type === "practice" ? "formatif" : row.assessment_type === "midterm" ? "uts" : row.assessment_type === "final" ? "uas" : "none";
            const result = row.kktp_status === "tuntas" ? "Tuntas" : row.kktp_status === "belum_tuntas" ? "Belum Tuntas" : row.kktp_status === "belum_dinilai" ? "Belum Dinilai" : row.kktp_status === "tidak_ada_kktp" ? "Tidak Ada KKTP" : "—";
            const tone = result === "Tuntas" ? "success" : result === "Belum Tuntas" ? "warning" : "neutral";
            return <tr key={row.submission_id}><td><div className={styles.studentIdentity}><AvatarInitials initials={(row.student_name || "—").split(/\s+/).slice(0, 2).map((part) => part[0]).join("")} tone="primary" /><span><strong>{text(row.student_name)}</strong><small>NISN: {text(row.nisn)}</small></span></div></td><td>{text(row.nisn)}</td><td>{text(row.class_room_name)}</td><td className={styles.numericCell}>{category === "formatif" ? score : "—"}</td><td className={styles.numericCell}>{category === "uts" ? score : "—"}</td><td className={styles.numericCell}>{category === "uas" ? score : "—"}</td><td className={styles.numericCell}>{"—"}</td><td><StatusBadge className={styles.statusPill} tone={tone}><AdminIcon name={result === "Tuntas" ? "check-circle-bold" : "danger-triangle-bold"} size={12} />{result}</StatusBadge></td></tr>;
          })}</tbody>
        </table>}
      </div><Pagination className={styles.pagination} controlsClassName={styles.pageControls} currentPageClassName={styles.currentPage} current={page} total={pageCount} variant="directory" onChange={setPage} label={`Menampilkan ${currentRows.length} dari ${filtered.length} pengumpulan`} emphasizeLabelNumbers /></Panel>
      <Panel className={styles.reportPanel}><div className={styles.panelTitle}><h2>Ringkasan Pembelajaran per Mata Pelajaran</h2></div><div className={styles.tableWrap}>
        {subjectRows.length === 0 ? <EmptyState title="Belum ada ringkasan pembelajaran" description="Data ringkasan akan tampil setelah ada pengumpulan nilai." /> : <table className={`${s.dataTable} ${styles.subjectTable}`}><colgroup><col /><col /><col /><col /><col /><col /><col /></colgroup>
          <thead><tr><th><span className={styles.sortHeading}>Mata Pelajaran / Rombel <AdminIcon name="sort-linear" size={12} /></span></th><th>Guru Pengampu</th><th>Modul</th><th>Asesmen Aktif</th><th>Rata-rata Progres</th><th className={styles.numericHeading}>Rata-rata Nilai</th><th>Keterangan KKTP</th></tr></thead>
          <tbody>{subjectRows.map((row) => { const evaluated = row.passed + row.failed; const kktpResult = evaluated > 0 && row.passed === evaluated ? "Tuntas" : evaluated > 0 && row.failed === evaluated ? "Perlu Perhatian" : "—"; return <tr key={`${row.subject}-${row.className}`}>
            <td><span className={styles.subjectIdentity}><strong>{row.subject}</strong><small>{row.className}</small></span></td><td><div className={styles.teacherIdentity}><AvatarInitials initials={row.teacher.split(/\s+/).slice(0, 2).map((part) => part[0]).join("")} tone="primary" /><span><strong>{row.teacher}</strong><small>—</small></span></div></td><td className={styles.moduleCell}>—</td><td><StatusBadge className={styles.assessmentPill} tone="info">—</StatusBadge></td><td><div className={styles.progressCell}><span>—</span></div></td><td className={styles.numericCell}>{row.average === null ? "—" : row.average < 75 ? <ScoreChip>{row.average.toFixed(1)}</ScoreChip> : <strong>{row.average.toFixed(1)}</strong>}</td><td><StatusBadge className={styles.statusPill} tone={kktpResult === "Tuntas" ? "success" : kktpResult === "Perlu Perhatian" ? "warning" : "neutral"}><AdminIcon name={kktpResult === "Tuntas" ? "check-circle-linear" : "danger-triangle-linear"} size={12} />{kktpResult}</StatusBadge></td>
          </tr>; })}</tbody>
        </table>}
      </div><Pagination className={styles.pagination} controlsClassName={styles.pageControls} currentPageClassName={styles.currentPage} current={1} total={1} onChange={() => undefined} label={`Menampilkan ${subjectRows.length} ringkasan`} emphasizeLabelNumbers /></Panel>
    </>}
  </>;
}
