import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { BackendError, backendFetch, SESSION_COOKIE, sessionToken } from "@/lib/backend";
import { isAllowedUploadExtension, MAX_UPLOAD_FILE_SIZE_BYTES } from "@/lib/uploadLimits";

type Context = { params: Promise<{ path: string[] }> };
type Endpoint = { pattern: RegExp; methods: string[]; upload?: boolean };

const endpoints: Endpoint[] = [
  { pattern: /^dashboard$/, methods: ["GET"] },
  ...["teachers", "students", "parents", "classes", "academic-years", "subjects", "teaching-assignments"].flatMap((collection) => [
    { pattern: new RegExp(`^${collection}$`), methods: ["GET", "POST"] },
    { pattern: new RegExp(`^${collection}/\\d+$`), methods: ["PUT", "DELETE"] },
  ]),
  { pattern: /^students\/\d+\/reset-password$/, methods: ["POST"] },
  { pattern: /^students\/import$/, methods: ["POST"], upload: true },
  { pattern: /^academic-years\/\d+\/activate$/, methods: ["POST"] },
  { pattern: /^audit-logs$/, methods: ["GET"] },
  { pattern: /^grades\/report$/, methods: ["GET"] },
  { pattern: /^grades\/export$/, methods: ["GET"] },
  { pattern: /^semesters$/, methods: ["GET", "POST"] },
  { pattern: /^semesters\/\d+$/, methods: ["PUT", "PATCH", "DELETE"] },
  { pattern: /^semesters\/\d+\/activate$/, methods: ["POST"] },
];

const noStore = { "Cache-Control": "no-store" };

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status, headers: noStore });
}

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") !== "cross-site";
  try {
    const url = new URL(origin);
    return ["http:", "https:"].includes(url.protocol) && url.host === request.headers.get("host");
  } catch {
    return false;
  }
}

async function handle(request: NextRequest, context: Context) {
  const { path } = await context.params;
  if (path.some((part) => part === ".." || !/^[a-z0-9-]+$/.test(part))) {
    return jsonError("Endpoint Admin tidak ditemukan.", 404);
  }
  const endpoint = path.join("/");
  const route = endpoints.find(({ pattern }) => pattern.test(endpoint));
  if (!route) return jsonError("Endpoint Admin tidak ditemukan.", 404);
  if (!route.methods.includes(request.method)) {
    return NextResponse.json({ message: "Metode permintaan tidak diizinkan." }, {
      status: 405,
      headers: { ...noStore, Allow: route.methods.join(", ") },
    });
  }

  if (request.method !== "GET" && !sameOrigin(request)) {
    return jsonError("Asal permintaan tidak diizinkan.", 403);
  }

  const token = await sessionToken();
  if (!token) return jsonError("Sesi Anda telah berakhir. Silakan masuk kembali.", 401);

  const query = request.nextUrl.search;
  let body: BodyInit | undefined;
  const headers = new Headers();
  if (route.upload) {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_UPLOAD_FILE_SIZE_BYTES + 64 * 1024) {
      return jsonError("File terlalu besar untuk diunggah", 413);
    }
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data")) {
      return jsonError("Pilih file XLSX untuk diimpor.", 422);
    }
    try {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File) || file.size === 0) return jsonError("File XLSX tidak boleh kosong.", 422);
      if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) return jsonError("File terlalu besar untuk diunggah", 413);
      if (!isAllowedUploadExtension(file.name, "adminStudentImport")) {
        return jsonError("Format file impor harus XLSX sesuai kontrak backend.", 422);
      }
      body = form;
    } catch {
      return jsonError("File impor tidak dapat dibaca.", 400);
    }
  } else if (request.method !== "GET" && request.method !== "DELETE") {
    if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
      return jsonError("Gunakan format JSON.", 415);
    }
    try {
      const rawBody = await request.text();
      if (rawBody) JSON.parse(rawBody);
      body = rawBody;
    } catch {
      return jsonError("JSON tidak valid.", 400);
    }
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await backendFetch(`admin/${endpoint}${query}`, {
      method: request.method,
      headers,
      ...(body === undefined ? {} : { body }),
    }, token);

    if (response.status === 204) return new NextResponse(null, { status: 204, headers: noStore });
    if (response.status >= 500) {
      return jsonError("Backend mengalami gangguan. Silakan coba lagi.", 502);
    }
    if (endpoint === "grades/export" && response.ok) {
      const headers = new Headers(noStore);
      const contentType = response.headers.get("content-type");
      const contentDisposition = response.headers.get("content-disposition");
      if (contentType) headers.set("Content-Type", contentType);
      if (contentDisposition) headers.set("Content-Disposition", contentDisposition);
      return new NextResponse(response.body, { status: response.status, headers });
    }
    const responseBody = await response.text();
    if (response.status === 401) (await cookies()).delete(SESSION_COOKIE);
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        ...noStore,
        "Content-Type": response.headers.get("content-type") || "application/json; charset=utf-8",
      },
    });
  } catch (error) {
    if (error instanceof BackendError) {
      if (error.status === 503 && error.message === "Alamat backend belum dikonfigurasi.") {
        return jsonError("Alamat backend belum dikonfigurasi.", 503);
      }
      return jsonError("Backend tidak dapat dihubungi. Silakan coba lagi.", 503);
    }
    return jsonError("Permintaan Admin gagal diproses.", 500);
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
export const OPTIONS = handle;
export const HEAD = handle;
