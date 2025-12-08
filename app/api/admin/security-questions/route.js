import { NextResponse } from "next/server";
import { query } from "lib/db";
import { verifyToken } from "lib/auth";

// DELETE - Reset security questions for a user (Admin only)
export async function DELETE(req) {
  try {
    const token = req.cookies.get('session')?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Delete all security questions for the user
    await query(
      `DELETE FROM user_security_answers WHERE user_id = $1`,
      [userId]
    );

    return NextResponse.json({ 
      success: true,
      message: "Security questions reset successfully. User can now set new questions." 
    });
  } catch (error) {
    console.error("[Admin] Reset security questions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
