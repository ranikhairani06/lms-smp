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

let apiPathWarningLogged = false;
let missingApiWarningLogged = false;

function backendApiBase() {
  const configured = process.env.BACKEND_API_URL;
  if (!configured) {
    if (!missingApiWarningLogged) {
      console.warn("BACKEND_API_URL belum dikonfigurasi.");
      missingApiWarningLogged = true;
    }
    throw new BackendError("Alamat backend belum dikonfigurasi.", 503);
  }

  const base = new URL(configured);
  const parts = base.pathname.split("/").filter(Boolean);
  const apiCount = parts.filter((part) => part.toLowerCase() === "api").length;
  const endsWithApi = parts.at(-1)?.toLowerCase() === "api";
  if (!apiPathWarningLogged && (apiCount > 1 || !endsWithApi)) {
    // Diagnostik hanya menyebut bentuk path; URL backend tidak pernah dicatat.
    console.warn("Konfigurasi BACKEND_API_URL perlu satu segmen /api di akhir.");
    apiPathWarningLogged = true;
  }
  const normalizedParts = parts.filter((part) => part.toLowerCase() !== "api");
  base.pathname = `/${[...normalizedParts, "api"].join("/")}`;
  base.search = "";
  base.hash = "";
  return base.toString().replace(/\/$/, "");
}

function backendUrl(path: string) {
  const base = backendApiBase();
  return `${base}/${path.replace(/^\/+/, "")}`;
}

// Fetch mentah dipakai proxy Admin agar status dan body validasi backend tetap utuh.
export async function backendFetch(path: string, options: RequestInit = {}, token?: string) {
  const url = backendUrl(path);
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  try {
    return await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new BackendError("Backend tidak dapat dihubungi. Pastikan server Laravel sedang berjalan.", 503);
  }
}

export async function backendRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  let response: Response;
  try {
    response = await backendFetch(path, { ...options, headers }, token);
  } catch (error) {
    if (error instanceof BackendError) throw error;
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
  const token = await sessionToken();
  const user = await currentUser();
  if (!user) {
    if (token) {
      redirect(role ? `/login?role=${role}&reason=session-expired` : "/login?reason=session-expired");
    }
    redirect(role ? `/login?role=${role}` : "/login");
  }
  if (role && user.role !== role) redirect(`/login?role=${role}&reason=role-mismatch`);
  if (user.role !== "admin" && user.must_change_password && !allowPasswordChange) redirect("/password-update");
  return user;
}
