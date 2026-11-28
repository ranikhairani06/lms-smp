import type { Subject } from "./data";
import { apiRequest } from "@/lib/api";

export type TeacherSection = {
  id: number;
  title: string;
  materials?: TeacherMaterial[];
  assessments?: TeacherAssessment[];
};
export type TeacherMaterial = { id: number; title: string; type: string; target_grade: number; body?: string | null; file_path?: string | null; created_at?: string };
export type TeacherQuestion = { id: number; type: string; prompt: string; points: number; correct_answer?: string | boolean | null; explanation?: string | null; options?: { id?: number; text: string; is_correct?: boolean }[] };
export type TeacherAssessment = {
  id: number;
  title: string;
  assessment_type: "practice" | "midterm" | "final" | "daily_exam";
  target_grade: number;
  is_published: boolean;
  duration_minutes: number;
  end_at: string;
  passing_score?: number | null;
  start_at?: string | null;
  description?: string | null;
  section_id?: number;
  material_id?: number | null;
  maximum_attempt?: number;
  show_explanation_after_submission?: boolean;
  shuffle_questions?: boolean;
  shuffle_options?: boolean;
  questions?: TeacherQuestion[];
  course?: { id?: number; name?: string };
};
export type TeacherAssessmentType = TeacherAssessment["assessment_type"];
export type TeacherCourse = {
  id: number;
  name: string;
  description?: string | null;
  students_count?: number;
  sections?: TeacherSection[];
};
export type TeacherSubmission = {
  id: number;
  created_at?: string;
  score?: number | null;
  feedback?: string | null;
  student?: { id: number; nisn?: string; user?: { name?: string }; class_room?: { name?: string } | null };
  assessment?: TeacherAssessment;
  course?: TeacherCourse;
  answers?: unknown[];
};

export function submissionClassName(submission: TeacherSubmission) {
  return submission.student?.class_room?.name?.replace(/^Kelas\s+/i, "") || "";
}

export function submissionStudentName(submission: TeacherSubmission) {
  return submission.student?.user?.name || "—";
}

export function submissionStudentNumber(submission: TeacherSubmission) {
  return submission.student?.nisn || "—";
}

const roman = (grade: string) => ({ "7": "vii", "8": "viii", "9": "ix" }[grade] || "");
function normalized(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }

// Existing URLs use friendly slugs. Resolve only when the API course name identifies
// both the subject and grade; never fall back to an arbitrary course ID.
export function courseForSubject(courses: TeacherCourse[], subject: Subject) {
  const match = subject.id.match(/^(.*)-(7|8|9)$/);
  if (!match) return undefined;
  const [, subjectSlug, grade] = match;
  const terms = subjectSlug.split("-").filter(Boolean);
  const romanGrade = roman(grade);
  const matches = courses.filter(course => {
    const name = normalized(course.name);
    const hasSubject = terms.every(term => name.includes(term));
    const hasGrade = new RegExp(`(^| )(${grade}|${romanGrade})( |$)`, "i").test(name);
    return hasSubject && hasGrade;
  });
  return matches.length === 1 ? matches[0] : undefined;
}

export function gradeFromSubject(subject: Subject) {
  const match = subject.id.match(/-(7|8|9)$/);
  return match ? Number(match[1]) : undefined;
}

export function unwrapData<T>(response: unknown): T {
  return response && typeof response === "object" && "data" in response
    ? (response as { data: T }).data
    : response as T;
}

export function fieldErrorMessage(errors: Record<string, string[]>) {
  return Object.entries(errors).map(([field, messages]) => `${field}: ${messages.join(" ")}`).join(" ");
}

const courseSectionIds = new Map<number, number>();
const courseSectionRequests = new Map<number, Promise<number>>();

export async function ensureTeacherCourseSection(courseId: number, courseName: string, sections: TeacherSection[]) {
  if (sections.length > 1) throw new Error("Aksi tidak dapat dilakukan karena course memiliki lebih dari satu section.");
  if (sections.length === 1) {
    courseSectionIds.set(courseId, sections[0].id);
    return sections[0].id;
  }
  const savedId = courseSectionIds.get(courseId);
  if (savedId) return savedId;
  const pendingRequest = courseSectionRequests.get(courseId);
  if (pendingRequest) return pendingRequest;
  const title = courseName.trim().slice(0, 255);
  if (!title) throw new Error("Nama course tidak tersedia untuk membuat section.");
  const request = apiRequest<{ data?: { id?: number } }>(`teacher/courses/${courseId}/sections`, {
    method: "POST",
    body: JSON.stringify({ title }),
  }).then(response => {
    const id = response?.data?.id;
    if (!id) throw new Error("Section course belum dapat dibuat.");
    courseSectionIds.set(courseId, id);
    return id;
  }).finally(() => {
    courseSectionRequests.delete(courseId);
  });
  courseSectionRequests.set(courseId, request);
  return request;
}

const assessmentTypeByUiLabel: Record<string, TeacherAssessmentType> = {
  Latihan: "practice",
  Kuis: "practice",
  Tugas: "practice",
  UTS: "midterm",
  UAS: "final",
  "Ujian Harian": "daily_exam",
};

export function assessmentTypeForUiLabel(label: string) {
  return assessmentTypeByUiLabel[label];
}

export function displayDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
