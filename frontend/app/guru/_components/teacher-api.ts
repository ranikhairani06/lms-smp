import type { Subject } from "./data";

export type TeacherSection = {
  id: number;
  title: string;
  materials?: TeacherMaterial[];
  assessments?: TeacherAssessment[];
};
export type TeacherMaterial = { id: number; title: string; type: string; target_grade: number; body?: string | null; file_path?: string | null; created_at?: string };
export type TeacherQuestion = { id: number; type: string; prompt: string; points: number; correct_answer?: string | boolean | null; options?: { id?: number; text: string; is_correct?: boolean }[] };
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
  questions?: TeacherQuestion[];
  course?: { id?: number; name?: string };
};
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
  assessment?: TeacherAssessment;
  course?: TeacherCourse;
  answers?: unknown[];
};

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

export function displayDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
