"use client";

import { ErrorState } from "@/components/lms/state";

export default function ParentError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorState
    title={error.message || "Data belum dapat dimuat."}
    description="Periksa koneksi lalu coba muat ulang halaman."
    action={<button type="button" className="btn btn-primary btn-m" onClick={retry}>Coba Lagi</button>}
  />;
}
