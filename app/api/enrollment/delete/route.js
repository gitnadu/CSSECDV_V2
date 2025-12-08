import { NextResponse } from "next/server";
import {EnrollmentRepository} from "lib/enrollmentRepository";
import { SectionRepository } from "lib/sectionRepository";
import { verifyToken } from "lib/auth";

export async function DELETE(req) {
  try {
    const { enrollmentId } = await req.json();

    if (!enrollmentId) {
      return NextResponse.json(
        { success: false, error: "Missing enrollmentId" },
        { status: 400 }
      );
    }

    // Extract userId from JWT token in session cookie
    const token = req.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Attempt to delete the enrollment
    const result = await EnrollmentRepository.delete(enrollmentId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    // Decrement section enrollment count
    await SectionRepository.decrementEnrollment(result.enrollment.section_id);

    return NextResponse.json({
      success: true,
      message: "Enrollment dropped",
      enrollment: result.enrollment,
    });
  } catch (err) {
    console.error('ERROR');
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
