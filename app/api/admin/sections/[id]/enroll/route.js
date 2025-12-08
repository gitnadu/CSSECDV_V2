import { NextResponse } from "next/server";
import { verifyToken } from "lib/auth";

// Enroll student in section (admin)
export async function POST(req, { params }) {
  try {
    const token = req.cookies.get("session")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const { student_id } = await req.json();

    if (!student_id) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    const { query } = await import("lib/db");
    
    // Verify student exists and has student role
    const userCheck = await query(
      `SELECT role FROM users WHERE id = $1`,
      [student_id]
    );

    if (!userCheck.rows[0]) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (userCheck.rows[0].role !== 'student') {
      return NextResponse.json({ error: "User is not a student" }, { status: 400 });
    }

    // Check if section exists and has capacity
    const sectionCheck = await query(
      `SELECT capacity, enrolled_count FROM sections WHERE id = $1`,
      [id]
    );

    if (!sectionCheck.rows[0]) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const section = sectionCheck.rows[0];
    if (section.enrolled_count >= section.capacity) {
      return NextResponse.json({ error: "Section is full" }, { status: 400 });
    }

    // Check if student is already enrolled
    const enrollmentCheck = await query(
      `SELECT id FROM enrollments WHERE student_id = $1 AND section_id = $2`,
      [student_id, id]
    );

    if (enrollmentCheck.rows[0]) {
      return NextResponse.json({ error: "Student already enrolled in this section" }, { status: 400 });
    }

    // Create enrollment
    const result = await query(
      `INSERT INTO enrollments (student_id, section_id) 
       VALUES ($1, $2) 
       RETURNING *`,
      [student_id, id]
    );

    // Increment enrolled_count
    await query(
      `UPDATE sections SET enrolled_count = enrolled_count + 1 WHERE id = $1`,
      [id]
    );

    return NextResponse.json({ 
      success: true, 
      enrollment: result.rows[0] 
    });
  } catch (error) {
    console.error("[Admin] Enroll student error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
