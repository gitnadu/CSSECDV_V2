import { NextResponse } from "next/server";
import { UserRepository } from "lib/userRepository";
import { verifyToken } from "lib/auth";
import AuditLogService from "@/services/auditLogService";

// Update user role
export async function PATCH(req, { params }) {
  try {
    const token = req.cookies.get("session")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      // Log access denied attempt
      await AuditLogService.logAccessDenied(
        req,
        decoded?.id,
        decoded?.username,
        `/api/admin/users/${id}`,
        'Non-admin attempted to change user role'
      );
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const { role } = await req.json();

    if (!role || !['student', 'faculty', 'admin'].includes(role)) {
      // Log validation failure
      await AuditLogService.logValidationFailure(req, decoded.username, `/api/admin/users/${id}`, {
        error: 'Invalid role value',
        providedRole: role,
        validRoles: ['student', 'faculty', 'admin']
      });
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

    // Log role change
    await AuditLogService.logRoleChange(
      req,
      decoded.id,
      decoded.username,
      parseInt(id),
      user.username,
      role
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
