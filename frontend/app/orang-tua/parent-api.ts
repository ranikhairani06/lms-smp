import { redirect } from "next/navigation";
import { cache } from "react";
import { BackendError, backendRequest, requireUser, sessionToken } from "@/lib/backend";

type RecordValue = Record<string, unknown>;

export type ParentSubmissionRow = {
  id: string;
  courseName: string;
  slug: string;
  assessmentName: string;
  assessmentType: string;
  score: number | null;
};

export type ParentDashboardData = {
  student: RecordValue | null;
  courseProgress: unknown[];
  submissions: ParentSubmissionRow[];
  alerts: unknown[];
};

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function record(value: unknown): RecordValue {
  return isRecord(value) ? value : {};
}

export function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function number(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function display(value: string | number | null | undefined): string {
  return value === null || value === undefined || value === "" ? "—" : String(value);
}

export function studentName(student: RecordValue | null): string {
  if (!student) return "—";
  return text(record(student.user).name) ?? text(student.name) ?? "—";
}

export function studentNisn(student: RecordValue | null): string {
  return text(student?.nisn) ?? "—";
}

export function studentClass(student: RecordValue | null): string {
  return text(record(student?.class_room).name) ?? "—";
}

function slugify(value: string) {
  return value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function assessmentCategory(type: string) {
  if (type === "practice") return "Tugas";
  if (type === "daily_exam") return "Formatif";
  if (type === "midterm") return "UTS";
  if (type === "final") return "UAS";
  return "—";
}

export const getParentDashboard = cache(async function getParentDashboardData(): Promise<ParentDashboardData> {
  await requireUser("parent");
  const token = await sessionToken();
  if (!token) redirect("/login?role=parent&reason=session-expired");

  try {
    const response = await backendRequest<{ data?: RecordValue }>("parent/dashboard", {}, token);
    const data = record(response.data);
    const student = isRecord(data.student) ? data.student : null;
    const courseProgress = Array.isArray(data.course_progress) ? data.course_progress : [];
    const submissions = (Array.isArray(data.submissions) ? data.submissions : []).flatMap((value, index) => {
      if (!isRecord(value)) return [];
      const assessment = record(value.assessment);
      const course = record(value.course);
      const courseName = text(course.name);
      const assessmentName = text(assessment.title);
      const assessmentType = text(assessment.assessment_type);
      if (!courseName || !assessmentName || !assessmentType) return [];
      return [{
        id: String(value.id ?? index),
        courseName,
        slug: slugify(courseName),
        assessmentName,
        assessmentType,
        score: number(value.score),
      }];
    });

    return {
      student,
      courseProgress,
      submissions,
      alerts: Array.isArray(data.alerts) ? data.alerts : [],
    };
  } catch (error) {
    if (error instanceof BackendError && error.status === 401) {
      redirect("/login?role=parent&reason=session-expired");
    }
    if (error instanceof BackendError) {
      if (error.status === 403) throw new BackendError("Anda tidak memiliki izin untuk melihat data ini.", 403);
      if (error.status === 404) throw new BackendError("Data orang tua belum ditemukan.", 404);
      if (error.status === 422) throw new BackendError("Permintaan data tidak dapat diproses.", 422);
      if (error.status >= 500) throw new BackendError("Server sedang mengalami gangguan. Silakan coba lagi.", error.status);
    }
    throw error;
  }
});

export function parentSubjects(submissions: ParentSubmissionRow[]) {
  const grouped = new Map<string, ParentSubmissionRow[]>();
  submissions.forEach((submission) => {
    const entries = grouped.get(submission.slug) ?? [];
    entries.push(submission);
    grouped.set(submission.slug, entries);
  });
  return [...grouped.entries()].map(([slug, entries]) => {
    const scored = (category: string) => entries.map((entry) => entry.assessmentType === category ? entry.score : null).filter((score): score is number => score !== null);
    const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
    const task = average(scored("practice"));
    const formative = average(scored("daily_exam"));
    const uts = average(scored("midterm"));
    const final = average(scored("final"));
    const courseName = entries[0]?.courseName ?? "";
    const allScores = entries.map((entry) => entry.score).filter((score): score is number => score !== null);
    return {
      slug,
      name: courseName,
      teacher: "—",
      task,
      formative,
      uts,
      final,
      average: null as number | null,
      status: "—",
      submissionCount: entries.length,
      scoredCount: allScores.length,
    };
  });
}
