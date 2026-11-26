"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiRequest } from "@/lib/api";
import { courseForSubject, type TeacherCourse } from "./teacher-api";
import type { Subject } from "./data";

type ResourceState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  empty: boolean;
  reload: () => Promise<void>;
};

function redirectExpired(router: ReturnType<typeof useRouter>, error: unknown) {
  if (error instanceof ApiError && error.status === 401) router.replace("/login?role=teacher&reason=session-expired");
}

export function useTeacherResource<T>(path: string, enabled = true): ResourceState<T> {
  const router = useRouter();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [empty, setEmpty] = useState(false);
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    if (!enabled) return;
    const current = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest<unknown>(`teacher/${path}`);
      if (current !== requestId.current) return;
      const payload = response && typeof response === "object" && "data" in response
        ? (response as { data: T }).data
        : response as T;
      setData(payload);
      setEmpty(Array.isArray(payload) && payload.length === 0);
    } catch (cause) {
      if (current !== requestId.current) return;
      redirectExpired(router, cause);
      setError(cause instanceof Error ? cause.message : "Data belum dapat dimuat. Silakan coba lagi.");
      setEmpty(false);
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, [enabled, path, router]);

  useEffect(() => {
    let active = true;
    if (enabled) void Promise.resolve().then(() => active ? reload() : undefined);
    return () => { active = false; requestId.current += 1; };
  }, [enabled, reload]);

  return { data, loading, error, empty, reload };
}

type MutationMethod = "POST" | "PUT" | "DELETE";
export function useTeacherMutation<T = unknown>(method: MutationMethod, path: string, onSuccess?: (result: T | undefined) => void | Promise<void>, onNotFound?: () => void | Promise<void>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState<number | null>(null);

  const run = useCallback(async (body?: BodyInit | unknown) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    setStatus(null);
    try {
      const result = await apiRequest<T>(`teacher/${path}`, {
        method,
        ...(body === undefined ? {} : { body: body instanceof FormData ? body : JSON.stringify(body) }),
      });
      await onSuccess?.(result);
      return result;
    } catch (cause) {
      redirectExpired(router, cause);
      if (cause instanceof ApiError) {
        setStatus(cause.status);
        setFieldErrors(cause.fieldErrors);
        if (cause.status === 404) await onNotFound?.();
      }
      setError(cause instanceof Error ? cause.message : "Perubahan belum dapat disimpan. Silakan coba lagi.");
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [method, onNotFound, onSuccess, path, router]);

  return { run, loading, error, fieldErrors, status };
}

export function useTeacherCourse(subject: Subject) {
  const list = useTeacherResource<TeacherCourse[]>("courses");
  const course = list.data ? courseForSubject(list.data, subject) : undefined;
  const detail = useTeacherResource<TeacherCourse>(`courses/${course?.id ?? 0}`, Boolean(course));
  return { list, course: detail.data || course || null, loading: list.loading || (!!course && detail.loading), error: list.error || detail.error, reload: detail.reload };
}
