import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

// Verify username and get security questions for password reset
export async function POST(req) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    // Find user
    const userResult = await query(
      `SELECT id FROM users WHERE username = $1`,
      [username]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal if username exists - return generic message
      return NextResponse.json({ 
        error: "Invalid credentials or security questions not configured" 
      }, { status: 404 });
    }

    const userId = userResult.rows[0].id;

    // Get user's security questions
    const questionsResult = await query(
      `SELECT usa.id, usa.question_id, prq.question_text 
       FROM user_security_answers usa
       JOIN password_reset_questions prq ON usa.question_id = prq.id
       WHERE usa.user_id = $1
       ORDER BY usa.id`,
      [userId]
    );

    if (questionsResult.rows.length === 0) {
      return NextResponse.json({ 
        error: "Invalid credentials or security questions not configured" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      questions: questionsResult.rows.map(q => ({
        id: q.id,
        question_id: q.question_id,
        question_text: q.question_text
      }))
    });
  } catch (error) {
    console.error("[Auth] Get user security questions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
