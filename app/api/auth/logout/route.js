import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { UserRepository } from "@/lib/userRepository";

export async function POST(req) {
  try {
    const { refresh_token } = await req.json();
    if (!refresh_token) return NextResponse.json({ success: true });

    const decoded = verifyToken(refresh_token);

    if (decoded) {
      await UserRepository.revokeRefreshToken(decoded.id, refresh_token);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Auth] Logout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
