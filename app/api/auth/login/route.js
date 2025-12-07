import { NextResponse } from "next/server";
import { UserRepository } from "@/lib/userRepository";
import {
  generateAccessToken,
  generateRefreshToken,
  getExpirationDate,
} from "@/lib/auth";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Invalid username and/or password" }, { status: 400 });
    }

    const user = await UserRepository.authenticate(username, password);

    if (!user) {
      return NextResponse.json({ error: "Invalid username and/or password" }, { status: 401 });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const expiresAt = getExpirationDate(process.env.JWT_REFRESH_EXPIRY || "7d");
    await UserRepository.storeRefreshToken(user.id, refreshToken, expiresAt);

    const response = NextResponse.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
    });

    // HttpOnly cookie for session security
    response.cookies.set("session", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 3600,
    });

    return response;
  } catch (error) {
    console.error("[Auth] Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
