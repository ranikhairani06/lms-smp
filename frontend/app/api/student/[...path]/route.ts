import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { BackendError, backendRequest, SESSION_COOKIE, sessionToken } from "@/lib/backend";

type Context = { params: Promise<{ path: string[] }> };

const endpointMethods: Array<{ pattern: RegExp; methods: string[] }> = [
  { pattern: /^dashboard$/, methods: ["GET"] },
  { pattern: /^courses$/, methods: ["GET"] },
  { pattern: /^courses\/\d+$/, methods: ["GET"] },
  { pattern: /^courses\/\d+\/enroll$/, methods: ["POST"] },
  { pattern: /^materials\/\d+\/complete$/, methods: ["POST"] },
  { pattern: /^assessments\/\d+$/, methods: ["GET"] },
  { pattern: /^assessments\/\d+\/submit$/, methods: ["POST"] },
  { pattern: /^exam-sessions\/\d+\/logs$/, methods: ["POST"] },
  { pattern: /^profile$/, methods: ["GET"] },
  { pattern: /^profile\/class$/, methods: ["PUT"] },
  { pattern: /^profile\/profiling$/, methods: ["PUT"] },
];

async function handle(request: NextRequest, context: Context) {
  const { path } = await context.params;
  const endpoint = path.join("/");
  const route = endpointMethods.find(({ pattern }) => pattern.test(endpoint));
  if (!route) return NextResponse.json({ message: "Endpoint siswa tidak ditemukan." }, { status: 404 });
  if (!route.methods.includes(request.method)) {
    return new NextResponse(null, { status: 405, headers: { Allow: route.methods.join(", ") } });
  }

  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
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
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json({ message: "Gunakan format JSON." }, { status: 415 });
    }
  }

  try {
    const token = await sessionToken();
    if (!token) throw new BackendError("Silakan login kembali.", 401);
    const body = request.method === "GET" ? undefined : JSON.stringify(await request.json());
    const query = request.nextUrl.search;
    const data = await backendRequest<unknown>(`student/${endpoint}${query}`, {
      method: request.method,
      ...(body === undefined ? {} : { body }),
    }, token);
    if (data === undefined) return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ message: "JSON tidak valid." }, { status: 400 });
    if (error instanceof BackendError) {
      if (error.status === 401) (await cookies()).delete(SESSION_COOKIE);
      return NextResponse.json({ message: error.message }, { status: error.status, headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ message: "Permintaan siswa gagal diproses." }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
