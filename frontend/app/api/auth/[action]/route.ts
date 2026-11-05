import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { BackendError, backendRequest, SESSION_COOKIE, sessionToken } from "@/lib/backend";
import { portalPath, type AuthUser } from "@/lib/auth-types";

type Context = { params: Promise<{ action: string }> };

async function handle(request: NextRequest, context: Context) {
  const { action } = await context.params;
  const methods: Record<string, string> = { login: "POST", logout: "POST", password: "PUT" };
  if (!methods[action]) return NextResponse.json({ message: "Endpoint tidak ditemukan." }, { status: 404 });
  if (request.method !== methods[action]) return new NextResponse(null, { status: 405, headers: { Allow: methods[action] } });

  // Cookie authentication requires rejecting mutations from another origin.
  const origin = request.headers.get("origin");
  // Next.js may normalize request.nextUrl to localhost; compare the actual Host.
  let originAllowed = true;
  if (origin) {
    try {
      const url = new URL(origin);
      originAllowed = ["http:", "https:"].includes(url.protocol) && url.host === request.headers.get("host");
    } catch {
      originAllowed = false;
    }
  }
  if (!originAllowed || request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ message: "Asal permintaan tidak diizinkan." }, { status: 403 });
  }
  if (action !== "logout" && !request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ message: "Gunakan format JSON." }, { status: 415 });
  }

  try {
    const jar = await cookies();
    const token = await sessionToken();
    if (action === "login") {
      const body = await request.json();
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return NextResponse.json({ message: "Data login tidak valid." }, { status: 400 });
      }
      const data = await backendRequest<{ token: string; user: AuthUser }>("auth/login", {
        method: "POST", body: JSON.stringify({
          username: body.username, password: body.password, role: body.role,
          remember: body.remember === true, device_name: "EduSpace Next.js",
        }),
      });
      jar.set(SESSION_COOKIE, data.token, {
        httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
        path: "/", ...(body.remember === true ? { maxAge: 60 * 60 * 24 * 30 } : {}),
      });
      return NextResponse.json({ user: data.user, redirect: portalPath(data.user) }, { headers: { "Cache-Control": "no-store" } });
    }
    if (!token) throw new BackendError("Silakan login kembali.", 401);
    if (action === "logout") {
      // Keep the cookie on network failure so logout can be retried and the token revoked.
      await backendRequest("auth/logout", { method: "POST" }, token);
      jar.delete(SESSION_COOKIE);
      return new NextResponse(null, { status: 204 });
    }
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ message: "Data kata sandi tidak valid." }, { status: 400 });
    }
    await backendRequest("auth/password", { method: "PUT", body: JSON.stringify({
      current_password: body.current_password, password: body.password,
      password_confirmation: body.password_confirmation,
    }) }, token);
    const { user } = await backendRequest<{ user: AuthUser }>("me", {}, token);
    return NextResponse.json({ message: "Kata sandi berhasil disimpan.", redirect: portalPath(user) });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ message: "JSON tidak valid." }, { status: 400 });
    if (error instanceof BackendError) {
      if (error.status === 401) (await cookies()).delete(SESSION_COOKIE);
      return NextResponse.json({ message: error.message, errors: error.errors }, { status: error.status });
    }
    return NextResponse.json({ message: "Permintaan gagal diproses." }, { status: 500 });
  }
}

export const POST = handle;
export const PUT = handle;
