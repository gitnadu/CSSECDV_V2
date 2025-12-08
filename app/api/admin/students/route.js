import { NextResponse } from "next/server";
import { UserRepository } from "lib/userRepository";
import { verifyToken } from "lib/auth";

export async function GET(req) {
  try {
    const token = req.cookies.get("session")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const students = await UserRepository.findByRole("student");
    
    return NextResponse.json({ students });
  } catch (error) {
    console.error("[Admin] Get students error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
