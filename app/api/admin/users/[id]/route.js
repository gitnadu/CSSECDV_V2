import { NextResponse } from "next/server";
import { UserRepository } from "lib/userRepository";
import { verifyToken } from "lib/auth";

// Update user role
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
    const { role } = await req.json();

    if (!role || !['student', 'faculty', 'admin'].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const user = await UserRepository.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update role using query directly
    const { query } = await import("lib/db");
    const result = await query(
      `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, role, first_name, last_name, email`,
      [role, id]
    );

    return NextResponse.json({ 
      success: true, 
      user: result.rows[0] 
    });
  } catch (error) {
    console.error("[Admin] Update user role error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
