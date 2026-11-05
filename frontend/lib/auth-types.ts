export type Role = "admin" | "student" | "teacher" | "parent";

export type AuthUser = {
  id: number;
  name: string;
  username: string;
  email: string | null;
  role: Role;
  must_change_password: boolean;
  student: {
    nisn: string;
    class_room: { name: string } | null;
  } | null;
};

export function portalPath(user: AuthUser): string {
  if (user.must_change_password) return "/password-update";
  if (user.role === "student") return "/siswa";
  if (user.role === "parent") return "/orang-tua";
  if (user.role === "teacher") return "/guru";
  return "/akun";
}

export function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
