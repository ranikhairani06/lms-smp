"use client";

import "./globals.css";
import { ErrorState } from "@/components/lms/state";

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="id">
      <body>
        <main className="p-lg">
          <ErrorState
            title="Terjadi kesalahan"
            description="Terjadi kesalahan pada aplikasi. Coba muat ulang halaman."
            action={
              <button type="button" className="btn btn-primary btn-m" onClick={retry}>
                Coba lagi
              </button>
            }
          />
        </main>
      </body>
    </html>
  );
}
