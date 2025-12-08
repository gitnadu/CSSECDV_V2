import { NextResponse } from "next/server";
import { EnrollmentRepository } from "@/lib/enrollmentRepository";
import { SectionRepository } from "@/lib/sectionRepository";
import { verifyToken } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    const courseId = params.id;

    // Extract userId from JWT token in session cookie
    const token = req.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const userId = payload.id;

    const sections = await SectionRepository.findByCourseId(courseId);

    const result = await EnrollmentRepository.checkStudentCourseHistory(
      userId,
      courseId,
      () => sections
    );

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("GET /api/enrollment/check/[id] error:", err);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
