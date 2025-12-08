import { NextResponse } from "next/server";
import { verifyToken } from "lib/auth";

// Get student enrollments
export async function GET(req, { params }) {
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

    const { query } = await import("lib/db");
    
    const result = await query(
      `SELECT e.*, 
              s.section_name,
              s.course_id,
              c.code AS course_code,
              c.name AS course_name
       FROM enrollments e
       JOIN sections s ON e.section_id = s.id
       JOIN courses c ON s.course_id = c.id
       WHERE e.student_id = $1
       ORDER BY c.code`,
      [id]
    );

    return NextResponse.json({ 
      enrollments: result.rows 
    });
  } catch (error) {
    console.error('ERROR');
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Drop student from enrollment
export async function DELETE(req, { params }) {
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
    const { enrollment_id } = await req.json();

    if (!enrollment_id) {
      return NextResponse.json({ error: "Enrollment ID is required" }, { status: 400 });
    }

    const { query } = await import("lib/db");
    
    // Get enrollment info before deleting
    const enrollmentCheck = await query(
      `SELECT section_id FROM enrollments WHERE id = $1 AND student_id = $2`,
      [enrollment_id, id]
    );

    if (!enrollmentCheck.rows[0]) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    const sectionId = enrollmentCheck.rows[0].section_id;

    // Delete enrollment
    await query(
      `DELETE FROM enrollments WHERE id = $1`,
      [enrollment_id]
    );

    // Decrement enrolled_count
    await query(
      `UPDATE sections SET enrolled_count = GREATEST(enrolled_count - 1, 0) WHERE id = $1`,
      [sectionId]
    );

    return NextResponse.json({ 
      success: true 
    });
  } catch (error) {
    console.error('ERROR');
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
