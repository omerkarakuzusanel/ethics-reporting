import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: "" }));
  const expectedPassword = process.env.HR_MANUAL_ENTRY_PASSWORD;

  if (!expectedPassword) {
    return NextResponse.json(
      { error: "HR manual entry password is not configured." },
      { status: 500 }
    );
  }

  if (!password || password !== expectedPassword) {
    return NextResponse.json(
      { error: "Girilen \u015fifre hatal\u0131." },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true });
}
