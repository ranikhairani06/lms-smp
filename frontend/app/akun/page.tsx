import { redirect } from "next/navigation";
import { requireUser } from "@/lib/backend";
import { portalPath } from "@/lib/auth-types";
import LogoutButton from "@/components/lms/LogoutButton";

export default async function AccountPage() {
  const user = await requireUser();
  if (user.role !== "admin") redirect(portalPath(user));
  return <main style={{ maxWidth: 640, margin: "80px auto", padding: 24 }}>
    <h1>Selamat datang, {user.name}</h1>
    <p>Anda masuk sebagai {user.role === "admin" ? "Admin" : "Guru"}.</p>
    <p>Halaman kerja untuk peran ini belum tersedia di frontend ini.</p>
    <LogoutButton />
  </main>;
}
