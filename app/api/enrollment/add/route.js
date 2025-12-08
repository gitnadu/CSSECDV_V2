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

    // Check capacity
    const hasCapacity = await SectionRepository.hasAvailableCapacity(sectionId);
    if (!hasCapacity) {
      return NextResponse.json(
        { success: false, error: "Section is full" },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existing = await EnrollmentRepository.findByStudentAndSection(userId, sectionId);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Already enrolled in this section" },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollment = await EnrollmentRepository.create(userId, sectionId);

    // Increment section enrollment count
    await SectionRepository.incrementEnrollment(sectionId);

    return NextResponse.json({ success: true, enrollment });
  } catch (err) {
    console.error("Enroll error:", err);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
