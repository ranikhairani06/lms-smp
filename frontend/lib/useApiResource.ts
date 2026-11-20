"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";

type LoadingState = { status: "loading" };
type EmptyState = { status: "empty" };
type ReadyState<T> = { status: "ready"; data: T };
type ErrorState = { status: "error"; message: string; statusCode: number };

type ResourceState<T> = LoadingState | EmptyState | ReadyState<T> | ErrorState;
const neverEmpty = () => false;

function safeErrorMessage(error: unknown): { message: string; statusCode: number } {
  if (!(error instanceof ApiError)) {
    return { message: "Dashboard belum dapat dimuat. Silakan coba lagi.", statusCode: 500 };
  }

  if (error.status === 401) {
    return { message: "Sesi Anda telah berakhir. Silakan masuk kembali.", statusCode: 401 };
  }
  if (error.status === 403) {
    return { message: "Anda tidak memiliki akses ke dashboard administrator.", statusCode: 403 };
  }
  if (error.status === 404) {
    return { message: "Data dashboard tidak ditemukan.", statusCode: 404 };
  }
  if (error.status === 422) {
    return { message: "Data dashboard tidak dapat diproses.", statusCode: 422 };
  }
  return { message: "Dashboard belum dapat dimuat. Silakan coba lagi.", statusCode: error.status };
}

export function useApiResource<T>(
  loader: () => Promise<T>,
  isEmpty: (data: T) => boolean = neverEmpty,
) {
  const [state, setState] = useState<ResourceState<T>>({ status: "loading" });
  const requestId = useRef(0);

  const handleSuccess = useCallback((currentRequest: number, data: T) => {
    if (requestId.current !== currentRequest) return;
    setState(isEmpty(data) ? { status: "empty" } : { status: "ready", data });
  }, [isEmpty]);

  const handleFailure = useCallback((currentRequest: number, error: unknown) => {
    if (requestId.current !== currentRequest) return;
    setState({ status: "error", ...safeErrorMessage(error) });
  }, []);

  useEffect(() => {
    const currentRequest = ++requestId.current;
    void loader().then(
      (data) => handleSuccess(currentRequest, data),
      (error: unknown) => handleFailure(currentRequest, error),
    );
    return () => {
      requestId.current += 1;
    };
  }, [handleFailure, handleSuccess, loader]);

  const retry = useCallback(() => {
    const currentRequest = ++requestId.current;
    setState({ status: "loading" });
    void loader().then(
      (data) => handleSuccess(currentRequest, data),
      (error: unknown) => handleFailure(currentRequest, error),
    );
  }, [handleFailure, handleSuccess, loader]);
  return { ...state, retry };
}
