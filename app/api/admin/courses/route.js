import { NextResponse } from "next/server";
import { CourseRepository } from "lib/courseRepository";
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

    const courses = await CourseRepository.findAll();
    
    return NextResponse.json({ courses });
  } catch (error) {
    console.error("[Admin] Get courses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
