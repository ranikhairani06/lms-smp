"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiRequest } from "@/lib/api";

type ResourceState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  empty: boolean;
  reload: () => Promise<void>;
};

function redirectExpired(router: ReturnType<typeof useRouter>, error: unknown) {
  if (error instanceof ApiError && error.status === 401) {
    router.replace("/login?role=admin&reason=session-expired");
  }
}

// Hook GET Admin: membedakan loading, gagal, dan respons koleksi kosong.
export function useAdminResource<T>(path: string): ResourceState<T> {
  const router = useRouter();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [empty, setEmpty] = useState(false);
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest<unknown>(`admin/${path}`);
      if (currentRequest !== requestId.current) return;
      const payload = response && typeof response === "object" && "data" in response
        ? (response as { data: T }).data
        : response as T;
      setData(payload);
      setEmpty(Array.isArray(payload) && payload.length === 0);
    } catch (cause) {
      if (currentRequest !== requestId.current) return;
      redirectExpired(router, cause);
      setError(cause instanceof Error ? cause.message : "Data belum dapat dimuat. Silakan coba lagi.");
      setEmpty(false);
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [path, router]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) void reload();
    });
    return () => {
      active = false;
      requestId.current += 1;
    };
  }, [reload]);

  return { data, loading, error, empty, reload };
}

type MutationMethod = "POST" | "PUT" | "DELETE";
type MutationState<T> = {
  run: (body?: unknown) => Promise<T | undefined>;
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string[]>;
};

// Hook mutation Admin: menangani status kirim, pesan, validasi field, dan reload sukses.
export function useAdminMutation<T = unknown>(
  method: MutationMethod,
  path: string,
  onSuccess?: (result: T | undefined) => void | Promise<void>,
): MutationState<T> {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const run = useCallback(async (body?: unknown) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      const result = await apiRequest<T>(`admin/${path}`, {
        method,
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      await onSuccess?.(result);
      return result;
    } catch (cause) {
      redirectExpired(router, cause);
      if (cause instanceof ApiError) setFieldErrors(cause.fieldErrors);
      setError(cause instanceof Error ? cause.message : "Perubahan belum dapat disimpan. Silakan coba lagi.");
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [method, onSuccess, path, router]);

  return { run, loading, error, fieldErrors };
}
