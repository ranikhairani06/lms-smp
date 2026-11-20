import { ApiError, apiRequest } from "@/lib/api";

export type AdminDashboardClass = {
  id: number;
  name: string;
  students_count: number;
  grade_level: number;
  is_active: boolean;
  academic_year_id?: number | null;
};

export type AdminDashboardAcademicYear = {
  id?: number;
  name: string;
  start_year?: number;
  is_active?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type AdminDashboardData = {
  students: number;
  teachers: number;
  parents: number;
  courses: number;
  active_year: AdminDashboardAcademicYear | null;
  classes: AdminDashboardClass[];
  alerts?: {
    students_need_class_update: number;
  };
};

type AdminDashboardResponse = { data: AdminDashboardData };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAdminDashboardData(value: unknown): value is AdminDashboardData {
  if (!isRecord(value)) return false;
  if (
    typeof value.students !== "number" ||
    typeof value.teachers !== "number" ||
    typeof value.parents !== "number" ||
    typeof value.courses !== "number" ||
    !Array.isArray(value.classes)
  ) {
    return false;
  }

  if (
    value.alerts !== undefined &&
    (!isRecord(value.alerts) || typeof value.alerts.students_need_class_update !== "number")
  ) {
    return false;
  }

  if (value.active_year !== null && (!isRecord(value.active_year) || typeof value.active_year.name !== "string")) {
    return false;
  }

  return value.classes.every(
    (item) =>
      isRecord(item) &&
      typeof item.id === "number" &&
      typeof item.name === "string" &&
      typeof item.students_count === "number" &&
      typeof item.grade_level === "number" &&
      typeof item.is_active === "boolean",
  );
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const response = await apiRequest<AdminDashboardResponse>("admin/dashboard");
  if (!isRecord(response) || !("data" in response)) {
    throw new ApiError("Data dashboard tidak dapat diproses.", 502);
  }
  if (!isAdminDashboardData(response.data)) {
    throw new ApiError("Data dashboard tidak dapat diproses.", 502);
  }
  return response.data;
}
