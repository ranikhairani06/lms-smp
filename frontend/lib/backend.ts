import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { type AuthUser, type Role } from "./auth-types";

export const SESSION_COOKIE = "lms_session";

export class BackendError extends Error {
  constructor(message: string, public status: number, public errors?: Record<string, string[]>) {
    super(message);
  }
}

export async function backendRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const base = process.env.BACKEND_API_URL;
  if (!base) throw new BackendError("Alamat backend belum dikonfigurasi.", 503);
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let response: Response;
  try {
    response = await fetch(`${base.replace(/\/$/, "")}/${path}`, {
      ...options, headers, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new BackendError("Backend tidak dapat dihubungi. Pastikan server Laravel sedang berjalan.", 503);
  }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = response.status >= 500
      ? "Backend mengalami gangguan. Silakan coba lagi."
      : data?.message || "Permintaan tidak dapat diproses.";
    throw new BackendError(message, response.status, response.status < 500 ? data?.errors : undefined);
  }
  if (!data) throw new BackendError("Respons backend tidak valid.", 502);
  return data as T;
}

export async function sessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export const currentUser = cache(async (): Promise<AuthUser | null> => {
  const token = await sessionToken();
  if (!token) return null;
  try {
    return (await backendRequest<{ user: AuthUser }>("me", {}, token)).user;
  } catch (error) {
    if (error instanceof BackendError && error.status === 401) return null;
    throw error;
  }
});

export async function requireUser(role?: Role, allowPasswordChange = false) {
  const user = await currentUser();
  if (!user) redirect(role ? `/login?role=${role}` : "/login");
  if (role && user.role !== role) redirect(`/login?role=${role}&reason=role-mismatch`);
  if (user.must_change_password && !allowPasswordChange) redirect("/password-update");
  return user;
}
