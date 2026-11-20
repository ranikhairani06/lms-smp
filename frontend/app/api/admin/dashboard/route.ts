import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { BackendError, backendRequest, SESSION_COOKIE, sessionToken } from "@/lib/backend";
import type { AdminDashboardData } from "@/lib/admin-dashboard-api";

function safeMessage(status: number) {
  if (status === 401) return "Sesi Anda telah berakhir. Silakan masuk kembali.";
  if (status === 403) return "Anda tidak memiliki akses ke dashboard administrator.";
  if (status === 404) return "Data dashboard tidak ditemukan.";
  return "Dashboard belum dapat dimuat. Silakan coba lagi.";
}

export async function GET() {
  const token = await sessionToken();
  if (!token) {
    return NextResponse.json({ message: safeMessage(401) }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const response = await backendRequest<{ data: AdminDashboardData }>("admin/dashboard", {}, token);
    return NextResponse.json(response, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof BackendError) {
      if (error.status === 401) (await cookies()).delete(SESSION_COOKIE);
      return NextResponse.json(
        { message: safeMessage(error.status) },
        { status: error.status, headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(
      { message: safeMessage(500) },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
