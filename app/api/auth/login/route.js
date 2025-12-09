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

    const user = await UserRepository.authenticate(username, password);

    if (!user) {
      // Record failed login attempt for the username (if user exists)
      await UserRepository.recordFailedLogin(username);

      // Log failed auth attempt
      try {
        
        const logRes = await AuditLogService.logAuthFailure(req, username, 'Invalid credentials');

      } catch (e) {
        console.error('ERROR');
      }

      return NextResponse.json({ error: "Invalid username and/or password" }, { status: 401 });
    }

    // Get the last login information BEFORE recording the new successful login
    const lastLoginInfo = await UserRepository.getLastLoginInfo(user.id);

    // Record the successful login
    await UserRepository.recordSuccessfulLogin(user.id);

    // Log successful auth
    try {
      const successLog = await AuditLogService.logAuthSuccess(req, user.id, user.username);
    } catch (e) {
      console.error('ERROR');
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const expiresAt = getExpirationDate(process.env.JWT_REFRESH_EXPIRY || "7d");
    await UserRepository.storeRefreshToken(user.id, refreshToken, expiresAt);

    const response = NextResponse.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
      // Include last login information for the user
      last_login: lastLoginInfo ? {
        timestamp: lastLoginInfo.last_login_at,
        was_successful: lastLoginInfo.last_login_success,
        last_failed_at: lastLoginInfo.last_failed_login_at
      } : null
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
