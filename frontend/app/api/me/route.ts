import { NextResponse } from "next/server";
import { currentUser } from "@/lib/backend";

export async function GET() {
  try {
    const user = await currentUser();
    return NextResponse.json(user ? { user } : { message: "Silakan login kembali." }, {
      status: user ? 200 : 401,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ message: "Backend tidak dapat dihubungi." }, { status: 503 });
  }
}
