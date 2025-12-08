import { NextResponse } from "next/server";
import { query } from "lib/db";
import bcrypt from "bcryptjs";

// Verify security answers and reset password
export async function POST(req) {
  try {
    const { username, answers, new_password } = await req.json();

    if (!username || !answers || !Array.isArray(answers) || !new_password) {

      const logRes = await AuditLogService.logAuthFailure(req, username, 'Password reset failed - missing fields');

      return NextResponse.json({ 
        error: "Username, answers, and new password are required" 
      }, { status: 400 });
    }

    // Validate new password
    if (new_password.length < 12) {

      const logRes = await AuditLogService.logAuthFailure(req, username, 'Password reset failed - weak password');

      return NextResponse.json({ 
        error: "Password must be at least 12 characters long" 
      }, { status: 400 });
    }


    // Find user
    const userResult = await query(
      `SELECT id FROM users WHERE username = $1`,
      [username]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ 
        error: "Invalid credentials or answers" 
      }, { status: 401 });
    }

    const userId = userResult.rows[0].id;

    // Verify all answers
    for (const answer of answers) {
      const { answer_id, answer_text } = answer;

      if (!answer_id || !answer_text) {
        return NextResponse.json({ 
          error: "Invalid credentials or answers" 
        }, { status: 401 });
      }

      // Get the stored answer hash
      const answerResult = await query(
        `SELECT answer_hash FROM user_security_answers WHERE id = $1 AND user_id = $2`,
        [answer_id, userId]
      );

      if (answerResult.rows.length === 0) {
        return NextResponse.json({ 
          error: "Invalid credentials or answers" 
        }, { status: 401 });
      }

      // Normalize answer: lowercase and trim
      const normalizedAnswer = answer_text.trim().toLowerCase();
      const isValid = await bcrypt.compare(normalizedAnswer, answerResult.rows[0].answer_hash);

      if (!isValid) {
        return NextResponse.json({ 
          error: "Invalid credentials or answers" 
        }, { status: 401 });
      }
    }

    // Check password history to prevent re-use (last 5 passwords)
    const historyResult = await query(
      `SELECT password_hash FROM password_history 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [userId]
    );

    for (const row of historyResult.rows) {
      const isMatch = await bcrypt.compare(new_password, row.password_hash);
      if (isMatch) {
        return NextResponse.json({ 
          error: "This password has been used recently. Please choose a different password." 
        }, { status: 400 });
      }
    }

    // All answers verified - update password
    const passwordHash = await bcrypt.hash(new_password, 10);
    
    // Store new password in history
    await query(
      `INSERT INTO password_history (user_id, password_hash, created_at) 
       VALUES ($1, $2, CURRENT_TIMESTAMP)`,
      [userId, passwordHash]
    );
    
    await query(
      `UPDATE users 
       SET password_hash = $1, password_changed_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [passwordHash, userId]
    );

    return NextResponse.json({ 
      success: true,
      message: "Password reset successfully. You can now log in with your new password." 
    });
  } catch (error) {
    console.error('ERROR');
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
