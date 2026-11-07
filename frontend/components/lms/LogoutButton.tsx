"use client";

import { useState } from "react";
import { ApiError, apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export default function LogoutButton({ className, children }: { className?: string; children?: ReactNode }) {
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
      {pending ? "Sedang keluar..." : children ?? "Keluar"}
    </button>
    {error && <p role="alert">{error}</p>}
  </div>;
}
