import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
