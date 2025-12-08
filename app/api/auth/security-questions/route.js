import { NextResponse } from "next/server";
import { query } from "lib/db";
import bcrypt from "bcryptjs";

// Get all available security questions
export async function GET(req) {
  try {
    const result = await query(
      `SELECT id, question_text FROM password_reset_questions ORDER BY id`,
      []
    );

    return NextResponse.json({ questions: result.rows });
  } catch (error) {
    console.error("[Auth] Get security questions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Set security questions and answers for a user (during registration or first-time setup)
export async function POST(req) {
  try {
    const { username, answers } = await req.json();

    if (!username || !answers || !Array.isArray(answers) || answers.length < 3) {
      return NextResponse.json({ 
        error: "Username and at least 3 security question answers are required" 
      }, { status: 400 });
    }

    // Find user
    const userResult = await query(
      `SELECT id FROM users WHERE username = $1`,
      [username]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult.rows[0].id;

    // Check if user already has security questions set
    const existingResult = await query(
      `SELECT COUNT(*) as count FROM user_security_answers WHERE user_id = $1`,
      [userId]
    );

    if (parseInt(existingResult.rows[0].count) > 0) {
      return NextResponse.json({ 
        error: "Security questions already configured" 
      }, { status: 400 });
    }

    // Insert security answers
    for (const answer of answers) {
      const { question_id, answer_text } = answer;

      if (!question_id || !answer_text || answer_text.trim().length < 2) {
        return NextResponse.json({ 
          error: "All answers must be at least 2 characters long" 
        }, { status: 400 });
      }

      // Normalize answer: lowercase and trim for consistent matching
      const normalizedAnswer = answer_text.trim().toLowerCase();
      const answerHash = await bcrypt.hash(normalizedAnswer, 10);

      await query(
        `INSERT INTO user_security_answers (user_id, question_id, answer_hash) 
         VALUES ($1, $2, $3)`,
        [userId, question_id, answerHash]
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Security questions configured successfully" 
    });
  } catch (error) {
    console.error("[Auth] Set security questions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
