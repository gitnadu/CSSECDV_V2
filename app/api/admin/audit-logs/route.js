import { NextResponse } from "next/server";
import { verifyToken } from "lib/auth";
import AuditLogService from "@/services/auditLogService";
import { AuditLogRepository } from "lib/auditLogRepository";

/**
 * GET /api/admin/audit-logs
 * Retrieve all audit logs (admin only)
 */
export async function GET(req) {
  try {
    const token = req.cookies.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      // Log access denied
      await AuditLogService.logAccessDenied(
        req,
        decoded?.id,
        decoded?.username,
        "/api/admin/audit-logs",
        "Non-admin attempted to access audit logs"
      );


      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }


    // Get query parameters for pagination
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const logs = await AuditLogRepository.findAll(limit, offset);
    
    return NextResponse.json({
      success: true,
      logs,
      limit,
      offset,
    });
  } catch (error) {
    console.error('ERROR');
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
