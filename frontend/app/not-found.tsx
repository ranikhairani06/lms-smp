import Link from "next/link";
import { EmptyState } from "@/components/lms/state";

export default function NotFound() {
  return (
    <main className="p-lg">
      <EmptyState
        title="Halaman tidak ditemukan"
        description="Alamat yang Anda buka tidak tersedia."
        action={
          <Link href="/" className="btn btn-primary btn-m">
            Kembali ke beranda
          </Link>
        }
      />
    </main>
  );
}
