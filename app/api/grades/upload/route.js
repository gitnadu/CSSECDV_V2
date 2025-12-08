import { NextResponse } from "next/server";
import {EnrollmentRepository} from "lib/enrollmentRepository";
import { verifyToken } from "lib/auth";
import { SectionRepository } from "lib/sectionRepository";

export async function POST(req) {
  try {
    const { enrollmentId, grade } = await req.json();

    if (!enrollmentId) {
      console.error('ERROR');

      return NextResponse.json({ error: "Missing enrollmentId" }, { status: 400 });
    }

    // Verify session JWT from cookie
    const token = req.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user is faculty and owns the section for this enrollment
    const enrollment = await EnrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    const section = await SectionRepository.findById(enrollment.section_id);
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    // Allow only the professor assigned to the section (or admins if role present)
    if (section.professor_id !== payload.id && payload.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update grade
    const updated = await EnrollmentRepository.updateGrade(enrollmentId, grade);

    if (!updated) {
      return NextResponse.json({ error: "Failed to update grade" }, { status: 500 });
    }

    // Normalize returned object to include both id and enrollment_id if needed
    const normalized = { ...updated, enrollment_id: updated.id };

    return NextResponse.json({ success: true, enrollment: normalized });
  } catch (err) {
    console.error('ERROR');
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
