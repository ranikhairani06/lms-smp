import type { ReactNode } from "react";
import { requireUser } from "@/lib/backend";
import AdminShell from "@/app/admin/_components/AdminShell";

/**
 * Proteksi seluruh halaman /admin.
 * Menggunakan helper autentikasi yang sudah ada di proyek LMS.
 * Pastikan file ini tetap berada di dalam proyek yang memiliki @/lib/backend.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("admin");
  return <AdminShell user={user}>{children}</AdminShell>;
}
