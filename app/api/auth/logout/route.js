import { NextResponse } from "next/server";
import { verifyToken } from "lib/auth";
import { UserRepository } from "lib/userRepository";

export async function POST(req) {
  try {
    const refreshToken = req.cookies.get("refresh_token")?.value;

    if (refreshToken) {
      const decoded = verifyToken(refreshToken);
      if (decoded?.id) {
        await UserRepository.revokeRefreshToken(decoded.id, refreshToken);
      }
    }

    // === Clear cookies ===
    const res = NextResponse.json({ success: true });

    res.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    res.cookies.set("session", "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (err) {
    console.error("[Logout] error:", err);
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 });
  }
}
