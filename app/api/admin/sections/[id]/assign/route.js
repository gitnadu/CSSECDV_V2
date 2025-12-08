import { NextResponse } from "next/server";
import { SectionRepository } from "lib/sectionRepository";
import { verifyToken } from "lib/auth";

// Assign professor to section
export async function PATCH(req, { params }) {
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
    const { professor_id } = await req.json();

    if (!professor_id) {
      return NextResponse.json({ error: "Professor ID is required" }, { status: 400 });
    }

    // Verify professor exists and has faculty role
    const { query } = await import("lib/db");
    const userCheck = await query(
      `SELECT role FROM users WHERE id = $1`,
      [professor_id]
    );

    if (!userCheck.rows[0]) {
      return NextResponse.json({ error: "Professor not found" }, { status: 404 });
    }

    if (userCheck.rows[0].role !== 'faculty') {
      return NextResponse.json({ error: "User is not a faculty member" }, { status: 400 });
    }

    // Update section professor
    const result = await query(
      `UPDATE sections SET professor_id = $1 WHERE id = $2 RETURNING *`,
      [professor_id, id]
    );

    if (!result.rows[0]) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      section: result.rows[0] 
    });
  } catch (error) {
    console.error('ERROR');
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
