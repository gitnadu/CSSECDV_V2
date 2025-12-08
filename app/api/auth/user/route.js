import { NextResponse } from "next/server";
import { UserRepository } from "lib/userRepository";
import { verifyToken, generateAccessToken } from "lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const user = await UserRepository.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[Auth] GetUserById error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    // Verify user is authenticated
    const token = req.cookies.get('session')?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.id;
    const body = await req.json();
    const { first_name, last_name, email, current_password, new_password } = body;

    // If changing password, verify current password first
    if (current_password && new_password) {
      const user = await UserRepository.findById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
      if (!isValidPassword) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      // Validate new password
      if (new_password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
      }

      // Update password
      await UserRepository.update(userId, { password: new_password });
      return NextResponse.json({ message: "Password updated successfully" });
    }

    // Update profile information
    const updateData = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (email !== undefined) updateData.email = email;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updatedUser = await UserRepository.update(userId, updateData);
    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    // Generate new session token with updated user data
    const newAccessToken = generateAccessToken(updatedUser);
    
    const response = NextResponse.json({ 
      message: "Profile updated successfully",
      user: updatedUser 
    });

    // Update session cookie with new token containing updated user data
    response.cookies.set("session", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
    });

    return response;
  } catch (error) {
    console.error("[Auth] UpdateUser error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
