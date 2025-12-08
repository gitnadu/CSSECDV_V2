import { NextResponse } from "next/server";
import { UserRepository } from "lib/userRepository";
import { verifyToken } from "lib/auth"; // your JWT/session verification

export async function GET(req) {
  try {
    // Extract user from cookie/session/JWT
    const token = req.cookies.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, user: null },
        { status: 200 }
      );
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, user: null },
        { status: 200 }
      );
    }

    const user = await UserRepository.findById(payload.id);

    if (!user) {
      return NextResponse.json(
        { success: false, user: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error('ERROR');
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
