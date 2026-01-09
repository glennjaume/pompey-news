import { NextResponse } from "next/server";

// Simple auth token - just needs to be consistent
const AUTH_TOKEN = "authenticated";

export async function POST(request: Request) {
  const { password } = await request.json();
  const correctPassword = process.env.SITE_PASSWORD;

  if (!correctPassword) {
    // No password set, allow access
    const response = NextResponse.json({ success: true });
    response.cookies.set("pompey-auth", AUTH_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  }

  if (password === correctPassword) {
    const response = NextResponse.json({ success: true });

    // Set auth cookie (expires in 30 days)
    response.cookies.set("pompey-auth", AUTH_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  }

  return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
}
