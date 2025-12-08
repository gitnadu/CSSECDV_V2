import { NextResponse } from "next/server";
import { verifyToken, generateAccessToken } from "@/lib/auth";
import { UserRepository } from "lib/userRepository";

export async function POST(req) {
  try {
    const { refresh_token } = await req.json();

    if (!refresh_token) {
      return NextResponse.json({ error: "Refresh token required" }, { status: 400 });
    }

    const decoded = verifyToken(refresh_token);

    if (!decoded || decoded.type !== "refresh") {
      return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
    }

    const valid = await UserRepository.validateRefreshToken(decoded.id, refresh_token);
    if (!valid) {
      return NextResponse.json({ error: "Refresh token invalid" }, { status: 401 });
    }

    const user = await UserRepository.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newAccessToken = generateAccessToken(user);

    return NextResponse.json({
      access_token: newAccessToken,
      refresh_token,
      user,
    });
  } catch (error) {
    console.error("[Auth] RefreshToken error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
