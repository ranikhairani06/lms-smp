"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import { Button, PageHeading, Pagination, Panel, StatusBadge, adminStyles as s } from "@/app/admin/_components/AdminUI";
import { ApiError, apiRequest } from "@/lib/api";
import { EmptyState, ErrorState, LoadingState } from "@/components/lms/state";
import styles from "./page.module.css";

type AuditLog = { id: number; user?: { id: number; name?: string | null; username?: string | null; role?: string | null } | null; event: string; entity_type?: string | null; entity_id?: number | null; detail?: string | Record<string, unknown> | null; created_at: string };
type AuditPage = { data: AuditLog[]; current_page: number; last_page: number; total: number; per_page: number };

const EVENT_LABELS: Record<string, string> = {
  api_login: "Login ke sistem",
  login: "Login ke sistem",
  api_logout: "Logout dari sistem",
  logout: "Logout dari sistem",
  login_failed: "Percobaan login gagal",
  api_login_failed: "Percobaan login gagal",
  failed_login: "Percobaan login gagal",
  auth_failed: "Autentikasi gagal",
  password_changed: "Mengubah kata sandi",
  password_updated: "Mengubah kata sandi",
  student_password_reset: "Mereset kata sandi siswa",
  teacher_password_reset: "Mereset kata sandi guru",
  parent_password_reset: "Mereset kata sandi orang tua",
  academic_year_activated: "Mengaktifkan tahun ajaran",
  semester_activated: "Mengaktifkan semester",
  assessment_submitted: "Mengumpulkan tugas/ujian",
  exam_auto_submitted: "Pengumpulan ujian otomatis",
  students_imported: "Mengimpor data siswa",
};

const DETAIL_KEY_LABELS: Record<string, string> = {
  username: "Username",
  email: "Email",
  role: "Peran",
  reason: "Alasan",
  message: "Pesan",
  status: "Status",
  name: "Nama",
  ip: "IP",
  ip_address: "IP",
  device_name: "Perangkat",
  count: "Jumlah",
  total: "Total",
};

function formatEventLabel(event?: string | null): string {
  const key = typeof event === "string" ? event.trim() : "";
  if (!key) return "";
  const normalized = key.toLowerCase();
  if (EVENT_LABELS[normalized]) return EVENT_LABELS[normalized];
  const words = key.replace(/^api_/i, "").replace(/[_-]+/g, " ").trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : "";
}

function formatDetailValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(formatDetailValue).filter(Boolean).join(", ");
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => {
        const formatted = formatDetailValue(item);
        if (!formatted) return "";
        const label = DETAIL_KEY_LABELS[key.toLowerCase()] ?? key.replace(/[_-]+/g, " ").replace(/^./, (char) => char.toUpperCase());
        return `${label}: ${formatted}`;
      })
      .filter(Boolean)
      .join(", ");
  }
  return "";
}

function formatDetail(detail: unknown): string {
  if (detail === null || detail === undefined) return "";
  if (typeof detail === "string") {
    const trimmed = detail.trim();
    if (!trimmed) return "";
    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
      try {
        return formatDetailValue(JSON.parse(trimmed));
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  return formatDetailValue(detail);
}

function formatActivityDescription(row: AuditLog): string {
  const eventLabel = formatEventLabel(row.event);
  const detailText = formatDetail(row.detail);
  if (eventLabel && detailText) {
    if (eventLabel.toLowerCase() === detailText.toLowerCase()) return eventLabel;
    return `${eventLabel} (${detailText})`;
  }
  return eventLabel || detailText || "—";
}

function normalizeAuditPage(value: unknown): AuditPage {
  const response = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const nested = response.data && !Array.isArray(response.data) && typeof response.data === "object"
    ? response.data as Record<string, unknown>
    : response;
  const meta = nested.meta && typeof nested.meta === "object" ? nested.meta as Record<string, unknown> : {};
  const data = Array.isArray(nested.data) ? nested.data as AuditLog[] : Array.isArray(response.data) ? response.data as AuditLog[] : [];
  const numberOr = (candidate: unknown, fallback: number) => typeof candidate === "number" && Number.isFinite(candidate) ? candidate : fallback;
  return {
    data,
    current_page: numberOr(nested.current_page ?? meta.current_page, 1),
    last_page: Math.max(1, numberOr(nested.last_page ?? meta.last_page, 1)),
    total: numberOr(nested.total ?? meta.total, data.length),
    per_page: numberOr(nested.per_page ?? meta.per_page, 20),
  };
}

const dateRange = (range: string) => {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const fromDate = new Date(now);
  if (range === "7 Hari Terakhir") fromDate.setDate(now.getDate() - 6);
  else if (range === "30 Hari Terakhir") fromDate.setDate(now.getDate() - 29);
  else if (range === "Bulan Ini") fromDate.setDate(1);
  else return { from: "", to: "" };
  return { from: fromDate.toISOString().slice(0, 10), to };
};
const textOrDash = (value: unknown) => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value.trim() || "—";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try { return JSON.stringify(value) || "—"; }
  catch { return "—"; }
};
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "—";

export default function LaporanAktivitasPage() {
  const router = useRouter();
  const [result, setResult] = useState<AuditPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState("7 Hari Terakhir");
  const [role, setRole] = useState("Semua Peran");
  const [status, setStatus] = useState("Semua Status");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ range: "7 Hari Terakhir", role: "Semua Peran", status: "Semua Status" });

  const load = useCallback(async (targetPage: number) => {
    setLoading(true); setError(null);
    const params = new URLSearchParams({ page: String(targetPage), per_page: "20" });
    const dates = dateRange(filters.range);
    if (dates.from) params.set("date_from", dates.from);
    if (dates.to) params.set("date_to", dates.to);
    try { setResult(normalizeAuditPage(await apiRequest<unknown>(`admin/audit-logs?${params.toString()}`))); }
    catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) router.replace("/login?role=admin&reason=session-expired");
      setError(cause instanceof Error ? cause.message : "Data aktivitas belum dapat dimuat.");
      if (cause instanceof ApiError && cause.status === 404) setResult(null);
    } finally { setLoading(false); }
  }, [filters.range, router]);
  useEffect(() => { void Promise.resolve().then(() => load(page)); }, [load, page]);

  const rows = useMemo(() => result?.data ?? [], [result]);
  const filtered = useMemo(() => rows.filter((row) => {
    const rowRole = row.user?.role === "admin" ? "Super Admin" : row.user?.role === "parent" ? "Orang Tua" : row.user?.role === "teacher" ? "Guru" : row.user?.role === "student" ? "Siswa" : textOrDash(row.user?.role);
    const matchesRole = filters.role === "Semua Peran" || rowRole === filters.role;
    // Kontrak audit log tidak menyimpan status sukses/gagal.
    const matchesStatus = filters.status === "Semua Status";
    return matchesRole && matchesStatus;
  }), [filters, rows]);

  const exportLogs = () => {
    const csv = [["Timestamp", "User", "Role", "Module", "Status", "Description"], ...filtered.map((row) => [row.created_at, row.user?.name || row.user?.username || "", row.user?.role || "", row.entity_type || "", "", formatActivityDescription(row)])]
      .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "laporan-aktivitas.csv"; link.click(); URL.revokeObjectURL(url);
  };

  return <>
    <PageHeading breadcrumbs={["LMS", "Laporan"]} title="Laporan Aktivitas Pengguna" description="Riwayat aktivitas pengguna di sistem. Hanya dapat dilihat." variant="card" actions={<Button className={styles.exportButton} icon="table-linear" onClick={exportLogs}>Ekspor Log (XLS)</Button>} />
    <Panel className={styles.filterPanel}><div className={styles.filterGrid}>
      <label className={styles.filterItem}><span className={styles.filterLabel}><AdminIcon name="calendar-linear" size={12} /> Rentang Tanggal</span><span className={styles.selectWrap}><select className={styles.filterSelect} value={range} onChange={(event) => setRange(event.target.value)}><option>7 Hari Terakhir</option><option>30 Hari Terakhir</option><option>Bulan Ini</option><option>Semua Waktu</option></select><AdminIcon name="alt-arrow-down-linear" size={16} /></span></label>
      <label className={styles.filterItem}><span className={styles.filterLabel}><AdminIcon name="users-group-rounded-linear" size={12} /> Peran Pengguna</span><span className={styles.selectWrap}><select className={styles.filterSelect} value={role} onChange={(event) => setRole(event.target.value)}><option>Semua Peran</option>{[["admin", "Super Admin"], ["teacher", "Guru"], ["parent", "Orang Tua"], ["student", "Siswa"]].map(([apiRole, label]) => rows.some((row) => row.user?.role === apiRole) && <option key={apiRole}>{label}</option>)}</select><AdminIcon name="alt-arrow-down-linear" size={16} /></span></label>
      <label className={styles.filterItem}><span className={styles.filterLabel}><AdminIcon name="check-circle-linear" size={12} /> Status</span><span className={styles.selectWrap}><select className={styles.filterSelect} value={status} onChange={(event) => setStatus(event.target.value)}><option>Semua Status</option><option>Berhasil</option><option>Gagal</option></select><AdminIcon name="alt-arrow-down-linear" size={16} /></span></label>
      <div className={styles.filterActions}><Button className={styles.applyFilterButton} icon="slider-horizontal-linear" onClick={() => { setFilters({ range, role, status }); setPage(1); }}>Terapkan Filter</Button><Button className={styles.resetButton} variant="ghost" icon="refresh-linear" onClick={() => { setRange("7 Hari Terakhir"); setRole("Semua Peran"); setStatus("Semua Status"); setFilters({ range: "7 Hari Terakhir", role: "Semua Peran", status: "Semua Status" }); setPage(1); }}>Reset</Button></div>
    </div></Panel>
    {loading ? <LoadingState title="Memuat laporan aktivitas..." /> : error ? <ErrorState title={error} action={<Button variant="outline" onClick={() => void load(page)}>Coba Lagi</Button>} /> : !rows.length ? <EmptyState title="Belum ada aktivitas" description="Belum ada data aktivitas yang tersedia." /> : <Panel className={styles.activityTablePanel}>
      <div className={styles.activityTableTitle}><span className={styles.activityTitleIcon}><AdminIcon name="history-linear" size={20} /></span><h2>Tabel Riwayat Aktivitas</h2></div>
      {filtered.length === 0 ? <EmptyState title="Tidak ada aktivitas yang cocok" description="Ubah filter untuk melihat aktivitas lainnya." /> : <div className={`${s.tableWrap} ${styles.activityTableWrap}`}><table className={`${s.dataTable} ${styles.activityTable}`}>
        <thead><tr><th><span className={styles.timestampHeading}>Timestamp (WIB)<AdminIcon name="alt-arrow-down-linear" size={12} /></span></th><th>Pengguna &amp; Identitas</th><th>Peran</th><th>Deskripsi Aktivitas</th><th>Status</th></tr></thead>
        <tbody>{filtered.map((row) => { const name = row.user?.name || row.user?.username || "—"; const apiRole = row.user?.role || ""; const displayRole = apiRole === "admin" ? "Super Admin" : apiRole === "parent" ? "Orang Tua" : apiRole === "teacher" ? "Guru" : apiRole === "student" ? "Siswa" : "—"; const description = formatActivityDescription(row); return <tr key={row.id}>
          <td><span className={styles.activityTimestamp}><AdminIcon name="clock-circle-linear" size={13} /> {new Date(row.created_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}</span></td>
          <td><div className={styles.activityIdentity}><span className={styles.activityAvatar} data-role={displayRole}>{initials(name)}</span><span className={styles.activityIdentityText}><span className={styles.activityName}>{name}</span><span className={s.tableSub}>{textOrDash(row.user?.username)}</span></span></div></td>
          <td><StatusBadge className={styles.roleBadge} tone={displayRole === "Super Admin" ? "primary" : displayRole === "Guru" ? "info" : displayRole === "Siswa" ? "success" : "warning"}>{displayRole}</StatusBadge></td>
          <td><span className={styles.activityDescription} title={description}>{description}</span></td>
          <td><span className={styles.activityStatus}>—</span></td>
        </tr>; })}</tbody>
      </table></div>}
      {result && <Pagination className={styles.activityPagination} controlsClassName={styles.activityPageControls} current={result.current_page} total={result.last_page} onChange={setPage} label={`Menampilkan ${result.data.length} dari ${result.total} log aktivitas`} emphasizeLabelNumbers trailingEllipsis />}
    </Panel>}
  </>;
}
