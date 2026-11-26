export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    const headers = new Headers(options.headers);
    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    response = await fetch(`/api/${path}`, {
      ...options,
      headers,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "Tidak dapat terhubung ke server. Periksa koneksi internet Anda lalu coba lagi.",
      503,
    );
  }
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const fieldErrors = normalizeFieldErrors(data?.errors);
    const validation = Object.values(fieldErrors).flat().join(" ");
    const statusMessage = [401, 403, 404, 409].includes(response.status) || response.status >= 500
      ? messageForStatus(response.status)
      : "";
    const message = response.status === 422
      ? validation || data?.message || messageForStatus(response.status)
      : statusMessage || data?.message || messageForStatus(response.status);
    throw new ApiError(message, response.status, fieldErrors, data);
  }
  return data as T;
}
export class ApiError extends Error {
  constructor(message: string, public status: number, public fieldErrors: Record<string, string[]> = {}, public details?: unknown) {
    super(message);
  }
}

function normalizeFieldErrors(value: unknown): Record<string, string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([field, messages]) => [
    field,
    Array.isArray(messages) ? messages.map(String) : [String(messages)],
  ]));
}

function messageForStatus(status: number) {
  if (status === 401) return "Sesi Anda telah berakhir. Silakan masuk kembali.";
  if (status === 403) return "Anda tidak memiliki izin untuk melakukan tindakan ini.";
  if (status === 404) return "Data yang diminta tidak ditemukan.";
  if (status === 409) return "Data berubah atau bertentangan. Muat ulang data lalu coba lagi.";
  if (status >= 500) return "Server sedang mengalami gangguan. Silakan coba lagi.";
  return "Permintaan gagal. Silakan coba lagi.";
}

