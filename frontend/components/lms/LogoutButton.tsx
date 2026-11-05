"use client";

import { useState } from "react";
import { ApiError, apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function logout() {
    setPending(true);
    setError("");
    try {
      await apiRequest("auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.replace("/login");
        router.refresh();
        return;
      }
      setError(error instanceof Error ? error.message : "Gagal keluar. Silakan coba lagi.");
      setPending(false);
    }
  }
  return <div>
    <button type="button" className={className} disabled={pending} onClick={logout}>
      {pending ? "Sedang keluar..." : "Keluar"}
    </button>
    {error && <p role="alert">{error}</p>}
  </div>;
}
