import { NextResponse } from "next/server";
import { EnrollmentRepository } from "lib/enrollmentRepository";
import { SectionRepository } from "lib/sectionRepository";
import { verifyToken } from "lib/auth";

export async function POST(req) {
  try {
    const { sectionId } = await req.json();

    // Extract userId from JWT token in session cookie
    const token = req.cookies.get("session")?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload || !payload.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = payload.id;

    // Get the course_id for this section
    const courseId = await SectionRepository.getCourseId(sectionId);
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Section not found" },
        { status: 404 }
      );
    }

    // Check if student has already enrolled in ANY section of this course
    const courseHistory = await EnrollmentRepository.checkStudentCourseHistory(
      userId,
      courseId,
      SectionRepository.findByCourseId
    );

    if (courseHistory.hasRecord) {
      return NextResponse.json(
        { success: false, error: "You are already enrolled in a section of this course" },
        { status: 400 }
      );
    }

    // Check capacity
    const hasCapacity = await SectionRepository.hasAvailableCapacity(sectionId);
    if (!hasCapacity) {
      return NextResponse.json(
        { success: false, error: "Section is full" },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollment = await EnrollmentRepository.create(userId, sectionId);

    // Increment section enrollment count
    await SectionRepository.incrementEnrollment(sectionId);

    // Fetch the enrollment with full details (course, section, professor info)
    const enrichedEnrollment = await EnrollmentRepository.findByIdWithDetails(enrollment.id);

    return NextResponse.json({ success: true, enrollment: enrichedEnrollment });
  } catch (err) {
    console.error("Enroll error:", err);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
