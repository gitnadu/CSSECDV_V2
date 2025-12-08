import { NextResponse } from "next/server";
import{ EnrollmentRepository} from "lib/enrollmentRepository";
import { verifyToken } from "lib/auth";

export async function GET(req) {
  try {
    // Extract JWT token from session cookie
    const token = req.cookies.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, enrollments: [] },
        { status: 401 }
      );
    }

    // Verify JWT and extract userId
    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json(
        { success: false, enrollments: [] },
        { status: 401 }
      );
    }

    const enrollments = await EnrollmentRepository.findByProfessorIdWithDetails(payload.id);

    return NextResponse.json({ success: true, enrollments });
  } catch (err) {
    console.error("GET /api/enrollment/me error:", err);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
