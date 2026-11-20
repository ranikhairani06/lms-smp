import { ApiError, apiRequest } from "@/lib/api";
import type { AuthUser } from "@/lib/auth-types";

export type StudentClass = {
  id: number;
  name: string;
  grade_level: number;
  is_active: boolean;
  academic_year_id?: number | null;
};

export type StudentRecord = {
  id: number;
  nisn: string;
  birth_date: string | null;
  cohort_year: number;
  class_room_id: number | null;
  is_active: boolean;
  is_graduated: boolean;
  class_room: StudentClass | null;
};

export type StudentCourse = {
  id: number;
  teacher_id: number | null;
  name: string;
  description: string | null;
  target_grade: number;
  is_active: boolean;
  sections?: StudentSection[];
};

export type StudentSection = {
  id: number;
  title: string;
  position: number;
  materials: StudentMaterial[];
  assessments: StudentAssessmentSummary[];
};

export type StudentMaterial = {
  id: number;
  section_id: number;
  title: string;
  type: string;
  body: string | null;
  file_path: string | null;
  target_grade: number;
};

export type StudentAssessmentSummary = {
  id: number;
  section_id: number;
  title: string;
  description: string | null;
  target_grade: number;
  is_exam: boolean;
  duration_minutes: number | null;
  start_at: string | null;
  end_at: string | null;
  maximum_attempt: number;
  passing_score: number | null;
};

export type StudentQuestionOption = {
  id: number;
  question_id: number;
  option_text: string;
  is_correct?: boolean;
};

export type StudentQuestion = {
  id: number;
  assessment_id: number;
  type: string;
  prompt: string;
  points: number;
  position: number;
  options: StudentQuestionOption[];
};

export type StudentAssessment = StudentAssessmentSummary & {
  questions: StudentQuestion[];
};

export type StudentExamSession = {
  id: number;
  assessment_id: number;
  student_id: number;
  started_at: string;
  expires_at: string;
  submitted_at: string | null;
  status: string;
};

export type StudentDashboard = {
  student: StudentRecord;
  expected_grade: number | null;
  class_update_required: boolean;
  courses: StudentCourse[];
};

export type StudentCoursesResponse = {
  data: StudentCourse[];
  expected_grade: number | null;
};

export type StudentCourseDetail = StudentCourse & { sections: StudentSection[] };

export type StudentAssessmentResponse = {
  assessment: StudentAssessment;
  can_attempt: boolean;
  exam_session: StudentExamSession | null;
  remaining_seconds: number | null;
};

export type StudentProfileData = {
  classes: StudentClass[];
  questions: Array<{ id: number; code: string; prompt: string; material_keyword: string | null }>;
  recommendations: string[];
};

export type StudentSubmission = {
  id: number;
  assessment_id: number;
  student_id: number;
  attempt_no: number;
  submitted_at: string;
  score: number | null;
  status: string;
  feedback: string | null;
};

export async function getCurrentStudentUser(): Promise<AuthUser> {
  const response = await apiRequest<{ user: AuthUser }>("me");
  if (!response?.user || response.user.role !== "student") {
    throw new ApiError("Data akun siswa tidak dapat diproses.", 502);
  }
  return response.user;
}

type DataEnvelope<T> = { data: T };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function required<T>(value: unknown, check: (input: unknown) => input is T, label: string): T {
  if (!check(value)) throw new ApiError(`Data ${label} tidak dapat diproses.`, 502);
  return value;
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

function isStudentClass(value: unknown): value is StudentClass {
  return isRecord(value) && isNumber(value.id) && isString(value.name) && isNumber(value.grade_level) && typeof value.is_active === "boolean";
}

function isStudentRecord(value: unknown): value is StudentRecord {
  return isRecord(value) && isNumber(value.id) && isString(value.nisn) && isNullableString(value.birth_date) &&
    isNumber(value.cohort_year) && (value.class_room_id === null || isNumber(value.class_room_id)) &&
    typeof value.is_active === "boolean" && typeof value.is_graduated === "boolean" &&
    (value.class_room === null || isStudentClass(value.class_room));
}

function isCourse(value: unknown): value is StudentCourse {
  return isRecord(value) && isNumber(value.id) && (value.teacher_id === null || isNumber(value.teacher_id)) &&
    isString(value.name) && isNullableString(value.description) && isNumber(value.target_grade) && typeof value.is_active === "boolean";
}

function isMaterial(value: unknown): value is StudentMaterial {
  return isRecord(value) && isNumber(value.id) && isNumber(value.section_id) && isString(value.title) &&
    isString(value.type) && isNullableString(value.body) && isNullableString(value.file_path) && isNumber(value.target_grade);
}

function isAssessmentSummary(value: unknown): value is StudentAssessmentSummary {
  return isRecord(value) && isNumber(value.id) && isNumber(value.section_id) && isString(value.title) &&
    isNullableString(value.description) && isNumber(value.target_grade) && typeof value.is_exam === "boolean" &&
    (value.duration_minutes === null || isNumber(value.duration_minutes)) && isNullableString(value.start_at) &&
    isNullableString(value.end_at) && isNumber(value.maximum_attempt) &&
    (value.passing_score === null || isNumber(value.passing_score));
}

function isSection(value: unknown): value is StudentSection {
  return isRecord(value) && isNumber(value.id) && isString(value.title) && isNumber(value.position) &&
    Array.isArray(value.materials) && value.materials.every(isMaterial) &&
    Array.isArray(value.assessments) && value.assessments.every(isAssessmentSummary);
}

function unwrap<T>(response: unknown, check: (value: unknown) => value is T, label: string): T {
  if (!isRecord(response) || !("data" in response)) throw new ApiError(`Data ${label} tidak dapat diproses.`, 502);
  return required(response.data, check, label);
}

export async function getStudentDashboard(): Promise<StudentDashboard> {
  return unwrap(await apiRequest<DataEnvelope<unknown>>("student/dashboard"), (value): value is StudentDashboard =>
    isRecord(value) && isStudentRecord(value.student) &&
    (value.expected_grade === null || isNumber(value.expected_grade)) && typeof value.class_update_required === "boolean" &&
    Array.isArray(value.courses) && value.courses.every(isCourse), "dashboard siswa");
}

export async function getStudentCourses(): Promise<StudentCoursesResponse> {
  const response = await apiRequest<unknown>("student/courses");
  if (!isRecord(response) || !Array.isArray(response.data) || !response.data.every(isCourse) ||
    !(response.expected_grade === null || isNumber(response.expected_grade))) {
    throw new ApiError("Daftar mata pelajaran tidak dapat diproses.", 502);
  }
  return response as StudentCoursesResponse;
}

export async function getStudentCourse(courseId: number | string): Promise<StudentCourseDetail> {
  return unwrap(await apiRequest<DataEnvelope<unknown>>(`student/courses/${encodeURIComponent(String(courseId))}`), (value): value is StudentCourseDetail =>
    isCourse(value) && Array.isArray(value.sections) && value.sections.every(isSection), "detail mata pelajaran");
}

function isQuestionOption(value: unknown): value is StudentQuestionOption {
  return isRecord(value) && isNumber(value.id) && isNumber(value.question_id) && isString(value.option_text);
}

function isQuestion(value: unknown): value is StudentQuestion {
  return isRecord(value) && isNumber(value.id) && isNumber(value.assessment_id) && isString(value.type) &&
    isString(value.prompt) && isNumber(value.points) && isNumber(value.position) &&
    Array.isArray(value.options) && value.options.every(isQuestionOption);
}

function isAssessment(value: unknown): value is StudentAssessment {
  if (!isAssessmentSummary(value)) return false;
  const questions = (value as Record<string, unknown>).questions;
  return Array.isArray(questions) && questions.every(isQuestion);
}

function isExamSession(value: unknown): value is StudentExamSession {
  return isRecord(value) && isNumber(value.id) && isNumber(value.assessment_id) && isNumber(value.student_id) &&
    isString(value.started_at) && isString(value.expires_at) && isNullableString(value.submitted_at) && isString(value.status);
}

export async function getStudentAssessment(assessmentId: number | string): Promise<StudentAssessmentResponse> {
  return unwrap(await apiRequest<DataEnvelope<unknown>>(`student/assessments/${encodeURIComponent(String(assessmentId))}`), (value): value is StudentAssessmentResponse =>
    isRecord(value) && isAssessment(value.assessment) && typeof value.can_attempt === "boolean" &&
    (value.exam_session === null || isExamSession(value.exam_session)) &&
    (value.remaining_seconds === null || isNumber(value.remaining_seconds)), "asesmen");
}

export async function completeStudentMaterial(materialId: number): Promise<void> {
  await apiRequest(`student/materials/${materialId}/complete`, { method: "POST", body: JSON.stringify({}) });
}

export async function enrollStudentCourse(courseId: number): Promise<void> {
  await apiRequest(`student/courses/${courseId}/enroll`, { method: "POST", body: JSON.stringify({}) });
}

export async function submitStudentAssessment(assessmentId: number, answers: Record<number, string | number>): Promise<StudentSubmission> {
  return unwrap(await apiRequest<DataEnvelope<unknown>>(`student/assessments/${assessmentId}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  }), (value): value is StudentSubmission => isRecord(value) && isNumber(value.id) && isNumber(value.assessment_id) &&
    isNumber(value.student_id) && isNumber(value.attempt_no) && isString(value.submitted_at) &&
    (value.score === null || isNumber(value.score)) && isString(value.status) && isNullableString(value.feedback), "hasil asesmen");
}

export async function logStudentExamActivity(examSessionId: number, event: string, detail?: string): Promise<void> {
  await apiRequest(`student/exam-sessions/${examSessionId}/logs`, {
    method: "POST",
    body: JSON.stringify({ event, ...(detail ? { detail } : {}) }),
  });
}

export async function getStudentProfile(): Promise<StudentProfileData> {
  return unwrap(await apiRequest<DataEnvelope<unknown>>("student/profile"), (value): value is StudentProfileData =>
    isRecord(value) && Array.isArray(value.classes) && value.classes.every(isStudentClass) &&
    Array.isArray(value.questions) && value.questions.every((question) => isRecord(question) && isNumber(question.id) &&
      isString(question.code) && isString(question.prompt) && isNullableString(question.material_keyword)) &&
    Array.isArray(value.recommendations) && value.recommendations.every(isString), "profil siswa");
}

export async function updateStudentClass(classRoomId: number) {
  return apiRequest<DataEnvelope<StudentRecord>>("student/profile/class", {
    method: "PUT",
    body: JSON.stringify({ class_room_id: classRoomId }),
  });
}

export async function saveStudentProfiling(answers: Record<number, number>) {
  return apiRequest("student/profile/profiling", {
    method: "PUT",
    body: JSON.stringify({ answers }),
  });
}

export function studentCourseSlug(name: string): string {
  const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("id-ID");
  if (normalized.includes("ilmu pengetahuan alam")) return "ipa";
  return normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function getStudentCourseBySlug(slug: string): Promise<StudentCourseDetail> {
  const { data: courses } = await getStudentCourses();
  const course = courses.find((item) => studentCourseSlug(item.name) === slug || String(item.id) === slug);
  if (!course) throw new ApiError("Mata pelajaran tidak ditemukan.", 404);
  return getStudentCourse(course.id);
}
