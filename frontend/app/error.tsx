"use client";

import Link from "next/link";
import { ErrorState } from "@/components/lms/state";

export default function ErrorPage({
  error,
  retry: reset,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="p-lg">
      <ErrorState
        title="Terjadi kesalahan"
        description={
          <>
            <span>
              Terjadi kesalahan saat memuat halaman. Coba lagi, atau kembali ke halaman utama.
            </span>
            {error.digest ? (
              <small className="text-p12" style={{ display: "block", marginTop: "var(--space-xs)" }}>
                Kode: {error.digest}
              </small>
            ) : null}
          </>
        }
        action={
          <>
            <button type="button" className="btn btn-primary btn-m" onClick={reset}>
              Coba lagi
            </button>
            <Link href="/login" className="link">
              Kembali ke login
            </Link>
          </>
        }
      />
    </main>
  );
}
