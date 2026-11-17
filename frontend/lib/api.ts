export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    credentials: "same-origin",
    cache: "no-store",
  });
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const validation = data?.errors ? Object.values(data.errors).flat().join(" ") : "";
    throw new ApiError(validation || data?.message || "Permintaan gagal. Silakan coba lagi.", response.status);
  }
  return data as T;
}
export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

