"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";

type ResourceState<T> =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "ready"; data: T }
  | { status: "error"; message: string; statusCode: number };

const neverEmpty = () => false;

function safeMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return { statusCode: 500, message: "Data siswa belum dapat dimuat. Silakan coba lagi." };
  }
  if (error.status === 401) return { statusCode: 401, message: "Sesi Anda telah berakhir. Silakan masuk kembali." };
  if (error.status === 403) return { statusCode: 403, message: "Anda tidak memiliki akses ke data ini." };
  if (error.status === 404) return { statusCode: 404, message: "Data yang diminta tidak ditemukan." };
  if (error.status === 422 || error.status === 502) return { statusCode: error.status, message: "Data dari server tidak dapat diproses." };
  return { statusCode: error.status, message: "Data siswa belum dapat dimuat. Silakan coba lagi." };
}

export function useStudentResource<T>(loader: () => Promise<T>, isEmpty: (data: T) => boolean = neverEmpty) {
  const [state, setState] = useState<ResourceState<T>>({ status: "loading" });
  const requestId = useRef(0);

  const success = useCallback((id: number, data: T) => {
    if (requestId.current !== id) return;
    setState(isEmpty(data) ? { status: "empty" } : { status: "ready", data });
  }, [isEmpty]);

  const failure = useCallback((id: number, error: unknown) => {
    if (requestId.current !== id) return;
    setState({ status: "error", ...safeMessage(error) });
  }, []);

  useEffect(() => {
    const id = ++requestId.current;
    void loader().then((data) => success(id, data), (error: unknown) => failure(id, error));
    return () => { requestId.current += 1; };
  }, [failure, loader, success]);

  const retry = useCallback(() => {
    const id = ++requestId.current;
    setState({ status: "loading" });
    void loader().then((data) => success(id, data), (error: unknown) => failure(id, error));
  }, [failure, loader, success]);

  return { ...state, retry };
}
