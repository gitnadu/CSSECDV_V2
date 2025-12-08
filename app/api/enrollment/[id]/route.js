import { NextResponse } from "next/server";
import EnrollmentRepository from "@/lib/enrollmentRepository";
import SectionRepository from "@/lib/sectionRepository";
import { verifyToken } from "@/lib/auth";

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    // Extract userId from JWT token in session cookie
    const token = req.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload || !payload.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const result = await EnrollmentRepository.delete(id);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    // Decrement section count
    await SectionRepository.decrementEnrollment(result.enrollment.section_id);

    return NextResponse.json({ success: true, message: "Enrollment dropped" });
  } catch (err) {
    console.error("DELETE /api/enrollment/[id] error:", err);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
