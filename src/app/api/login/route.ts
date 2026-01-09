import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password } = await request.json();
  const correctPassword = process.env.SITE_PASSWORD;

  if (!correctPassword) {
    // No password set, allow access
    return NextResponse.json({ success: true });
  }

  if (password === correctPassword) {
    const response = NextResponse.json({ success: true });

    // Set auth cookie (expires in 30 days)
    response.cookies.set("pompey-auth", password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  }

  return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
}
