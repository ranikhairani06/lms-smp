"use client";

import { ErrorState, EmptyState, LoadingState } from "@/components/lms/state";

type ResourceState = { status: string; message?: string; statusCode?: number; retry?: () => void };

export function StudentLoading({ title = "Memuat data siswa..." }: { title?: string }) {
  return <LoadingState title={title} />;
}

export function StudentError({ resource }: { resource: ResourceState }) {
  const title = resource.statusCode === 404 ? "Data tidak ditemukan" :
    resource.statusCode === 403 ? "Akses ditolak" : "Data belum dapat dimuat";
  return (
    <ErrorState
      title={title}
      description={resource.message}
      action={<button type="button" className="es-button" onClick={resource.retry}>Coba Lagi</button>}
    />
  );
}

export function StudentEmpty({ title, description }: { title: string; description?: string }) {
  return <EmptyState title={title} description={description} />;
}
