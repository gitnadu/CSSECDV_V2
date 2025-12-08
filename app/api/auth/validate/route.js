import { NextResponse } from "next/server";
import { verifyToken } from "lib/auth";
import { UserRepository } from "lib/userRepository";

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ valid: false, user: null });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ valid: false, user: null });
    }

    const user = await UserRepository.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ valid: false, user: null });
    }

    return NextResponse.json({ valid: true, user });
  } catch (error) {
    console.error("[Auth] ValidateToken error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
