import { NextResponse } from "next/server";
import { UserRepository } from "lib/userRepository";
import {
  generateAccessToken,
  generateRefreshToken,
  getExpirationDate,
} from "lib/auth";
import AuditLogService from "@/services/auditLogService";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      // Log validation failure
      await AuditLogService.logValidationFailure(req, username, '/api/auth/login', {
        error: 'Missing username or password in request body'
      });

      return NextResponse.json({ error: "Invalid username and/or password" }, { status: 400 });
    }

    console.log('[Auth] Received login attempt for username:', username);
    const user = await UserRepository.authenticate(username, password);

    if (!user) {
      // Log failed auth attempt
      try {

        const logRes = await AuditLogService.logAuthFailure(req, username, 'Invalid credentials');

      } catch (e) {
        console.error('[Auth] Error while logging auth failure:', e);
      }

      return NextResponse.json({ error: "Invalid username and/or password" }, { status: 401 });
    }

    // Log successful auth
    try {
      const successLog = await AuditLogService.logAuthSuccess(req, user.id, user.username);
      console.log('[Auth] logAuthSuccess result:', successLog ? (successLog.id || true) : false);
    } catch (e) {
      console.error('[Auth] Error while logging auth success:', e);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const expiresAt = getExpirationDate(process.env.JWT_REFRESH_EXPIRY || "7d");
    await UserRepository.storeRefreshToken(user.id, refreshToken, expiresAt);

    const response = NextResponse.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
    });

    // HttpOnly cookie for session security
    response.cookies.set("session", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 3600,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
